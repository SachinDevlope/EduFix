'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ListChecks, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { IssueDetailDialog } from '@/components/issue-detail';
import { useIssues, type IssueFilters } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

const ALL = 'all';

function TrackingInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [category, setCategory] = React.useState(ALL);
  const [status, setStatus] = React.useState(ALL);
  const [priority, setPriority] = React.useState(ALL);
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [page, setPage] = React.useState(1);

  const [selected, setSelected] = React.useState<string | null>(params.get('issue'));
  const [open, setOpen] = React.useState(!!params.get('issue'));

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters: IssueFilters = {
    search: debounced || undefined,
    category: category === ALL ? undefined : category,
    status: status === ALL ? undefined : status,
    priority: priority === ALL ? undefined : priority,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading } = useIssues(filters);

  function openIssue(id: string) {
    setSelected(id);
    setOpen(true);
  }

  function resetFilters() {
    setSearch('');
    setCategory(ALL);
    setStatus(ALL);
    setPriority(ALL);
    setFrom('');
    setTo('');
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'All Issues' : 'Track My Issues'}
        description="Search, filter and follow the status of reported issues."
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ID or keywords…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <FilterSelect label="Category" value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={ISSUE_CATEGORIES} />
          <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={ISSUE_STATUSES} />
          <FilterSelect label="Priority" value={priority} onChange={(v) => { setPriority(v); setPage(1); }} options={ISSUE_PRIORITIES} />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <Filter className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState icon={ListChecks} title="No issues found" description="Try adjusting your filters or report a new issue." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((issue) => (
                  <TableRow key={issue._id} className="cursor-pointer" onClick={() => openIssue(issue._id)}>
                    <TableCell className="font-mono text-xs">{issue.issueCode}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">{issue.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{issue.category}</TableCell>
                    <TableCell><PriorityBadge priority={issue.priority} /></TableCell>
                    <TableCell><StatusBadge status={issue.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(issue.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{issue.assignedStaffName ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openIssue(issue._id); }}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} issues
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <IssueDetailDialog issueId={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All {label}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-96" />}>
      <TrackingInner />
    </React.Suspense>
  );
}
