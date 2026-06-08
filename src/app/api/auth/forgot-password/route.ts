import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handle, ok } from '@/lib/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Forgot-password endpoint. In this demo it always returns success without
 * revealing whether an account exists (avoids user enumeration). Wiring an
 * email provider (e.g. Resend/SES) is the only step needed for production.
 */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const { email } = z.object({ email: z.string().email() }).parse(await req.json());
    // TODO: generate a reset token, persist it, and email a reset link.
    return ok({
      message: `If an account exists for ${email}, a password reset link has been sent.`,
    });
  });
}
