import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { getAnalytics } from '@/services/analytics.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const data = await getAnalytics(user);
    return ok(data);
  });
}
