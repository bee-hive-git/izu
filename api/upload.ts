import { IncomingMessage, ServerResponse } from 'http';
import formidable from 'formidable';
import { readSession } from './_lib/auth';
import { uploadProductImage } from './_lib/bunny';
import { sendJson } from './_lib/http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!readSession(req)) {
    sendJson(res, 401, { error: 'Não autenticado' });
    return;
  }

  const form = formidable({ keepExtensions: true });

  try {
    const [, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      sendJson(res, 400, { error: 'No file provided' });
      return;
    }

    const result = await uploadProductImage(file.filepath, file.originalFilename || 'image.jpg', file.mimetype || undefined);
    sendJson(res, 200, result);
  } catch (error) {
    console.error('Upload error:', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Error uploading image',
    });
  }
}
