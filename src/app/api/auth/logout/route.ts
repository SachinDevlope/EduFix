import { handle, ok } from '@/lib/api/response';
import { destroySession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return handle(async () => {
    await destroySession();
    return ok({ message: 'Logged out' });
  });
}
