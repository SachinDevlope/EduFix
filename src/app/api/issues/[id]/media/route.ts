import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { mediaSchema } from '@/lib/validation';
import { addMedia } from '@/services/issue.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const { id } = await params;
    const { media } = z.object({ media: z.array(mediaSchema).min(1) }).parse(await req.json());
    const issue = await addMedia(id, media, user);
    return ok({ issue });
  });
}
