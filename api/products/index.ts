import { readSession } from '../../server/auth';
import { mapProduct, sql } from '../../server/db';
import { defineHandler, getRequestUrl, json, readJson } from '../../server/http';

export const config = {
  runtime: 'nodejs',
};

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

export default defineHandler(async (request) => {
  try {
    if (request.method === 'GET') {
      const query = getRequestUrl(request).searchParams;
      const category = query.get('category') || '';
      const subcategory = query.get('subcategory') || '';
      const search = query.get('search') || '';
      const isAdminList = query.get('all') === '1' && Boolean(readSession(request));

      const rows = await sql`
        SELECT *
        FROM products
        WHERE (${isAdminList} OR active = true)
          AND (${category} = '' OR category = ${category})
          AND (${subcategory} = '' OR subcategory = ${subcategory})
          AND (${search} = '' OR name ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `;

      return json({ products: rows.map((row) => mapProduct(row as Record<string, unknown>)) });
    }

    if (request.method === 'POST') {
      if (!readSession(request)) {
        return json({ error: 'Não autenticado' }, 401);
      }

      const body = await readJson<ProductInput>(request);
      const validationError = validateProduct(body);
      if (validationError) {
        return json({ error: validationError }, 400);
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

      return json({ product: mapProduct(rows[0] as Record<string, unknown>) }, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Products collection error:', error);
    return json({ error: 'Erro ao processar produtos' }, 500);
  }
});
