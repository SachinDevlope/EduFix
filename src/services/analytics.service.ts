import Issue from '@/models/Issue';
import User from '@/models/User';
import type { SessionUser } from '@/lib/auth/session';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';

/** Build a base match filter scoped to the requesting user's role. */
function scopeFilter(user: SessionUser): Record<string, unknown> {
  if (user.role === 'parent' || user.role === 'teacher') return { reportedBy: user.id };
  if (user.role === 'staff') return { assignedStaff: user.id };
  return {};
}

export async function getDashboardStats(user: SessionUser) {
  const match = scopeFilter(user);

  const [byStatus, total, recentRaw] = await Promise.all([
    Issue.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Issue.countDocuments(match),
    Issue.find(match).sort({ updatedAt: -1 }).limit(8).lean(),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const s of ISSUE_STATUSES) statusCounts[s] = 0;
  byStatus.forEach((b: { _id: string; count: number }) => {
    statusCounts[b._id] = b.count;
  });

  const resolved = statusCounts['Resolved'] ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average resolution time (in hours) over resolved issues.
  const resolvedAgg = await Issue.aggregate([
    { $match: { ...match, status: 'Resolved', resolvedAt: { $ne: null } } },
    {
      $project: {
        durationMs: { $subtract: ['$resolvedAt', '$createdAt'] },
      },
    },
    { $group: { _id: null, avgMs: { $avg: '$durationMs' } } },
  ]);
  const avgResolutionHours = resolvedAgg[0]?.avgMs
    ? Math.round((resolvedAgg[0].avgMs / 36e5) * 10) / 10
    : 0;

  const critical = await Issue.countDocuments({ ...match, priority: 'Critical' });

  return {
    kpis: {
      total,
      pending: statusCounts['Pending'] ?? 0,
      assigned: statusCounts['Assigned'] ?? 0,
      inProgress: statusCounts['In Progress'] ?? 0,
      resolved,
      resolutionRate,
      avgResolutionHours,
      critical,
    },
    statusCounts,
    recent: recentRaw,
  };
}

export async function getAnalytics(user: SessionUser) {
  const match = scopeFilter(user);

  const [byCategory, byPriority, byStatus, monthly, resolutionByCategory, activeUsers, totalUsers] =
    await Promise.all([
      Issue.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([
        { $match: match },
        {
          $group: {
            _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
            reported: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
        { $limit: 12 },
      ]),
      Issue.aggregate([
        { $match: { ...match, status: 'Resolved', resolvedAt: { $ne: null } } },
        {
          $group: {
            _id: '$category',
            avgHours: { $avg: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 36e5] } },
          },
        },
      ]),
      user.role === 'admin' ? User.countDocuments({ status: 'active' }) : Promise.resolve(0),
      user.role === 'admin' ? User.countDocuments({}) : Promise.resolve(0),
    ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const categoryData = ISSUE_CATEGORIES.map((c) => ({
    name: c,
    value: byCategory.find((b: { _id: string }) => b._id === c)?.count ?? 0,
  }));
  const priorityData = ISSUE_PRIORITIES.map((p) => ({
    name: p,
    value: byPriority.find((b: { _id: string }) => b._id === p)?.count ?? 0,
  }));
  const statusData = ISSUE_STATUSES.map((s) => ({
    name: s,
    value: byStatus.find((b: { _id: string }) => b._id === s)?.count ?? 0,
  }));
  const monthlyData = monthly.map((m: { _id: { y: number; m: number }; reported: number; resolved: number }) => ({
    name: `${monthNames[m._id.m - 1]} ${m._id.y}`,
    reported: m.reported,
    resolved: m.resolved,
  }));
  const resolutionTimeData = resolutionByCategory.map(
    (r: { _id: string; avgHours: number }) => ({
      name: r._id,
      hours: Math.round(r.avgHours * 10) / 10,
    }),
  );

  return {
    categoryData,
    priorityData,
    statusData,
    monthlyData,
    resolutionTimeData,
    engagement: { activeUsers, totalUsers },
  };
}
