import { Types } from 'mongoose';
import User from '@/models/User';
import Issue from '@/models/Issue';
import { hashPassword } from '@/lib/auth/password';
import { HttpError } from '@/lib/api/response';
import type { CreateStaffInput } from '@/lib/validation';

export async function listUsers(opts: {
  role?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const filter: Record<string, unknown> = {};
  if (opts.role) filter.role = opts.role;
  if (opts.status) filter.status = opts.status;
  if (opts.search) {
    const rx = new RegExp(opts.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 50;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function setUserStatus(id: string, status: 'active' | 'inactive') {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid user id', 400);
  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!user) throw new HttpError('User not found', 404);
  return user;
}

export async function updateProfile(
  id: string,
  data: { name?: string; phone?: string; profileImage?: string },
) {
  const user = await User.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!user) throw new HttpError('User not found', 404);
  return user;
}

// ---- Staff ----

export async function listStaff(search?: string) {
  const filter: Record<string, unknown> = { role: 'staff' };
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { specialization: rx }];
  }
  const staff = await User.find(filter).sort({ name: 1 }).lean();
  // Compute live active assignment counts.
  const counts = await Issue.aggregate([
    { $match: { assignedStaff: { $ne: null }, status: { $ne: 'Resolved' } } },
    { $group: { _id: '$assignedStaff', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c: { _id: Types.ObjectId; count: number }) => [String(c._id), c.count]));
  return staff.map((s) => ({ ...s, activeAssignments: countMap.get(String(s._id)) ?? 0 }));
}

export async function createStaff(input: CreateStaffInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new HttpError('A user with that email already exists', 409);
  const password = await hashPassword(input.password ?? 'Staff@123');
  const staff = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    specialization: input.specialization,
    password,
    role: 'staff',
  });
  return staff.toJSON();
}

export async function updateStaff(
  id: string,
  data: Partial<{ name: string; phone: string; specialization: string; status: 'active' | 'inactive' }>,
) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError('Invalid staff id', 400);
  const staff = await User.findOneAndUpdate({ _id: id, role: 'staff' }, data, { new: true }).lean();
  if (!staff) throw new HttpError('Staff member not found', 404);
  return staff;
}
