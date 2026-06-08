import type {
  Role,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  StaffSpecialization,
} from '@/lib/constants';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  profileImage?: string;
  phone?: string;
  schoolId: string;
}

export interface Media {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  filename?: string;
}

export interface Comment {
  _id?: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Issue {
  _id: string;
  issueCode: string;
  title: string;
  description: string;
  category: IssueCategory;
  building: string;
  floor: string;
  roomNumber: string;
  priority: IssuePriority;
  status: IssueStatus;
  media: Media[];
  reportedBy: string;
  reportedByName: string;
  assignedStaff?: string | null;
  assignedStaffName?: string | null;
  estimatedResolutionDate?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string;
  comments: Comment[];
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEntry {
  _id: string;
  issueId: string;
  issueCode: string;
  action: string;
  message: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  issueId?: string | null;
  issueCode?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: StaffSpecialization;
  status: 'active' | 'inactive';
  activeAssignments: number;
}

export interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  kpis: {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    resolutionRate: number;
    avgResolutionHours: number;
    critical: number;
  };
  statusCounts: Record<string, number>;
  recent: Issue[];
}

export interface AnalyticsData {
  categoryData: { name: string; value: number }[];
  priorityData: { name: string; value: number }[];
  statusData: { name: string; value: number }[];
  monthlyData: { name: string; reported: number; resolved: number }[];
  resolutionTimeData: { name: string; hours: number }[];
  engagement: { activeUsers: number; totalUsers: number };
}

export type { Role, IssueCategory, IssuePriority, IssueStatus, StaffSpecialization };
