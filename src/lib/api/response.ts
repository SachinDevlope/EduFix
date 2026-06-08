import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? init : (init as ResponseInit)?.status ?? 200;
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

/** Custom error carrying an HTTP status; thrown inside services/handlers. */
export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Wrap a route handler body so thrown errors become consistent JSON responses.
 */
export function handle(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  return fn().catch((err: unknown) => {
    if (err instanceof HttpError) {
      return fail(err.message, err.status, err.details);
    }
    if (err instanceof ZodError) {
      return fail('Validation failed', 422, err.flatten());
    }
    // Duplicate key (e.g. email already used)
    if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
      return fail('A record with that value already exists', 409);
    }
    // eslint-disable-next-line no-console
    console.error('Unhandled API error:', err);
    return fail('Internal server error', 500);
  });
}
