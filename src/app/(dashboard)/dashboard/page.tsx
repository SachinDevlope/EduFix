'use client';

import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  FilePlus2,
  ListChecks,
  Bell,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { CategoryPie, MonthlyTrend } from '@/components/charts';
import { useDashboardStats, useAnalytics } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { relativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: analytics } = useAnalytics();

  const k = stats?.kpis;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`}
        description="Here's an overview of facility issues and their progress."
      >
        <Button asChild>
          <Link href="/report-issue">
            <FilePlus2 className="h-4 w-4" /> Report Issue
          </Link>
        </Button>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !k ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <KpiCard label="Total Issues" value={k.total} icon={ClipboardList} tone="primary" />
            <KpiCard label="Pending" value={k.pending} icon={Clock} tone="warning" />
            <KpiCard label="In Progress" value={k.inProgress} icon={Loader2} tone="accent" />
            <KpiCard label="Resolved" value={k.resolved} icon={CheckCircle2} tone="success" />
          </>
        )}
      </div>

      {/* Secondary KPIs */}
      {k && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Resolution Rate"
            value={`${k.resolutionRate}%`}
            icon={TrendingUp}
            tone="success"
          />
          <KpiCard
            label="Avg Resolution Time"
            value={k.avgResolutionHours ? `${k.avgResolutionHours} hrs` : '—'}
            icon={Timer}
            tone="primary"
          />
          <KpiCard label="Critical Issues" value={k.critical} icon={AlertOctagon} tone="destructive" />
        </div>
      )}

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Distribution across facility categories</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <CategoryPie data={analytics.categoryData} />
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reported vs Resolved</CardTitle>
            <CardDescription>Monthly trend</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics ? <MonthlyTrend data={analytics.monthlyData} /> : <Skeleton className="h-[300px]" />}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity + Quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest issue updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)
            ) : stats.recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              stats.recent.map((issue) => (
                <Link
                  key={issue._id}
                  href={`/tracking?issue=${issue._id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.issueCode} · {issue.category} · updated {relativeTime(issue.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/report-issue">
                <FilePlus2 className="h-4 w-4" /> Report a new issue
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/tracking">
                <ListChecks className="h-4 w-4" /> Track my issues
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/notifications">
                <Bell className="h-4 w-4" /> View notifications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
