import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok, created } from '@/lib/api/response';
import { requireRole, requireAdmin } from '@/lib/api/guard';
import { createStaffSchema } from '@/lib/validation';
import { listStaff, createStaff } from '@/services/user.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    // Admins and staff can view the staff roster (used for assignment dropdowns).
    await requireRole('admin', 'staff');
    await connectDB();
    const search = req.nextUrl.searchParams.get('search') ?? undefined;
    const items = await listStaff(search);
    return ok({ items });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireAdmin();
    await connectDB();
    const input = createStaffSchema.parse(await req.json());
    const staff = await createStaff(input);
    return created({ staff });
  });
}
