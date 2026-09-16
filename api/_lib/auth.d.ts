export const SESSION_COOKIE: string;
export function createSessionToken(email: string): string;
export function readSession(request: Request): { email: string; exp: number } | null;
export function sessionCookie(token: string): string;
export function clearSessionCookieValue(): string;
export function authenticateUser(
  email: string,
  password: string,
): Promise<{ email: string } | null>;
