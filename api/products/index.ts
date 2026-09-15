import type { ServerResponse } from 'http';
import { parse } from 'url';
import { readSession } from '../_lib/auth';
import { mapProduct, sql } from '../_lib/db';
import { readJson, sendJson, type VercelLikeRequest } from '../_lib/http';

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

function validateProduct(body: ProductInput) {
  if (!body.name?.trim() || !body.description?.trim() || !body.category?.trim() || !body.subcategory?.trim()) {
    return 'Preencha nome, descrição, categoria e subcategoria';
  }
  if (!Array.isArray(body.images) || body.images.length === 0) {
    return 'Adicione pelo menos uma imagem';
  }
  return null;
}

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  try {
    if (req.method === 'GET') {
      const query = parse(req.url || '', true).query;
      const category = typeof query.category === 'string' ? query.category : '';
      const subcategory = typeof query.subcategory === 'string' ? query.subcategory : '';
      const search = typeof query.search === 'string' ? query.search : '';
      const isAdminList = query.all === '1' && Boolean(readSession(req));

      const rows = await sql`
        SELECT *
        FROM products
        WHERE (${isAdminList} OR active = true)
          AND (${category} = '' OR category = ${category})
          AND (${subcategory} = '' OR subcategory = ${subcategory})
          AND (${search} = '' OR name ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `;

      sendJson(res, 200, { products: rows.map((row) => mapProduct(row as Record<string, unknown>)) });
      return;
    }

    if (req.method === 'POST') {
      if (!readSession(req)) {
        sendJson(res, 401, { error: 'Não autenticado' });
        return;
      }

      const body = await readJson<ProductInput>(req);
      const validationError = validateProduct(body);
      if (validationError) {
        sendJson(res, 400, { error: validationError });
        return;
      }

      const rows = await sql`
        INSERT INTO products (
          name, description, images, height, width, depth, colors, category, subcategory,
          weight, engraving_dimensions, additional_info, active
        )
        VALUES (
          ${body.name!.trim()},
          ${body.description!.trim()},
          ${body.images},
          ${Number(body.height) || 0},
          ${Number(body.width) || 0},
          ${Number(body.depth) || 0},
          ${body.colors || []},
          ${body.category!.trim()},
          ${body.subcategory!.trim()},
          ${body.weight == null || Number.isNaN(Number(body.weight)) ? null : Number(body.weight)},
          ${body.engraving_dimensions || null},
          ${body.additional_info || null},
          ${body.active ?? true}
        )
        RETURNING *
      `;

      sendJson(res, 201, { product: mapProduct(rows[0] as Record<string, unknown>) });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Products collection error:', error);
    sendJson(res, 500, { error: 'Erro ao processar produtos' });
  }
}
