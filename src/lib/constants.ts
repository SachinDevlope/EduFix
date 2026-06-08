/**
 * Shared domain constants used across models, validation, and UI.
 */

export const ROLES = ['parent', 'teacher', 'admin', 'staff'] as const;
export type Role = (typeof ROLES)[number];

/** Roles that can self-register through the public form. */
export const SELF_REGISTER_ROLES = ['parent', 'teacher'] as const;

export const USER_STATUSES = ['active', 'inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ISSUE_CATEGORIES = [
  'Electrical',
  'Furniture',
  'Classroom',
  'Toilet',
  'Water Supply',
  'Sanitation',
  'Playground',
  'Safety Hazard',
  'Other',
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const ISSUE_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

/** Allowed forward/backward status transitions. */
export const STATUS_FLOW: Record<IssueStatus, IssueStatus[]> = {
  Pending: ['Assigned', 'In Progress', 'Resolved'],
  Assigned: ['In Progress', 'Resolved', 'Pending'],
  'In Progress': ['Resolved', 'Assigned'],
  Resolved: ['In Progress'],
};

export const ACTIVITY_ACTIONS = [
  'created',
  'updated',
  'status_changed',
  'priority_changed',
  'assigned',
  'commented',
  'resolved',
  'media_added',
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const STAFF_SPECIALIZATIONS = [
  'Electrician',
  'Carpenter',
  'Plumber',
  'Sanitation',
  'General Maintenance',
  'Safety Officer',
] as const;
export type StaffSpecialization = (typeof STAFF_SPECIALIZATIONS)[number];

export const ACCESS_COOKIE = 'edufix_access';
export const REFRESH_COOKIE = 'edufix_refresh';
