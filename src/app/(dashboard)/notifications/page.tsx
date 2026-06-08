'use client';

import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { useNotifications, useNotificationActions } from '@/hooks/use-api';
import { relativeTime, cn } from '@/lib/utils';

const ICONS: Record<string, typeof Bell> = {
  status_update: Info,
  assignment: Wrench,
  resolution: CheckCircle2,
  reminder: AlertCircle,
  comment: MessageSquare,
  system: BellRing,
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { markRead, markAllRead, remove } = useNotificationActions();
  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" description={unread > 0 ? `You have ${unread} unread notification${unread === 1 ? '' : 's'}.` : 'You are all caught up.'}>
        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={unread === 0 || markAllRead.isPending}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Updates about your reported issues will appear here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <Card key={n._id} className={cn('transition', !n.isRead && 'border-primary/40 bg-primary/5')}>
                <CardContent className="flex items-start gap-3 py-4">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', n.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary')}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.issueCode ? `${n.issueCode} · ` : ''}{relativeTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.isRead && (
                      <Button variant="ghost" size="icon" aria-label="Mark read" onClick={() => markRead.mutate(n._id)}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive" onClick={() => remove.mutate(n._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
