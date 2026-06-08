import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt';

const subject = {
  sub: '507f1f77bcf86cd799439011',
  email: 'user@edufix.edu',
  name: 'Test User',
  role: 'teacher' as const,
};

describe('jwt tokens', () => {
  it('signs and verifies an access token', async () => {
    const token = await signAccessToken(subject);
    const payload = await verifyAccessToken(token);
    expect(payload?.sub).toBe(subject.sub);
    expect(payload?.role).toBe('teacher');
    expect(payload?.type).toBe('access');
  });

  it('signs and verifies a refresh token', async () => {
    const token = await signRefreshToken(subject);
    const payload = await verifyRefreshToken(token);
    expect(payload?.email).toBe(subject.email);
    expect(payload?.type).toBe('refresh');
  });

  it('rejects an access token when verified as refresh', async () => {
    const token = await signAccessToken(subject);
    await expect(verifyRefreshToken(token)).resolves.toBeNull();
  });

  it('rejects a tampered/invalid token', async () => {
    await expect(verifyAccessToken('not-a-real-token')).resolves.toBeNull();
  });
});
