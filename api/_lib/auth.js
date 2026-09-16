import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { sql } from './db.js';
import { getCookie } from './http.js';

export const SESSION_COOKIE = 'izu_session';
const SESSION_DAYS = 7;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing SESSION_SECRET environment variable');
  }
  return secret;
}

function sign(value) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createSessionToken(email) {
  const payload = {
    email,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function readSession(request) {
  const token = getCookie(request, SESSION_COOKIE);
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
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.email || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function cookieFlags() {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; ${cookieFlags()}; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`;
}

export function clearSessionCookieValue() {
  return `${SESSION_COOKIE}=; ${cookieFlags()}; Max-Age=0`;
}

export async function authenticateUser(email, password) {
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
