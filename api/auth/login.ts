import type { ServerResponse } from 'http';
import { credentialsMatch, createSessionToken, setSessionCookie } from '../_lib/auth';
import { readJson, sendJson, type VercelLikeRequest } from '../_lib/http';

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJson<{ email?: string; password?: string }>(req);
    const email = body.email?.trim() || '';
    const password = body.password || '';

    if (!email || !password || !credentialsMatch(email, password)) {
      sendJson(res, 401, { error: 'Email ou senha inválidos' });
      return;
    }

    setSessionCookie(res, createSessionToken(email));
    sendJson(res, 200, { email });
  } catch (error) {
    console.error('Login error:', error);
    sendJson(res, 500, { error: 'Erro ao entrar' });
  }
}
