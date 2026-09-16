import { readSession } from './_lib/auth.js';
import { uploadProductImageBuffer } from './_lib/bunny.js';
import { defineHandler, json } from './_lib/http.js';

const handler = defineHandler(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!readSession(request)) {
    return json({ error: 'Não autenticado' }, 401);
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return json({ error: 'No file provided' }, 400);
    }

    const result = await uploadProductImageBuffer(
      await file.arrayBuffer(),
      file.name || 'image.jpg',
      file.type || undefined,
    );

    return json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Error uploading image',
      },
      500,
    );
  }
});

export const POST = handler.fetch;
export default handler;
