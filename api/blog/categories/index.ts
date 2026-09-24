import { readSession } from '../../_lib/auth.js';
import { mapCategory } from '../../_lib/blog.js';
import { sql } from '../../_lib/db.js';
import { defineHandler, json, readJson } from '../../_lib/http.js';

const handler = defineHandler(async (request) => {
  try {
    if (request.method === 'GET') {
      const rows = await sql`
        SELECT c.id, c.name, count(p.id)::int AS post_count
        FROM blog_categories c
        LEFT JOIN blog_posts p ON p.category = c.name
        GROUP BY c.id, c.name
        ORDER BY c.name
      `;
      return json({ categories: rows.map((row) => mapCategory(row)) });
    }

    if (request.method === 'POST') {
      if (!readSession(request)) {
        return json({ error: 'Não autenticado' }, 401);
      }

      const body = await readJson<{ name?: string }>(request);
      const name = body.name?.trim().slice(0, 60) || '';
      if (!name) {
        return json({ error: 'Informe o nome da categoria' }, 400);
      }

      const rows = await sql`
        INSERT INTO blog_categories (name) VALUES (${name})
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name
      `;
      if (rows.length === 0) {
        return json({ error: 'Já existe uma categoria com esse nome' }, 409);
      }
      return json({ category: mapCategory(rows[0]) }, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Blog categories error:', error);
    return json({ error: 'Erro ao processar categorias' }, 500);
  }
});

export const GET = handler.fetch;
export const POST = handler.fetch;
export default handler;
