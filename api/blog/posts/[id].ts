import { readSession } from '../../_lib/auth.js';
import { MAX_FEATURED, deleteBlogImages, isUuid, mapPost, parsePostInput, postImageUrls } from '../../_lib/blog.js';
import { sql } from '../../_lib/db.js';
import { defineHandler, getPathParam, json, readJson } from '../../_lib/http.js';

function errorCode(error: unknown) {
  return typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
}

const handler = defineHandler(async (request) => {
  const idOrSlug = getPathParam(request, 'id', /\/api\/blog\/posts\/([^/]+)/);
  if (!idOrSlug) {
    return json({ error: 'Post inválido' }, 400);
  }

  const isAdmin = Boolean(readSession(request));

  try {
    if (request.method === 'GET') {
      const byId = isUuid(idOrSlug);
      const rows = byId
        ? await sql`SELECT * FROM blog_posts WHERE id = ${idOrSlug}::uuid AND (${isAdmin} OR published = true)`
        : await sql`SELECT * FROM blog_posts WHERE slug = ${idOrSlug} AND (${isAdmin} OR published = true)`;

      if (rows.length === 0) {
        return json({ error: 'Post não encontrado' }, 404);
      }
      return json({ post: mapPost(rows[0]) });
    }

    if (!isAdmin) {
      return json({ error: 'Não autenticado' }, 401);
    }
    if (!isUuid(idOrSlug)) {
      return json({ error: 'Post inválido' }, 400);
    }
    const id = idOrSlug;

    const existingRows = await sql`SELECT * FROM blog_posts WHERE id = ${id}::uuid`;
    if (existingRows.length === 0) {
      return json({ error: 'Post não encontrado' }, 404);
    }
    const existing = existingRows[0];

    if (request.method === 'PUT') {
      const parsed = parsePostInput(await readJson(request));
      if (!parsed.data) {
        return json({ error: parsed.error }, 400);
      }
      const post = parsed.data;

      if (post.featured) {
        const [{ count }] = await sql`
          SELECT count(*)::int AS count FROM blog_posts WHERE featured = true AND id <> ${id}::uuid
        `;
        if (Number(count) >= MAX_FEATURED) {
          return json({ error: `Já existem ${MAX_FEATURED} posts em destaque. Remova o destaque de outro post antes.` }, 400);
        }
      }

      let rows;
      try {
        rows = await sql`
          UPDATE blog_posts
          SET
            title = ${post.title},
            subtitle = ${post.subtitle},
            category = ${post.category},
            cover_image = ${post.cover_image},
            published_at = COALESCE(${post.published_at}::timestamptz, published_at),
            published = ${post.published},
            featured = ${post.featured},
            content = ${JSON.stringify(post.content)}::jsonb,
            updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING *
        `;
      } catch (error) {
        if (errorCode(error) === '23503') {
          return json({ error: 'Categoria não encontrada' }, 400);
        }
        throw error;
      }

      const keptUrls = new Set(postImageUrls(post));
      const removedUrls = postImageUrls(existing).filter((url) => !keptUrls.has(url));
      if (removedUrls.length) {
        await deleteBlogImages(removedUrls);
      }

      return json({ post: mapPost(rows[0]) });
    }

    if (request.method === 'DELETE') {
      await sql`DELETE FROM blog_posts WHERE id = ${id}::uuid`;
      await deleteBlogImages(postImageUrls(existing));
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Blog post item error:', error);
    return json({ error: 'Erro ao processar post' }, 500);
  }
});

export const GET = handler.fetch;
export const PUT = handler.fetch;
export const DELETE = handler.fetch;
export default handler;
