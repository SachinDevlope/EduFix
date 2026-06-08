import { Types } from 'mongoose';
import Notification, { type NotificationType } from '@/models/Notification';

interface CreateNotificationArgs {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  issueId?: string | Types.ObjectId | null;
  issueCode?: string | null;
}

export async function createNotification(args: CreateNotificationArgs) {
  return Notification.create({
    userId: args.userId,
    type: args.type,
    title: args.title,
    message: args.message,
    issueId: args.issueId ?? null,
    issueCode: args.issueCode ?? null,
  });
}

export async function listNotifications(userId: string, onlyUnread = false) {
  const filter: Record<string, unknown> = { userId };
  if (onlyUnread) filter.isRead = false;
  const [items, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
  return { items, unreadCount };
}

export async function markRead(userId: string, id: string) {
  return Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true },
  ).lean();
}

export async function markAllRead(userId: string) {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

export async function deleteNotification(userId: string, id: string) {
  return Notification.findOneAndDelete({ _id: id, userId }).lean();
}
