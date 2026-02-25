import { IncomingMessage, ServerResponse } from 'http';
import formidable from 'formidable';
import cloudinary from './_lib/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const form = formidable({ keepExtensions: true });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'No file provided' }));
      return;
    }

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'produtos', // Using 'produtos' instead of 'imoveis' as per context
    });

    res.statusCode = 200;
    res.end(JSON.stringify({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  } catch (error) {
    console.error('Upload error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Error uploading image' }));
  }
}
