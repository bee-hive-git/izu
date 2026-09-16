import { readSession } from '../_lib/auth';
import { defineHandler, json } from '../_lib/http';

const handler = defineHandler(async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const session = readSession(request);
  if (!session) {
    return json({ error: 'Não autenticado' }, 401);
  }

  return json({ email: session.email });
});

export const GET = handler.fetch;
export default handler;
