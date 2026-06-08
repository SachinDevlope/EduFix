import { NextRequest } from 'next/server';
import { handle, ok, fail } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { uploadFile } from '@/services/upload.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireUser();
    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) return fail('No files provided', 400);
    if (files.length > 10) return fail('You can upload at most 10 files at once', 400);

    const uploaded = await Promise.all(files.map((f) => uploadFile(f)));
    return ok({ media: uploaded });
  });
}
