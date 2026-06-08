import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, created } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { commentSchema } from '@/lib/validation';
import { addComment } from '@/services/issue.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const { id } = await params;
    const { text } = commentSchema.parse(await req.json());
    const issue = await addComment(id, text, user);
    return created({ issue });
  });
}
