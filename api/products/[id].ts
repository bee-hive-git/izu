import type { ServerResponse } from 'http';
import { readSession } from '../_lib/auth';
import { mapProduct, sql } from '../_lib/db';
import { getPathParam, readJson, sendJson, type VercelLikeRequest } from '../_lib/http';

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

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  const id = getPathParam(req, 'id', /\/api\/products\/([^/]+)/);
  if (!id) {
    sendJson(res, 400, { error: 'ID inválido' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const isAdmin = Boolean(readSession(req));
      const rows = await sql`
        SELECT *
        FROM products
        WHERE id = ${id}
          AND (${isAdmin} OR active = true)
      `;

      if (rows.length === 0) {
        sendJson(res, 404, { error: 'Produto não encontrado' });
        return;
      }

      sendJson(res, 200, { product: mapProduct(rows[0] as Record<string, unknown>) });
      return;
    }

    if (!readSession(req)) {
      sendJson(res, 401, { error: 'Não autenticado' });
      return;
    }

    if (req.method === 'PATCH') {
      const body = await readJson<{ active?: boolean }>(req);
      if (typeof body.active !== 'boolean') {
        sendJson(res, 400, { error: 'Status inválido' });
        return;
      }

      const rows = await sql`
        UPDATE products
        SET active = ${body.active}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;

      if (rows.length === 0) {
        sendJson(res, 404, { error: 'Produto não encontrado' });
        return;
      }

      sendJson(res, 200, { product: mapProduct(rows[0] as Record<string, unknown>) });
      return;
    }

    if (req.method === 'PUT') {
      const body = await readJson<ProductInput>(req);
      if (!body.name?.trim() || !body.description?.trim() || !body.category?.trim() || !body.subcategory?.trim()) {
        sendJson(res, 400, { error: 'Preencha nome, descrição, categoria e subcategoria' });
        return;
      }
      if (!Array.isArray(body.images) || body.images.length === 0) {
        sendJson(res, 400, { error: 'Adicione pelo menos uma imagem' });
        return;
      }

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
        sendJson(res, 404, { error: 'Produto não encontrado' });
        return;
      }

      sendJson(res, 200, { product: mapProduct(rows[0] as Record<string, unknown>) });
      return;
    }

    if (req.method === 'DELETE') {
      const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
      if (rows.length === 0) {
        sendJson(res, 404, { error: 'Produto não encontrado' });
        return;
      }
      sendJson(res, 200, { success: true });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Product item error:', error);
    sendJson(res, 500, { error: 'Erro ao processar produto' });
  }
}
