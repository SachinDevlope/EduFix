import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('hashes a password to a non-plaintext value', async () => {
    const hash = await hashPassword('Secret@123');
    expect(hash).not.toBe('Secret@123');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('Secret@123');
    await expect(verifyPassword('Secret@123', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('Secret@123');
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });
});
