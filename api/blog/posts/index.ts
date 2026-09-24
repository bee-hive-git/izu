import { readSession } from '../../_lib/auth.js';
import { MAX_FEATURED, isUuid, mapPost, parsePostInput, randomSlugSuffix, slugify } from '../../_lib/blog.js';
import { sql } from '../../_lib/db.js';
import { defineHandler, getRequestUrl, json, readJson } from '../../_lib/http.js';

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let candidate = base;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const rows = await sql`SELECT 1 FROM blog_posts WHERE slug = ${candidate} LIMIT 1`;
    if (rows.length === 0) {
      return candidate;
    }
    candidate = `${base}-${randomSlugSuffix()}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function errorCode(error: unknown) {
  return typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
}

const handler = defineHandler(async (request) => {
  try {
    if (request.method === 'GET') {
      const query = getRequestUrl(request).searchParams;
      const isAdminList = query.get('all') === '1' && Boolean(readSession(request));
      const category = query.get('category') || '';
      const excludeParam = query.get('exclude') || '';
      const exclude = isUuid(excludeParam) ? excludeParam : null;
      const limit = Math.min(Math.max(Number(query.get('limit')) || 100, 1), 100);

      const rows = await sql`
        SELECT id, slug, title, subtitle, category, cover_image, published_at, published, featured, created_at, updated_at
        FROM blog_posts
        WHERE (${isAdminList} OR published = true)
          AND (${category} = '' OR category = ${category})
          AND (${exclude}::uuid IS NULL OR id <> ${exclude}::uuid)
        ORDER BY featured DESC, published_at DESC
        LIMIT ${limit}
      `;

      return json({ posts: rows.map((row) => mapPost(row)) });
    }

    if (request.method === 'POST') {
      if (!readSession(request)) {
        return json({ error: 'Não autenticado' }, 401);
      }

      const parsed = parsePostInput(await readJson(request));
      if (!parsed.data) {
        return json({ error: parsed.error }, 400);
      }
      const post = parsed.data;

      if (post.featured) {
        const [{ count }] = await sql`SELECT count(*)::int AS count FROM blog_posts WHERE featured = true`;
        if (Number(count) >= MAX_FEATURED) {
          return json({ error: `Já existem ${MAX_FEATURED} posts em destaque. Remova o destaque de outro post antes.` }, 400);
        }
      }

      const slug = await uniqueSlug(post.title);

      try {
        const rows = await sql`
          INSERT INTO blog_posts (slug, title, subtitle, category, cover_image, published_at, published, featured, content)
          VALUES (
            ${slug},
            ${post.title},
            ${post.subtitle},
            ${post.category},
            ${post.cover_image},
            COALESCE(${post.published_at}::timestamptz, now()),
            ${post.published},
            ${post.featured},
            ${JSON.stringify(post.content)}::jsonb
          )
          RETURNING *
        `;
        return json({ post: mapPost(rows[0]) }, 201);
      } catch (error) {
        if (errorCode(error) === '23503') {
          return json({ error: 'Categoria não encontrada' }, 400);
        }
        throw error;
      }
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Blog posts error:', error);
    return json({ error: 'Erro ao processar posts do blog' }, 500);
  }
});

export const GET = handler.fetch;
export const POST = handler.fetch;
export default handler;
