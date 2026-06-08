'use client';

import * as React from 'react';
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const REPORTS = [
  { type: 'issues', title: 'All Issues Report', desc: 'Complete list of every reported issue with current status.' },
  { type: 'resolution', title: 'Resolution Report', desc: 'All resolved issues with reporters, staff and resolution dates.' },
  { type: 'monthly', title: 'Monthly Report', desc: 'Issues overview for monthly review and stakeholder updates.' },
] as const;

export function AdminReports() {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function download(type: string, format: 'pdf' | 'excel') {
    const key = `${type}-${format}`;
    setBusy(key);
    try {
      const res = await fetch(`/api/reports?type=${type}&format=${format}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edufix-${type}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Report downloaded', variant: 'success' });
    } catch {
      toast({ title: 'Could not generate report', variant: 'error' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {REPORTS.map((r) => (
        <Card key={r.type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4 text-primary" /> {r.title}
            </CardTitle>
            <CardDescription>{r.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => download(r.type, 'pdf')} disabled={busy === `${r.type}-pdf`}>
              {busy === `${r.type}-pdf` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => download(r.type, 'excel')} disabled={busy === `${r.type}-excel`}>
              {busy === `${r.type}-excel` ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Excel
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
