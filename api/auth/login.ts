import { authenticateUser, createSessionToken, sessionCookie } from '../_lib/auth.js';
import { defineHandler, json, readJson } from '../_lib/http.js';

const handler = defineHandler(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await readJson<{ email?: string; password?: string }>(request);
    const email = body.email?.trim() || '';
    const password = body.password || '';

    if (!email || !password) {
      return json({ error: 'Email ou senha inválidos' }, 401);
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return json({ error: 'Email ou senha inválidos' }, 401);
    }

    return json(
      { email: user.email },
      200,
      { 'Set-Cookie': sessionCookie(createSessionToken(user.email)) },
    );
  } catch (error) {
    console.error('Login error:', error);
    return json(
      {
        error:
          error instanceof Error && error.message.includes('DATABASE_URL')
            ? 'Banco não configurado'
            : 'Erro ao entrar',
      },
      500,
    );
  }
});

export const POST = handler.fetch;
export default handler;
