import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/guard';
import { listUsers } from '@/services/user.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAdmin();
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const result = await listUsers({
      role: sp.get('role') ?? undefined,
      status: sp.get('status') ?? undefined,
      search: sp.get('search') ?? undefined,
      page: sp.get('page') ? Number(sp.get('page')) : 1,
      limit: sp.get('limit') ? Number(sp.get('limit')) : 50,
    });
    return ok(result);
  });
}
