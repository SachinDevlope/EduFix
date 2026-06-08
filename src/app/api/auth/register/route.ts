import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { handle, created } from '@/lib/api/response';
import { registerSchema } from '@/lib/validation';
import { registerUser } from '@/services/auth.service';
import { createSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handle(async () => {
    await connectDB();
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as never });
    return created({ user });
  });
}
