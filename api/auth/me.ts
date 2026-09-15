import type { ServerResponse } from 'http';
import { readSession } from '../_lib/auth';
import { sendJson, type VercelLikeRequest } from '../_lib/http';

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Não autenticado' });
    return;
  }

  sendJson(res, 200, { email: session.email });
}
