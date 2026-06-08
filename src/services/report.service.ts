import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Issue from '@/models/Issue';
import { getAnalytics } from './analytics.service';
import type { SessionUser } from '@/lib/auth/session';

export type ReportType = 'issues' | 'resolution' | 'monthly';
export type ReportFormat = 'pdf' | 'excel';

interface ReportRow {
  issueCode: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  reportedByName: string;
  assignedStaffName: string;
  createdAt: string;
  resolvedAt: string;
}

async function getRows(type: ReportType): Promise<ReportRow[]> {
  const filter: Record<string, unknown> = {};
  if (type === 'resolution') filter.status = 'Resolved';
  const issues = await Issue.find(filter).sort({ createdAt: -1 }).limit(1000).lean();
  return issues.map((i) => ({
    issueCode: i.issueCode,
    title: i.title,
    category: i.category,
    priority: i.priority,
    status: i.status,
    reportedByName: i.reportedByName,
    assignedStaffName: i.assignedStaffName ?? '—',
    createdAt: new Date(i.createdAt).toLocaleDateString(),
    resolvedAt: i.resolvedAt ? new Date(i.resolvedAt).toLocaleDateString() : '—',
  }));
}

const TITLES: Record<ReportType, string> = {
  issues: 'All Issues Report',
  resolution: 'Resolution Report',
  monthly: 'Monthly Issues Report',
};

export async function buildExcel(type: ReportType): Promise<Buffer> {
  const rows = await getRows(type);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EduFix';
  const ws = wb.addWorksheet(TITLES[type]);

  ws.columns = [
    { header: 'Issue ID', key: 'issueCode', width: 16 },
    { header: 'Title', key: 'title', width: 38 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Reported By', key: 'reportedByName', width: 22 },
    { header: 'Assigned Staff', key: 'assignedStaffName', width: 22 },
    { header: 'Created', key: 'createdAt', width: 14 },
    { header: 'Resolved', key: 'resolvedAt', width: 14 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1D4ED8' },
  };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rows.forEach((r) => ws.addRow(r));

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function buildPdf(type: ReportType, user: SessionUser): Promise<Buffer> {
  const rows = await getRows(type);
  const analytics = await getAnalytics(user);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).fillColor('#1d4ed8').text('EduFix', { continued: true });
    doc.fillColor('#334155').fontSize(12).text('  —  School Facility Reporting Portal');
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor('#0f172a').text(TITLES[type]);
    doc.fontSize(9).fillColor('#64748b').text(`Generated ${new Date().toLocaleString()}`);
    doc.moveDown(0.6);

    // Summary line
    const total = analytics.statusData.reduce((s, d) => s + d.value, 0);
    const resolved = analytics.statusData.find((d) => d.name === 'Resolved')?.value ?? 0;
    doc
      .fontSize(10)
      .fillColor('#0f172a')
      .text(
        `Total issues: ${total}    Resolved: ${resolved}    Resolution rate: ${
          total ? Math.round((resolved / total) * 100) : 0
        }%`,
      );
    doc.moveDown(0.6);

    // Table
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Reporter', 'Staff', 'Created'];
    const widths = [70, 200, 75, 60, 70, 95, 95, 60];
    const startX = doc.x;
    let y = doc.y;

    const drawRow = (cells: string[], bold = false, bg?: string) => {
      if (bg) {
        doc.rect(startX, y - 2, widths.reduce((a, b) => a + b, 0), 16).fill(bg);
      }
      doc.fillColor(bold ? '#ffffff' : '#0f172a').fontSize(8).font(bold ? 'Helvetica-Bold' : 'Helvetica');
      let x = startX;
      cells.forEach((c, i) => {
        doc.text(c, x + 3, y, { width: widths[i] - 6, ellipsis: true, lineBreak: false });
        x += widths[i];
      });
      y += 16;
      if (y > 520) {
        doc.addPage();
        y = 40;
      }
    };

    drawRow(headers, true, '#1d4ed8');
    rows.forEach((r, idx) => {
      drawRow(
        [
          r.issueCode,
          r.title,
          r.category,
          r.priority,
          r.status,
          r.reportedByName,
          r.assignedStaffName,
          r.createdAt,
        ],
        false,
        idx % 2 ? '#f1f5f9' : undefined,
      );
    });

    doc.end();
  });
}
