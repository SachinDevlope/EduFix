import { connectDB } from './db';
import { env } from './env';
import { hashPassword } from './auth/password';
import User from '@/models/User';
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import ActivityLog from '@/models/ActivityLog';
import {
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  STAFF_SPECIALIZATIONS,
  type IssueCategory,
  type IssuePriority,
  type IssueStatus,
} from './constants';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Diya', 'Ananya', 'Ishaan', 'Saanvi', 'Kabir', 'Myra', 'Reyansh', 'Anika', 'Vihaan', 'Aadhya', 'Arjun', 'Pari', 'Krishna', 'Riya', 'Sai', 'Kiara', 'Dhruv'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Mehta', 'Singh', 'Rao', 'Das', 'Khan', 'Joshi', 'Pillai', 'Bose'];

const BUILDINGS = ['Main Block', 'Science Block', 'Primary Wing', 'Admin Block', 'Sports Complex'];
const FLOORS = ['Ground', '1st', '2nd', '3rd'];

const ISSUE_TEMPLATES: Record<IssueCategory, { title: string; desc: string }[]> = {
  Electrical: [
    { title: 'Flickering tube light in classroom', desc: 'The tube light keeps flickering and sometimes goes off completely during lessons.' },
    { title: 'Exposed wiring near switchboard', desc: 'There is exposed electrical wiring near the main switchboard which is a safety hazard for students.' },
    { title: 'Non-functional ceiling fan', desc: 'The ceiling fan does not turn on even when the switch is operated. Classroom gets very hot.' },
  ],
  Furniture: [
    { title: 'Broken student desk', desc: 'A wooden desk has a cracked top and a loose leg, making it unsafe to use.' },
    { title: 'Damaged chairs in library', desc: 'Several chairs in the reading area have broken backrests.' },
  ],
  Classroom: [
    { title: 'Leaking classroom ceiling', desc: 'Water leaks from the ceiling during rain, damaging the wall and floor.' },
    { title: 'Cracked whiteboard', desc: 'The whiteboard surface is cracked and hard to write on.' },
  ],
  Toilet: [
    { title: 'Clogged toilet in boys washroom', desc: 'One of the toilets is clogged and overflowing, causing hygiene problems.' },
    { title: 'Broken washroom door latch', desc: 'The latch on the washroom door is broken, affecting privacy.' },
  ],
  'Water Supply': [
    { title: 'No water in drinking fountain', desc: 'The drinking water fountain near the playground has no water supply.' },
    { title: 'Leaking water pipe', desc: 'A pipe near the corridor is leaking continuously, wasting water.' },
  ],
  Sanitation: [
    { title: 'Overflowing garbage bins', desc: 'Garbage bins in the corridor are overflowing and not being cleared regularly.' },
    { title: 'Dirty washroom needs cleaning', desc: 'The washroom has not been cleaned and has a strong odour.' },
  ],
  Playground: [
    { title: 'Broken swing in play area', desc: 'A swing chain has snapped, making it dangerous for younger children.' },
    { title: 'Uneven ground near football field', desc: 'The ground is uneven with potholes, posing a tripping hazard.' },
  ],
  'Safety Hazard': [
    { title: 'Loose staircase railing', desc: 'The railing on the main staircase is loose and could give way.' },
    { title: 'Slippery floor near entrance', desc: 'The entrance floor becomes very slippery when wet, with no warning signage.' },
  ],
  Other: [
    { title: 'Faulty classroom door hinge', desc: 'The classroom door does not close properly due to a damaged hinge.' },
    { title: 'Missing fire extinguisher', desc: 'The fire extinguisher that was mounted near the lab is missing.' },
  ],
};

const RESOLUTION_NOTES = [
  'Issue inspected and repaired by the maintenance team. Verified working condition.',
  'Replaced the faulty component and tested. Closed after confirmation.',
  'Cleaned and serviced the affected area. No further action required.',
  'Part ordered and installed. Issue resolved and signed off.',
];

interface SeedResult {
  seeded: boolean;
  users: number;
  staff: number;
  issues: number;
}

export async function seedDatabase(
  opts: { silent?: boolean; onlyIfEmpty?: boolean } = {},
): Promise<SeedResult> {
  const log = (...args: unknown[]) => {
    if (!opts.silent) console.log(...args);
  };

  await connectDB();

  const existing = await User.countDocuments();
  if (opts.onlyIfEmpty && existing > 0) {
    return { seeded: false, users: 0, staff: 0, issues: 0 };
  }

  if (!opts.onlyIfEmpty) {
    log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
  }

  const defaultHash = await hashPassword('Password@123');
  const adminHash = await hashPassword(env.seedAdminPassword);
  const staffHash = await hashPassword('Staff@123');

  // --- Admin ---
  const admin = await User.create({
    name: 'EduFix Administrator',
    email: env.seedAdminEmail.toLowerCase(),
    password: adminHash,
    role: 'admin',
    status: 'active',
  });

  // --- Staff (10) ---
  const staffDocs = [];
  for (let i = 0; i < 10; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    staffDocs.push({
      name,
      email: `staff${i + 1}@edufix.edu`,
      password: staffHash,
      role: 'staff' as const,
      specialization: STAFF_SPECIALIZATIONS[i % STAFF_SPECIALIZATIONS.length],
      phone: `+91-9${randInt(100000000, 999999999)}`,
      status: 'active' as const,
    });
  }
  const staff = await User.insertMany(staffDocs);

  // --- Parents & Teachers (19, to total 20 users incl. admin) ---
  const memberDocs = [];
  const namedLogins: { email: string; role: string }[] = [];
  for (let i = 0; i < 19; i++) {
    const role = i % 2 === 0 ? 'parent' : 'teacher';
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const email = `${role}${Math.floor(i / 2) + 1}@edufix.edu`;
    memberDocs.push({
      name,
      email,
      password: defaultHash,
      role,
      phone: `+91-9${randInt(100000000, 999999999)}`,
      status: i === 18 ? ('inactive' as const) : ('active' as const),
    });
    if (i < 2) namedLogins.push({ email, role });
  }
  const members = await User.insertMany(memberDocs);
  const reporters = members.filter((m) => m.status === 'active');

  // --- Issues (50) ---
  const year = new Date().getFullYear();
  let seq = 1;
  const issuesToCreate = [];
  const activityToCreate = [];
  const notificationsToCreate = [];

  for (let i = 0; i < 50; i++) {
    const category = pick(ISSUE_CATEGORIES) as IssueCategory;
    const template = pick(ISSUE_TEMPLATES[category]);
    const reporter = pick(reporters);
    const status = pick(ISSUE_STATUSES) as IssueStatus;
    const priority = pick(ISSUE_PRIORITIES) as IssuePriority;
    const createdDaysAgo = randInt(1, 90);
    const createdAt = daysAgo(createdDaysAgo);
    const issueCode = `ISS-${year}-${String(seq++).padStart(4, '0')}`;

    const assigned = status !== 'Pending' ? pick(staff) : null;
    let resolvedAt: Date | null = null;
    if (status === 'Resolved') {
      resolvedAt = daysAgo(Math.max(0, createdDaysAgo - randInt(1, 10)));
    }

    issuesToCreate.push({
      issueCode,
      title: template.title,
      description: template.desc,
      category,
      building: pick(BUILDINGS),
      floor: pick(FLOORS),
      roomNumber: `R-${randInt(101, 410)}`,
      priority,
      status,
      media: [],
      reportedBy: reporter._id,
      reportedByName: reporter.name,
      assignedStaff: assigned?._id ?? null,
      assignedStaffName: assigned?.name ?? null,
      estimatedResolutionDate:
        status !== 'Pending' && status !== 'Resolved' ? daysAgo(-randInt(1, 14)) : null,
      resolvedAt,
      resolutionNotes: status === 'Resolved' ? pick(RESOLUTION_NOTES) : '',
      createdAt,
      updatedAt: resolvedAt ?? createdAt,
    });
  }
  const issues = await Issue.insertMany(issuesToCreate);

  // Activity logs + notifications derived from issues
  for (const issue of issues) {
    activityToCreate.push({
      issueId: issue._id,
      issueCode: issue.issueCode,
      action: 'created' as const,
      message: `${issue.reportedByName} reported this issue`,
      performedBy: issue.reportedBy,
      performedByName: issue.reportedByName,
      createdAt: issue.createdAt,
    });
    if (issue.assignedStaff) {
      activityToCreate.push({
        issueId: issue._id,
        issueCode: issue.issueCode,
        action: 'assigned' as const,
        message: `Admin assigned this issue to ${issue.assignedStaffName}`,
        performedBy: admin._id,
        performedByName: admin.name,
        createdAt: new Date(issue.createdAt.getTime() + 36e5),
      });
      notificationsToCreate.push({
        userId: issue.assignedStaff,
        type: 'assignment' as const,
        title: 'New repair assigned to you',
        message: `${issue.issueCode}: "${issue.title}" has been assigned to you.`,
        issueId: issue._id,
        issueCode: issue.issueCode,
        isRead: Math.random() > 0.5,
      });
    }
    if (issue.status === 'Resolved') {
      activityToCreate.push({
        issueId: issue._id,
        issueCode: issue.issueCode,
        action: 'resolved' as const,
        message: `${issue.assignedStaffName ?? 'Staff'} marked this issue as Resolved`,
        performedBy: issue.assignedStaff ?? admin._id,
        performedByName: issue.assignedStaffName ?? admin.name,
        createdAt: issue.resolvedAt ?? issue.updatedAt,
      });
      notificationsToCreate.push({
        userId: issue.reportedBy,
        type: 'resolution' as const,
        title: 'Your issue was resolved',
        message: `${issue.issueCode}: "${issue.title}" is now Resolved.`,
        issueId: issue._id,
        issueCode: issue.issueCode,
        isRead: Math.random() > 0.6,
      });
    }
  }

  await ActivityLog.insertMany(activityToCreate);
  await Notification.insertMany(notificationsToCreate);

  log('\n✅ Seed complete!');
  log(`   Admin login : ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  log(`   Sample users: ${namedLogins.map((n) => `${n.email} (${n.role})`).join(', ')} — password: Password@123`);
  log(`   Staff login : staff1@edufix.edu / Staff@123`);
  log(`   Totals      : ${1 + staff.length + members.length} users, ${staff.length} staff, ${issues.length} issues`);

  return {
    seeded: true,
    users: 1 + staff.length + members.length,
    staff: staff.length,
    issues: issues.length,
  };
}
