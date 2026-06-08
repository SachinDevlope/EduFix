import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { listNotifications, markAllRead } from '@/services/notification.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const onlyUnread = req.nextUrl.searchParams.get('unread') === 'true';
    const result = await listNotifications(user.id, onlyUnread);
    return ok(result);
  });
}

// Mark all as read
export async function PATCH() {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    await markAllRead(user.id);
    return ok({ message: 'All notifications marked as read' });
  });
}
