import { IncomingMessage, ServerResponse } from 'http';
import cloudinary from './_lib/cloudinary.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'DELETE') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = JSON.parse(Buffer.concat(chunks).toString());
  const { public_id } = body;

  if (!public_id) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing public_id' }));
    return;
  }

  try {
    await cloudinary.uploader.destroy(public_id);
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Delete error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Error deleting image' }));
  }
}
