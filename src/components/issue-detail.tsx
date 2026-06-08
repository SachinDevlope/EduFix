'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Loader2,
  MapPin,
  CalendarClock,
  User as UserIcon,
  Send,
  FileVideo,
  History,
  MessageSquare,
  ImageIcon,
  Wrench,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { useIssue, useUpdateIssue, useAddComment, useStaff } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';
import { formatDate, relativeTime, initials } from '@/lib/utils';

export function IssueDetailDialog({
  issueId,
  open,
  onOpenChange,
}: {
  issueId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {issueId ? <IssueDetailBody issueId={issueId} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function IssueDetailBody({ issueId }: { issueId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useIssue(issueId);
  const update = useUpdateIssue(issueId);
  const addComment = useAddComment(issueId);
  const canManage = user?.role === 'admin' || user?.role === 'staff';
  const { data: staffData } = useStaff();

  const [comment, setComment] = React.useState('');

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const { issue, activity } = data;

  async function submitComment() {
    if (!comment.trim()) return;
    try {
      await addComment.mutateAsync(comment.trim());
      setComment('');
    } catch (err) {
      toast({
        title: 'Could not post comment',
        description: err instanceof ApiError ? err.message : 'Error',
        variant: 'error',
      });
    }
  }

  async function patch(payload: Record<string, unknown>, successMsg: string) {
    try {
      await update.mutateAsync(payload);
      toast({ title: successMsg, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Error',
        variant: 'error',
      });
    }
  }

  return (
    <div>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{issue.issueCode}</span>
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
        <DialogTitle className="mt-1 pr-6">{issue.title}</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="details" className="mt-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">
            <History className="mr-1 h-4 w-4" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <ImageIcon className="mr-1 h-4 w-4" /> Evidence
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-1 h-4 w-4" /> Comments
          </TabsTrigger>
        </TabsList>

        {/* DETAILS */}
        <TabsContent value="details" className="space-y-4">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{issue.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info icon={MapPin} label="Location" value={`${issue.building} · ${issue.floor} Floor · ${issue.roomNumber}`} />
            <Info icon={UserIcon} label="Reported by" value={issue.reportedByName} />
            <Info icon={Wrench} label="Assigned staff" value={issue.assignedStaffName ?? 'Not assigned'} />
            <Info icon={CalendarClock} label="Reported on" value={formatDate(issue.createdAt, true)} />
            <Info icon={CalendarClock} label="Est. resolution" value={issue.estimatedResolutionDate ? formatDate(issue.estimatedResolutionDate) : '—'} />
            <Info icon={CalendarClock} label="Resolved on" value={issue.resolvedAt ? formatDate(issue.resolvedAt, true) : '—'} />
          </div>

          {issue.resolutionNotes && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Resolution Notes</p>
              <p className="mt-1 text-sm">{issue.resolutionNotes}</p>
            </div>
          )}

          {canManage && <ManagePanel issue={issue} staff={staffData?.items ?? []} onPatch={patch} pending={update.isPending} />}
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline">
          <ol className="relative space-y-4 border-l pl-6">
            {activity.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity recorded.</p>
            )}
            {activity.map((a) => (
              <li key={a._id} className="relative">
                <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {a.performedByName} · {relativeTime(a.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </TabsContent>

        {/* EVIDENCE */}
        <TabsContent value="evidence">
          {issue.media.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No evidence uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {issue.media.map((m, i) => (
                <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  {m.type === 'image' ? (
                    <Image src={m.url} alt={m.filename ?? 'evidence'} fill sizes="200px" className="object-cover transition hover:scale-105" />
                  ) : (
                    <video src={m.url} className="h-full w-full object-cover" controls />
                  )}
                  {m.type === 'video' && (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                      <FileVideo className="h-3 w-3" /> Video
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </TabsContent>

        {/* COMMENTS */}
        <TabsContent value="comments" className="space-y-4">
          <div className="space-y-3">
            {issue.comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
            )}
            {issue.comments.map((c, i) => (
              <div key={c._id ?? i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(c.authorName)}
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-sm">{c.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.authorName} · {relativeTime(c.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <Button onClick={submitComment} disabled={addComment.isPending || !comment.trim()}>
              {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function ManagePanel({
  issue,
  staff,
  onPatch,
  pending,
}: {
  issue: import('@/types').Issue;
  staff: import('@/types').StaffMember[];
  onPatch: (payload: Record<string, unknown>, msg: string) => void;
  pending: boolean;
}) {
  const [notes, setNotes] = React.useState(issue.resolutionNotes ?? '');
  const [estDate, setEstDate] = React.useState(
    issue.estimatedResolutionDate ? issue.estimatedResolutionDate.slice(0, 10) : '',
  );

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Wrench className="h-4 w-4" /> Manage Issue
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={issue.status} onValueChange={(v) => onPatch({ status: v }, 'Status updated')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ISSUE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={issue.priority} onValueChange={(v) => onPatch({ priority: v }, 'Priority updated')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ISSUE_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Assigned Staff</Label>
          <Select
            value={issue.assignedStaff ?? 'unassigned'}
            onValueChange={(v) => onPatch({ assignedStaff: v === 'unassigned' ? null : v }, 'Assignment updated')}
          >
            <SelectTrigger><SelectValue placeholder="Assign staff" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} · {s.specialization} ({s.activeAssignments})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Estimated Resolution Date</Label>
          <div className="flex gap-2">
            <Input type="date" value={estDate} onChange={(e) => setEstDate(e.target.value)} />
            <Button
              variant="outline"
              onClick={() =>
                onPatch(
                  { estimatedResolutionDate: estDate ? new Date(estDate).toISOString() : null },
                  'Date updated',
                )
              }
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label>Resolution Notes</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes about the repair…" />
        <div className="flex justify-end">
          <Button size="sm" disabled={pending} onClick={() => onPatch({ resolutionNotes: notes }, 'Notes saved')}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
