import type { ServerResponse } from 'http';
import { clearSessionCookie } from '../_lib/auth';
import { sendJson, type VercelLikeRequest } from '../_lib/http';

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  clearSessionCookie(res);
  sendJson(res, 200, { success: true });
}
