import { z } from 'zod';
import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  SELF_REGISTER_ROLES,
  STAFF_SPECIALIZATIONS,
} from './constants';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is too short').max(120),
    email: z.string().email('Enter a valid email'),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(SELF_REGISTER_ROLES),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(true),
});

export const mediaSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['image', 'video']),
  publicId: z.string().optional(),
  filename: z.string().optional(),
});

export const createIssueSchema = z.object({
  title: z.string().min(4, 'Title is too short').max(160),
  description: z.string().min(10, 'Please describe the issue (min 10 chars)').max(4000),
  category: z.enum(ISSUE_CATEGORIES),
  building: z.string().min(1, 'Building is required'),
  floor: z.string().min(1, 'Floor is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  priority: z.enum(ISSUE_PRIORITIES).default('Medium'),
  media: z.array(mediaSchema).max(10).optional().default([]),
});

export const updateIssueSchema = z.object({
  status: z.enum(ISSUE_STATUSES).optional(),
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  assignedStaff: z.string().nullable().optional(),
  estimatedResolutionDate: z.string().datetime().nullable().optional(),
  resolutionNotes: z.string().max(4000).optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export const issueQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  mine: z.coerce.boolean().optional(),
  sort: z.string().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  specialization: z.enum(STAFF_SPECIALIZATIONS),
  password: passwordSchema.optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().optional(),
  specialization: z.enum(STAFF_SPECIALIZATIONS).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  profileImage: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueQuery = z.infer<typeof issueQuerySchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
