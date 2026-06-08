import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/guard';
import { updateStaffSchema } from '@/lib/validation';
import { updateStaff } from '@/services/user.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const input = updateStaffSchema.parse(await req.json());
    const staff = await updateStaff(id, input);
    return ok({ staff });
  });
}
