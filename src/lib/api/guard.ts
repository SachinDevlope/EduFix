import { getSession, type SessionUser } from '@/lib/auth/session';
import { HttpError } from './response';
import type { Role } from '@/lib/constants';

/** Require an authenticated user, else 401. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new HttpError('Authentication required', 401);
  return user;
}

/** Require one of the given roles, else 403. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new HttpError('You do not have permission to perform this action', 403);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole('admin');
}
