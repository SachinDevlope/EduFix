import { Types } from 'mongoose';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { HttpError } from '@/lib/api/response';
import { STATUS_FLOW, type IssueStatus } from '@/lib/constants';
import type { CreateIssueInput, UpdateIssueInput, IssueQuery } from '@/lib/validation';
import type { SessionUser } from '@/lib/auth/session';
import { logActivity } from './activity.service';
import { createNotification } from './notification.service';

/** Generate the next human-friendly issue code, e.g. ISS-2026-0042. */
async function nextIssueCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ISS-${year}-`;
  const last = await Issue.findOne({ issueCode: { $regex: `^${prefix}` } })
    .sort({ issueCode: -1 })
    .select('issueCode')
    .lean();
  let seq = 1;
  if (last?.issueCode) {
    seq = parseInt(last.issueCode.slice(prefix.length), 10) + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

async function notifyAdmins(args: {
  type: 'status_update' | 'assignment' | 'resolution' | 'reminder' | 'comment' | 'system';
  title: string;
  message: string;
  issueId: Types.ObjectId;
  issueCode: string;
  excludeUserId?: string;
}) {
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id').lean();
  await Promise.all(
    admins
      .filter((a) => String(a._id) !== args.excludeUserId)
      .map((a) =>
        createNotification({
          userId: a._id as Types.ObjectId,
          type: args.type,
          title: args.title,
          message: args.message,
          issueId: args.issueId,
          issueCode: args.issueCode,
        }),
      ),
  );
}

export async function createIssue(input: CreateIssueInput, user: SessionUser) {
  const issueCode = await nextIssueCode();
  const issue = await Issue.create({
    ...input,
    issueCode,
    reportedBy: user.id,
    reportedByName: user.name,
  });

  await logActivity({
    issueId: issue._id,
    issueCode,
    action: 'created',
    message: `${user.name} reported this issue`,
    performedBy: user.id,
    performedByName: user.name,
  });

  await notifyAdmins({
    type: 'system',
    title: 'New issue reported',
    message: `${issueCode}: "${issue.title}" (${issue.priority}) was reported by ${user.name}.`,
    issueId: issue._id,
    issueCode,
    excludeUserId: user.id,
  });

  return issue.toJSON();
}

export async function listIssues(query: IssueQuery, user: SessionUser) {
  const filter: Record<string, unknown> = {};

  // RBAC scoping: non-admin/staff users only see their own issues unless they explicitly ask.
  if (user.role === 'parent' || user.role === 'teacher') {
    filter.reportedBy = user.id;
  } else if (user.role === 'staff') {
    if (query.mine) filter.assignedStaff = user.id;
  }

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  if (query.from || query.to) {
    const createdAt: Record<string, Date> = {};
    if (query.from) createdAt.$gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
    filter.createdAt = createdAt;
  }

  if (query.search) {
    const rx = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { issueCode: rx }];
  }

  const sortField = query.sort?.replace('-', '') || 'createdAt';
  const sortDir = query.sort?.startsWith('-') === false ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortDir };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Issue.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Issue.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getIssue(id: string, user: SessionUser) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid issue id', 400);
  const issue = await Issue.findById(id).lean();
  if (!issue) throw new HttpError('Issue not found', 404);

  // Scope: reporters can only read their own; staff can read assigned + any; admin all.
  if (
    (user.role === 'parent' || user.role === 'teacher') &&
    String(issue.reportedBy) !== user.id
  ) {
    throw new HttpError('You do not have access to this issue', 403);
  }
  return issue;
}

export async function updateIssue(id: string, input: UpdateIssueInput, user: SessionUser) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid issue id', 400);
  const issue = await Issue.findById(id);
  if (!issue) throw new HttpError('Issue not found', 404);

  const changes: string[] = [];

  // --- Status transition ---
  if (input.status && input.status !== issue.status) {
    const allowed = STATUS_FLOW[issue.status as IssueStatus] ?? [];
    if (!allowed.includes(input.status)) {
      throw new HttpError(
        `Cannot change status from "${issue.status}" to "${input.status}"`,
        422,
      );
    }
    const prev = issue.status;
    issue.status = input.status;
    if (input.status === 'Resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = null;
    }
    changes.push(`status ${prev} → ${input.status}`);
    await logActivity({
      issueId: issue._id,
      issueCode: issue.issueCode,
      action: input.status === 'Resolved' ? 'resolved' : 'status_changed',
      message: `${user.name} changed status from ${prev} to ${input.status}`,
      performedBy: user.id,
      performedByName: user.name,
    });
    await createNotification({
      userId: issue.reportedBy,
      type: input.status === 'Resolved' ? 'resolution' : 'status_update',
      title:
        input.status === 'Resolved' ? 'Your issue was resolved' : 'Issue status updated',
      message: `${issue.issueCode}: "${issue.title}" is now ${input.status}.`,
      issueId: issue._id,
      issueCode: issue.issueCode,
    });
  }

  // --- Priority ---
  if (input.priority && input.priority !== issue.priority) {
    const prev = issue.priority;
    issue.priority = input.priority;
    changes.push(`priority ${prev} → ${input.priority}`);
    await logActivity({
      issueId: issue._id,
      issueCode: issue.issueCode,
      action: 'priority_changed',
      message: `${user.name} changed priority from ${prev} to ${input.priority}`,
      performedBy: user.id,
      performedByName: user.name,
    });
  }

  // --- Assignment ---
  if (input.assignedStaff !== undefined) {
    if (input.assignedStaff === null) {
      issue.assignedStaff = null;
      issue.assignedStaffName = null;
      changes.push('unassigned staff');
    } else {
      if (!Types.ObjectId.isValid(input.assignedStaff)) {
        throw new HttpError('Invalid staff id', 400);
      }
      const staff = await User.findOne({ _id: input.assignedStaff, role: 'staff' });
      if (!staff) throw new HttpError('Selected staff member not found', 404);
      issue.assignedStaff = staff._id;
      issue.assignedStaffName = staff.name;
      // Auto-advance Pending → Assigned on first assignment.
      if (issue.status === 'Pending') {
        issue.status = 'Assigned';
        changes.push('status Pending → Assigned');
      }
      changes.push(`assigned to ${staff.name}`);
      await logActivity({
        issueId: issue._id,
        issueCode: issue.issueCode,
        action: 'assigned',
        message: `${user.name} assigned this issue to ${staff.name}`,
        performedBy: user.id,
        performedByName: user.name,
      });
      await createNotification({
        userId: staff._id,
        type: 'assignment',
        title: 'New repair assigned to you',
        message: `${issue.issueCode}: "${issue.title}" (${issue.priority}) has been assigned to you.`,
        issueId: issue._id,
        issueCode: issue.issueCode,
      });
      await createNotification({
        userId: issue.reportedBy,
        type: 'assignment',
        title: 'Your issue was assigned',
        message: `${issue.issueCode} has been assigned to ${staff.name}.`,
        issueId: issue._id,
        issueCode: issue.issueCode,
      });
    }
  }

  // --- Estimated resolution date ---
  if (input.estimatedResolutionDate !== undefined) {
    issue.estimatedResolutionDate = input.estimatedResolutionDate
      ? new Date(input.estimatedResolutionDate)
      : null;
    changes.push('updated estimated resolution date');
  }

  // --- Resolution notes ---
  if (input.resolutionNotes !== undefined) {
    issue.resolutionNotes = input.resolutionNotes;
    changes.push('updated resolution notes');
  }

  if (changes.length === 0) {
    throw new HttpError('No changes supplied', 400);
  }

  await issue.save();
  return issue.toJSON();
}

export async function addComment(id: string, text: string, user: SessionUser) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid issue id', 400);
  const issue = await Issue.findById(id);
  if (!issue) throw new HttpError('Issue not found', 404);

  // Reporters may comment on their own issues; staff/admin on any.
  if (
    (user.role === 'parent' || user.role === 'teacher') &&
    String(issue.reportedBy) !== user.id
  ) {
    throw new HttpError('You do not have access to this issue', 403);
  }

  issue.comments.push({
    text,
    authorId: new Types.ObjectId(user.id),
    authorName: user.name,
    createdAt: new Date(),
  });
  await issue.save();

  await logActivity({
    issueId: issue._id,
    issueCode: issue.issueCode,
    action: 'commented',
    message: `${user.name} commented`,
    performedBy: user.id,
    performedByName: user.name,
  });

  // Notify the reporter (if someone else commented) and assigned staff.
  const recipients = new Set<string>();
  if (String(issue.reportedBy) !== user.id) recipients.add(String(issue.reportedBy));
  if (issue.assignedStaff && String(issue.assignedStaff) !== user.id) {
    recipients.add(String(issue.assignedStaff));
  }
  await Promise.all(
    [...recipients].map((rid) =>
      createNotification({
        userId: rid,
        type: 'comment',
        title: 'New comment on an issue',
        message: `${user.name} commented on ${issue.issueCode}.`,
        issueId: issue._id,
        issueCode: issue.issueCode,
      }),
    ),
  );

  return issue.toJSON();
}

export async function addMedia(
  id: string,
  media: { url: string; type: 'image' | 'video'; publicId?: string; filename?: string }[],
  user: SessionUser,
) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid issue id', 400);
  const issue = await Issue.findById(id);
  if (!issue) throw new HttpError('Issue not found', 404);
  issue.media.push(...media);
  await issue.save();
  await logActivity({
    issueId: issue._id,
    issueCode: issue.issueCode,
    action: 'media_added',
    message: `${user.name} added ${media.length} file(s)`,
    performedBy: user.id,
    performedByName: user.name,
  });
  return issue.toJSON();
}
