import { readSession } from '../../_lib/auth.js';
import { isUuid, mapCategory } from '../../_lib/blog.js';
import { sql } from '../../_lib/db.js';
import { defineHandler, getPathParam, json, readJson } from '../../_lib/http.js';

const handler = defineHandler(async (request) => {
  const id = getPathParam(request, 'id', /\/api\/blog\/categories\/([^/]+)/);
  if (!isUuid(id)) {
    return json({ error: 'Categoria inválida' }, 400);
  }

  if (!readSession(request)) {
    return json({ error: 'Não autenticado' }, 401);
  }

  try {
    if (request.method === 'PUT') {
      const body = await readJson<{ name?: string }>(request);
      const name = body.name?.trim().slice(0, 60) || '';
      if (!name) {
        return json({ error: 'Informe o nome da categoria' }, 400);
      }

      const duplicate = await sql`SELECT 1 FROM blog_categories WHERE name = ${name} AND id <> ${id}::uuid`;
      if (duplicate.length) {
        return json({ error: 'Já existe uma categoria com esse nome' }, 409);
      }

      const rows = await sql`
        UPDATE blog_categories SET name = ${name} WHERE id = ${id}::uuid RETURNING id, name
      `;
      if (rows.length === 0) {
        return json({ error: 'Categoria não encontrada' }, 404);
      }
      return json({ category: mapCategory(rows[0]) });
    }

    if (request.method === 'DELETE') {
      const [{ count }] = await sql`
        SELECT count(p.id)::int AS count
        FROM blog_categories c
        LEFT JOIN blog_posts p ON p.category = c.name
        WHERE c.id = ${id}::uuid
      `;
      if (Number(count) > 0) {
        return json({ error: `Essa categoria tem ${count} post(s). Mova-os para outra categoria antes de excluir.` }, 409);
      }

      const rows = await sql`DELETE FROM blog_categories WHERE id = ${id}::uuid RETURNING id`;
      if (rows.length === 0) {
        return json({ error: 'Categoria não encontrada' }, 404);
      }
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Blog category item error:', error);
    return json({ error: 'Erro ao processar categoria' }, 500);
  }
});

export const PUT = handler.fetch;
export const DELETE = handler.fetch;
export default handler;
