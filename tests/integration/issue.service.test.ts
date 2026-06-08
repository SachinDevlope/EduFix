import { connectTestDB, clearTestDB, closeTestDB } from '../helpers/db';
import {
  createIssue,
  listIssues,
  updateIssue,
  addComment,
  getIssue,
} from '@/services/issue.service';
import User from '@/models/User';
import Notification from '@/models/Notification';
import type { SessionUser } from '@/lib/auth/session';
import { issueQuerySchema } from '@/lib/validation';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function makeUsers() {
  const admin = await User.create({ name: 'Admin', email: 'a@x.edu', password: 'x', role: 'admin' });
  const parent = await User.create({ name: 'Parent', email: 'p@x.edu', password: 'x', role: 'parent' });
  const staff = await User.create({ name: 'Fixer', email: 's@x.edu', password: 'x', role: 'staff', specialization: 'Plumber' });
  return {
    admin: { id: String(admin._id), name: admin.name, email: admin.email, role: 'admin' } as SessionUser,
    parent: { id: String(parent._id), name: parent.name, email: parent.email, role: 'parent' } as SessionUser,
    staffId: String(staff._id),
  };
}

const baseInput = {
  title: 'Broken fan',
  description: 'The ceiling fan does not work at all.',
  category: 'Electrical' as const,
  building: 'Main',
  floor: '1st',
  roomNumber: 'R-101',
  priority: 'Medium' as const,
  media: [],
};

describe('issue.service', () => {
  it('creates an issue with an auto-generated code and notifies admins', async () => {
    const { parent } = await makeUsers();
    const issue = await createIssue(baseInput, parent);
    expect(issue.issueCode).toMatch(/^ISS-\d{4}-0001$/);
    expect(issue.status).toBe('Pending');
    // Admin should have received a "new issue" notification.
    const adminNotifs = await Notification.countDocuments({ type: 'system' });
    expect(adminNotifs).toBe(1);
  });

  it('increments issue codes sequentially', async () => {
    const { parent } = await makeUsers();
    const a = await createIssue(baseInput, parent);
    const b = await createIssue(baseInput, parent);
    expect(a.issueCode.endsWith('0001')).toBe(true);
    expect(b.issueCode.endsWith('0002')).toBe(true);
  });

  it('scopes issue listing so parents see only their own', async () => {
    const { parent, admin } = await makeUsers();
    await createIssue(baseInput, parent);
    await createIssue(baseInput, admin);
    const q = issueQuerySchema.parse({});
    const parentList = await listIssues(q, parent);
    expect(parentList.items).toHaveLength(1);
    const adminList = await listIssues(q, admin);
    expect(adminList.items).toHaveLength(2);
  });

  it('rejects an invalid status transition', async () => {
    const { parent, admin } = await makeUsers();
    const issue = await createIssue(baseInput, parent);
    // Pending -> Resolved is allowed; but Resolved -> Pending is not.
    await updateIssue(String(issue._id), { status: 'Resolved' }, admin);
    await expect(
      updateIssue(String(issue._id), { status: 'Pending' }, admin),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('assigns staff, auto-advances status, and notifies staff + reporter', async () => {
    const { parent, admin, staffId } = await makeUsers();
    const issue = await createIssue(baseInput, parent);
    const updated = await updateIssue(String(issue._id), { assignedStaff: staffId }, admin);
    expect(updated.status).toBe('Assigned');
    expect(updated.assignedStaffName).toBe('Fixer');
    const assignmentNotifs = await Notification.countDocuments({ type: 'assignment' });
    expect(assignmentNotifs).toBeGreaterThanOrEqual(2); // staff + reporter
  });

  it('adds a comment to an issue', async () => {
    const { parent } = await makeUsers();
    const issue = await createIssue(baseInput, parent);
    const updated = await addComment(String(issue._id), 'Any update?', parent);
    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].text).toBe('Any update?');
  });

  it('prevents a parent from reading another user\'s issue', async () => {
    const { parent, admin } = await makeUsers();
    const issue = await createIssue(baseInput, admin);
    await expect(getIssue(String(issue._id), parent)).rejects.toMatchObject({ status: 403 });
  });
});
