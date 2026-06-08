import { connectDB } from '@/lib/db';
import { handle, ok, fail } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/auth.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return fail('Not authenticated', 401);
    await connectDB();
    const user = await getUserById(session.id);
    if (!user) return fail('Not authenticated', 401);
    return ok({ user });
  });
}
