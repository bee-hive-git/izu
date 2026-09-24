import { readSession } from '../_lib/auth.js';
import { mapProduct, sql } from '../_lib/db.js';
import { defineHandler, getPathParam, json, readJson } from '../_lib/http.js';
import { deleteProductImage, storagePathFromUrl } from '../_lib/bunny.js';

async function deleteUnusedImages(urls: string[]) {
  for (const url of urls) {
    const path = storagePathFromUrl(url);
    if (!path?.startsWith('produtos/')) continue;
    const stillUsed = await sql`SELECT 1 FROM products WHERE ${url} = ANY(images) LIMIT 1`;
    if (stillUsed.length) continue;
    try {
      await deleteProductImage(path);
    } catch (error) {
      console.error('Product image cleanup error:', error);
    }
  }
}

type ProductInput = {
  name?: string;
  description?: string;
  images?: string[];
  height?: number;
  width?: number;
  depth?: number;
  colors?: string[];
  category?: string;
  subcategory?: string;
  weight?: number | null;
  engraving_dimensions?: string | null;
  additional_info?: string | null;
  active?: boolean;
};

const handler = defineHandler(async (request) => {
  const id = getPathParam(request, 'id', /\/api\/products\/([^/]+)/);
  if (!id) {
    return json({ error: 'ID inválido' }, 400);
  }

  try {
    if (request.method === 'GET') {
      const isAdmin = Boolean(readSession(request));
      const rows = await sql`
        SELECT *
        FROM products
        WHERE id = ${id}
          AND (${isAdmin} OR active = true)
      `;

      if (rows.length === 0) {
        return json({ error: 'Produto não encontrado' }, 404);
      }

      return json({ product: mapProduct(rows[0] as Record<string, unknown>) });
    }

    if (!readSession(request)) {
      return json({ error: 'Não autenticado' }, 401);
    }

    if (request.method === 'PATCH') {
      const body = await readJson<{ active?: boolean }>(request);
      if (typeof body.active !== 'boolean') {
        return json({ error: 'Status inválido' }, 400);
      }

      const rows = await sql`
        UPDATE products
        SET active = ${body.active}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;

      if (rows.length === 0) {
        return json({ error: 'Produto não encontrado' }, 404);
      }

      return json({ product: mapProduct(rows[0] as Record<string, unknown>) });
    }

    if (request.method === 'PUT') {
      const body = await readJson<ProductInput>(request);
      if (!body.name?.trim() || !body.description?.trim() || !body.category?.trim() || !body.subcategory?.trim()) {
        return json({ error: 'Preencha nome, descrição, categoria e subcategoria' }, 400);
      }
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return json({ error: 'Adicione pelo menos uma imagem' }, 400);
      }

      const previous = await sql`SELECT images FROM products WHERE id = ${id}`;
      const previousImages = (previous[0]?.images as string[] | undefined) ?? [];

      const rows = await sql`
        UPDATE products
        SET
          name = ${body.name.trim()},
          description = ${body.description.trim()},
          images = ${body.images},
          height = ${Number(body.height) || 0},
          width = ${Number(body.width) || 0},
          depth = ${Number(body.depth) || 0},
          colors = ${body.colors || []},
          category = ${body.category.trim()},
          subcategory = ${body.subcategory.trim()},
          weight = ${body.weight == null ? null : Number(body.weight)},
          engraving_dimensions = ${body.engraving_dimensions || null},
          additional_info = ${body.additional_info || null},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;

      if (rows.length === 0) {
        return json({ error: 'Produto não encontrado' }, 404);
      }

      const kept = new Set(body.images);
      await deleteUnusedImages(previousImages.filter((url) => !kept.has(url)));

      return json({ product: mapProduct(rows[0] as Record<string, unknown>) });
    }

    if (request.method === 'DELETE') {
      const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING images`;
      if (rows.length === 0) {
        return json({ error: 'Produto não encontrado' }, 404);
      }
      await deleteUnusedImages((rows[0].images as string[] | undefined) ?? []);
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Product item error:', error);
    return json({ error: 'Erro ao processar produto' }, 500);
  }
});

export const GET = handler.fetch;
export const PUT = handler.fetch;
export const PATCH = handler.fetch;
export const DELETE = handler.fetch;
export default handler;
