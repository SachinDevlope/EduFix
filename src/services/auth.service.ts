import User from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { HttpError } from '@/lib/api/response';
import type { RegisterInput, LoginInput } from '@/lib/validation';

import type { Role, UserStatus } from '@/lib/constants';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  profileImage?: string;
  phone?: string;
  schoolId: string;
}

function toPublic(user: {
  _id: unknown;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  profileImage?: string;
  phone?: string;
  schoolId: string;
}): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    phone: user.phone,
    schoolId: user.schoolId,
  };
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new HttpError('An account with that email already exists', 409);
  }
  const password = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password,
    role: input.role,
  });
  return toPublic(user);
}

export async function authenticate(input: LoginInput): Promise<PublicUser> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user) throw new HttpError('Invalid email or password', 401);
  if (user.status === 'inactive') {
    throw new HttpError('Your account has been deactivated. Contact an administrator.', 403);
  }
  const valid = await verifyPassword(input.password, user.password);
  if (!valid) throw new HttpError('Invalid email or password', 401);
  return toPublic(user);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await User.findById(id).lean();
  if (!user) return null;
  return toPublic(user as never);
}
