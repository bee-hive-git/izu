import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { readSession } from '../_lib/auth.js';
import { IMAGE_VARIANT_WIDTHS } from '../_lib/blog.js';
import { uploadBuffer } from '../_lib/bunny.js';
import { defineHandler, json } from '../_lib/http.js';

const MAX_DIMENSION = 2000;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const handler = defineHandler(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!readSession(request)) {
    return json({ error: 'Não autenticado' }, 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Envio inválido' }, 400);
  }

  const file = form.get('file');
  const isCover = form.get('kind') === 'cover';

  if (!(file instanceof File) || file.size === 0) {
    return json({ error: 'Nenhuma foto enviada' }, 400);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return json({ error: 'A foto passou de 4 MB mesmo depois de comprimida' }, 413);
  }

  let source: ReturnType<typeof sharp>;
  try {
    source = sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'error' }).rotate();
    await source.metadata();
  } catch {
    return json({ error: 'Arquivo não é uma imagem válida' }, 400);
  }

  try {
    const base = `blog/${randomUUID()}`;

    const main = await source
      .clone()
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const variants = await Promise.all(
      IMAGE_VARIANT_WIDTHS.map(async (width) => ({
        width,
        buffer: await source.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
      })),
    );

    const uploads: Promise<string>[] = [
      uploadBuffer(`${base}.webp`, main.data, 'image/webp'),
      ...variants.map((variant) => uploadBuffer(`${base}-${variant.width}.webp`, variant.buffer, 'image/webp')),
    ];

    if (isCover) {
      const og = await source
        .clone()
        .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      uploads.push(uploadBuffer(`${base}-og.jpg`, og, 'image/jpeg'));
    }

    const [url] = await Promise.all(uploads);

    return json({
      url,
      width: main.info.width,
      height: main.info.height,
    });
  } catch (error) {
    console.error('Blog upload error:', error);
    return json({ error: 'Não foi possível salvar a foto no servidor. Tente de novo.' }, 500);
  }
});

export const POST = handler.fetch;
export default handler;
