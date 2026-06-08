import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { fail } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/guard';
import { buildExcel, buildPdf, type ReportType, type ReportFormat } from '@/services/report.service';
import { HttpError } from '@/lib/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: ReportType[] = ['issues', 'resolution', 'monthly'];
const FORMATS: ReportFormat[] = ['pdf', 'excel'];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const type = (sp.get('type') ?? 'issues') as ReportType;
    const format = (sp.get('format') ?? 'pdf') as ReportFormat;
    if (!TYPES.includes(type)) return fail('Invalid report type', 400);
    if (!FORMATS.includes(format)) return fail('Invalid report format', 400);

    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'excel') {
      const buffer = await buildExcel(type);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="edufix-${type}-${stamp}.xlsx"`,
        },
      });
    }

    const buffer = await buildPdf(type, user);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="edufix-${type}-${stamp}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status);
    // eslint-disable-next-line no-console
    console.error('Report error:', err);
    return fail('Failed to generate report', 500);
  }
}
