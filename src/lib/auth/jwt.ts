import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env } from '@/lib/env';
import type { Role } from '@/lib/constants';

export interface TokenPayload extends JWTPayload {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
  type: 'access' | 'refresh';
}

const encoder = new TextEncoder();

function accessKey() {
  return encoder.encode(env.accessSecret);
}
function refreshKey() {
  return encoder.encode(env.refreshSecret);
}

export async function signAccessToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>) {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${env.accessExpiresMin}m`)
    .sign(accessKey());
}

export async function signRefreshToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>) {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${env.refreshExpiresDays}d`)
    .sign(refreshKey());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessKey());
    if ((payload as TokenPayload).type !== 'access') return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshKey());
    if ((payload as TokenPayload).type !== 'refresh') return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
