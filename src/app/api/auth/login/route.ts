import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, ok } from '@/lib/api/response';
import { loginSchema } from '@/lib/validation';
import { authenticate } from '@/services/auth.service';
import { createSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handle(async () => {
    await connectDB();
    const body = await req.json();
    const input = loginSchema.parse(body);
    const user = await authenticate(input);
    await createSession(
      { id: user.id, email: user.email, name: user.name, role: user.role as never },
      input.remember,
    );
    return ok({ user });
  });
}
