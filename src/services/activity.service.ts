import { Types } from 'mongoose';
import ActivityLog from '@/models/ActivityLog';
import type { ActivityAction } from '@/lib/constants';

interface LogArgs {
  issueId: string | Types.ObjectId;
  issueCode: string;
  action: ActivityAction;
  message: string;
  performedBy: string | Types.ObjectId;
  performedByName: string;
  meta?: Record<string, unknown>;
}

export async function logActivity(args: LogArgs) {
  return ActivityLog.create(args);
}

export async function listActivity(issueId: string) {
  return ActivityLog.find({ issueId }).sort({ createdAt: 1 }).lean();
}
