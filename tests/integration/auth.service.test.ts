import { connectTestDB, clearTestDB, closeTestDB } from '../helpers/db';
import { registerUser, authenticate, getUserById } from '@/services/auth.service';
import { HttpError } from '@/lib/api/response';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const input = {
  name: 'Jane Teacher',
  email: 'Jane@Edufix.edu',
  password: 'Password@123',
  confirmPassword: 'Password@123',
  role: 'teacher' as const,
};

describe('auth.service', () => {
  it('registers a user and lowercases the email', async () => {
    const user = await registerUser(input);
    expect(user.email).toBe('jane@edufix.edu');
    expect(user.role).toBe('teacher');
    expect((user as Record<string, unknown>).password).toBeUndefined();
  });

  it('prevents duplicate registration', async () => {
    await registerUser(input);
    await expect(registerUser(input)).rejects.toBeInstanceOf(HttpError);
  });

  it('authenticates with correct credentials', async () => {
    await registerUser(input);
    const user = await authenticate({ email: 'jane@edufix.edu', password: 'Password@123', remember: true });
    expect(user.name).toBe('Jane Teacher');
  });

  it('rejects wrong password with 401', async () => {
    await registerUser(input);
    await expect(
      authenticate({ email: 'jane@edufix.edu', password: 'wrong', remember: true }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('fetches a user by id', async () => {
    const created = await registerUser(input);
    const fetched = await getUserById(created.id);
    expect(fetched?.email).toBe('jane@edufix.edu');
  });
});
