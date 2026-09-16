import type { ServerResponse } from 'http';
import { sendJson, type VercelLikeRequest } from './_lib/http';

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    database: Boolean(process.env.DATABASE_URL),
    session: Boolean(process.env.SESSION_SECRET),
  });
}
