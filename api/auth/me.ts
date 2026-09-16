import { readSession } from '../../server/auth';
import { defineHandler, json } from '../../server/http';

export const config = {
  runtime: 'nodejs',
};

export default defineHandler(async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const session = readSession(request);
  if (!session) {
    return json({ error: 'Não autenticado' }, 401);
  }

  return json({ email: session.email });
});
