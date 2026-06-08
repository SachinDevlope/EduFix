import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE, type Role } from '@/lib/constants';
import { env } from '@/lib/env';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface TokenSubject {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Issue fresh access + refresh tokens and store them as httpOnly cookies.
 */
export async function createSession(user: TokenSubject, remember = true): Promise<void> {
  const subject = { sub: user.id, email: user.email, name: user.name, role: user.role };
  const [access, refresh] = await Promise.all([
    signAccessToken(subject),
    signRefreshToken(subject),
  ]);

  const store = await cookies();
  const base = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  store.set(ACCESS_COOKIE, access, {
    ...base,
    maxAge: env.accessExpiresMin * 60,
  });
  store.set(REFRESH_COOKIE, refresh, {
    ...base,
    // "remember me" controls refresh-token persistence: session cookie otherwise.
    ...(remember ? { maxAge: env.refreshExpiresDays * 24 * 60 * 60 } : {}),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/**
 * Resolve the current user from the access cookie. Falls back to the refresh
 * cookie and silently rotates the access token when it has expired.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  if (access) {
    const payload = await verifyAccessToken(access);
    if (payload) {
      return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
    }
  }

  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const payload = await verifyRefreshToken(refresh);
    if (payload) {
      const subject = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
      // Rotate the access token transparently.
      try {
        await createSession(subject, true);
      } catch {
        /* cookies() may be read-only in some contexts; ignore. */
      }
      return subject;
    }
  }

  return null;
}
