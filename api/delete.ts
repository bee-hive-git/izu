import { IncomingMessage, ServerResponse } from 'http';
import { readSession } from './_lib/auth';
import { deleteProductImage } from './_lib/bunny';
import { readJson, sendJson } from './_lib/http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'DELETE') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!readSession(req)) {
    sendJson(res, 401, { error: 'Não autenticado' });
    return;
  }

  try {
    const body = await readJson<{ public_id?: string }>(req);
    const { public_id } = body;

    if (!public_id) {
      sendJson(res, 400, { error: 'Missing public_id' });
      return;
    }

    await deleteProductImage(public_id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Delete error:', error);
    sendJson(res, 500, { error: 'Error deleting image' });
  }
}
