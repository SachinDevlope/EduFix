import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok, created } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { createIssueSchema, issueQuerySchema } from '@/lib/validation';
import { createIssue, listIssues } from '@/services/issue.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = issueQuerySchema.parse(params);
    const result = await listIssues(query, user);
    return ok(result);
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    await connectDB();
    const input = createIssueSchema.parse(await req.json());
    const issue = await createIssue(input, user);
    return created({ issue });
  });
}
