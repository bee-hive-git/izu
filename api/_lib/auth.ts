import { createHmac, scryptSync, timingSafeEqual } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { sql } from './db';
import { getCookie } from './http';

export const SESSION_COOKIE = 'izu_session';
const SESSION_DAYS = 7;

type SessionPayload = {
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing SESSION_SECRET environment variable');
  }
  return secret;
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createSessionToken(email: string) {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function readSession(req: IncomingMessage): SessionPayload | null {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.email || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: ServerResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`,
  );
}

export function clearSessionCookie(res: ServerResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export async function authenticateUser(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return null;
  }

  const rows = await sql`
    SELECT email, password_hash
    FROM users
    WHERE lower(email) = ${normalized}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  const stored = String(rows[0].password_hash);
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return null;
  }

  const provided = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  return { email: String(rows[0].email) };
}
