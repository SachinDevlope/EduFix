'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  Issue,
  ActivityEntry,
  NotificationItem,
  StaffMember,
  ManagedUser,
  DashboardStats,
  AnalyticsData,
  Pagination,
} from '@/types';

// ---------- Issues ----------

export interface IssueFilters {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  mine?: boolean;
}

function toQuery(filters: IssueFilters): string {
  const sp = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== false) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useIssues(filters: IssueFilters = {}) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () =>
      api.get<{ items: Issue[]; pagination: Pagination }>(`/api/issues${toQuery(filters)}`),
  });
}

export function useIssue(id: string | null) {
  return useQuery({
    queryKey: ['issue', id],
    enabled: !!id,
    queryFn: () => api.get<{ issue: Issue; activity: ActivityEntry[] }>(`/api/issues/${id}`),
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<{ issue: Issue }>('/api/issues', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateIssue(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch<{ issue: Issue }>(`/api/issues/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', id] });
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useAddComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      api.post<{ issue: Issue }>(`/api/issues/${id}/comments`, { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', id] }),
  });
}

// ---------- Notifications ----------

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ items: NotificationItem[]; unreadCount: number }>('/api/notifications'),
    refetchInterval: 20_000, // near-real-time polling
  });
}

export function useNotificationActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['notifications'] });
  return {
    markRead: useMutation({
      mutationFn: (id: string) => api.patch(`/api/notifications/${id}`),
      onSuccess: invalidate,
    }),
    markAllRead: useMutation({
      mutationFn: () => api.patch('/api/notifications'),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete(`/api/notifications/${id}`),
      onSuccess: invalidate,
    }),
  };
}

// ---------- Dashboard / Analytics ----------

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/api/dashboard/stats'),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get<AnalyticsData>('/api/analytics'),
  });
}

// ---------- Staff ----------

export function useStaff(search = '') {
  return useQuery({
    queryKey: ['staff', search],
    queryFn: () =>
      api.get<{ items: StaffMember[] }>(`/api/staff${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });
}

export function useStaffMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['staff'] });
  return {
    create: useMutation({
      mutationFn: (payload: Record<string, unknown>) => api.post('/api/staff', payload),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
        api.patch(`/api/staff/${id}`, payload),
      onSuccess: invalidate,
    }),
  };
}

// ---------- Users ----------

export function useUsers(filters: { search?: string; role?: string; status?: string } = {}) {
  const sp = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && sp.set(k, String(v)));
  const q = sp.toString();
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () =>
      api.get<{ items: ManagedUser[]; pagination: Pagination }>(`/api/users${q ? `?${q}` : ''}`),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      api.patch(`/api/users/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
