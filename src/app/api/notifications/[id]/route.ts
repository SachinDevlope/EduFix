import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok, fail } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { markRead, deleteNotification } from '@/services/notification.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// Mark a single notification as read
export async function PATCH(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const { id } = await params;
    const updated = await markRead(user.id, id);
    if (!updated) return fail('Notification not found', 404);
    return ok({ notification: updated });
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const { id } = await params;
    const deleted = await deleteNotification(user.id, id);
    if (!deleted) return fail('Notification not found', 404);
    return ok({ message: 'Notification deleted' });
  });
}
