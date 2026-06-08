'use client';

import { ClipboardList, CheckCircle2, Timer, Users, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CategoryPie,
  PriorityBar,
  MonthlyTrend,
  ResolutionTimeBar,
  StatusBar,
} from '@/components/charts';
import { useAnalytics, useDashboardStats } from '@/hooks/use-api';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();
  const { data: stats } = useDashboardStats();
  const k = stats?.kpis;

  return (
    <div>
      <PageHeader title="Analytics & Reports" description="Insights into facility issues, resolution and engagement." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!k ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <KpiCard label="Total Issues" value={k.total} icon={ClipboardList} tone="primary" />
            <KpiCard label="Resolved %" value={`${k.resolutionRate}%`} icon={CheckCircle2} tone="success" />
            <KpiCard label="Avg Resolution" value={k.avgResolutionHours ? `${k.avgResolutionHours} hrs` : '—'} icon={Timer} tone="accent" />
            <KpiCard label="Active Users" value={data?.engagement.activeUsers ?? '—'} icon={Users} tone="primary" hint={data ? `${data.engagement.totalUsers} total` : undefined} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Issues by Category" desc="Where problems are concentrated">
          {data ? <CategoryPie data={data.categoryData} /> : <Skeleton className="h-[300px]" />}
        </ChartCard>
        <ChartCard title="Issues by Priority" desc="Severity distribution">
          {data ? <PriorityBar data={data.priorityData} /> : <Skeleton className="h-[300px]" />}
        </ChartCard>
        <ChartCard title="Monthly Issue Trends" desc="Reported vs resolved over time">
          {data ? <MonthlyTrend data={data.monthlyData} /> : <Skeleton className="h-[300px]" />}
        </ChartCard>
        <ChartCard title="Status Breakdown" desc="Current pipeline state">
          {data ? <StatusBar data={data.statusData} /> : <Skeleton className="h-[300px]" />}
        </ChartCard>
        <ChartCard title="Avg Resolution Time by Category" desc="Hours to resolve (resolved issues)" className="lg:col-span-2">
          {data && data.resolutionTimeData.length > 0 ? (
            <ResolutionTimeBar data={data.resolutionTimeData} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {data ? 'No resolved issues yet to measure resolution time.' : ''}
              {!data && <Skeleton className="h-[200px]" />}
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  desc,
  className,
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
