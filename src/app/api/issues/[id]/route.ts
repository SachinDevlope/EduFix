import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireUser, requireRole } from '@/lib/api/guard';
import { updateIssueSchema } from '@/lib/validation';
import { getIssue, updateIssue } from '@/services/issue.service';
import { listActivity } from '@/services/activity.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const { id } = await params;
    const issue = await getIssue(id, user);
    const activity = await listActivity(id);
    return ok({ issue, activity });
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    // Only admin (and staff for status/notes) may modify; enforce admin here,
    // staff handled via their own assigned flow in the admin panel.
    const user = await requireRole('admin', 'staff');
    await connectDB();
    const { id } = await params;
    const input = updateIssueSchema.parse(await req.json());
    const issue = await updateIssue(id, input, user);
    return ok({ issue });
  });
}
