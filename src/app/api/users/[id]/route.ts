import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireUser, requireAdmin } from '@/lib/api/guard';
import { updateUserSchema } from '@/lib/validation';
import { setUserStatus, updateProfile } from '@/services/user.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireUser();
    await connectDB();
    const { id } = await params;
    const input = updateUserSchema.parse(await req.json());

    // Admins can change anyone's status; users can edit their own profile only.
    if (input.status !== undefined) {
      await requireAdmin();
      const user = await setUserStatus(id, input.status);
      return ok({ user });
    }

    if (id !== session.id && session.role !== 'admin') {
      const { fail } = await import('@/lib/api/response');
      return fail('You can only edit your own profile', 403);
    }
    const user = await updateProfile(id, {
      name: input.name,
      phone: input.phone,
      profileImage: input.profileImage,
    });
    return ok({ user });
  });
}
