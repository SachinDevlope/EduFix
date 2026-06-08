import { Badge } from '@/components/ui/badge';
import type { IssueStatus, IssuePriority } from '@/lib/constants';

const STATUS_VARIANT: Record<IssueStatus, 'secondary' | 'default' | 'warning' | 'success'> = {
  Pending: 'secondary',
  Assigned: 'default',
  'In Progress': 'warning',
  Resolved: 'success',
};

const PRIORITY_VARIANT: Record<IssuePriority, 'secondary' | 'default' | 'warning' | 'destructive'> = {
  Low: 'secondary',
  Medium: 'default',
  High: 'warning',
  Critical: 'destructive',
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>;
}
