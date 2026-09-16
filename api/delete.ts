import { readSession } from '../server/auth';
import { deleteProductImage } from '../server/bunny';
import { defineHandler, json, readJson } from '../server/http';

export const config = {
  runtime: 'nodejs',
};

export default defineHandler(async (request) => {
  if (request.method !== 'DELETE') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!readSession(request)) {
    return json({ error: 'Não autenticado' }, 401);
  }

  try {
    const body = await readJson<{ public_id?: string }>(request);
    const { public_id } = body;

    if (!public_id) {
      return json({ error: 'Missing public_id' }, 400);
    }

    await deleteProductImage(public_id);
    return json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return json({ error: 'Error deleting image' }, 500);
  }
});
