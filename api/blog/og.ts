import { sql } from '../_lib/db.js';
import { defineHandler, getRequestUrl } from '../_lib/http.js';

const SITE_NAME = 'Izu Mochilas e Brindes';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ogImageFor(cover: string) {
  return /\/blog\/[^/]+\.webp$/.test(cover) ? cover.replace(/\.webp$/, '-og.jpg') : cover;
}

async function loadShell(origin: string) {
  try {
    const response = await fetch(`${origin}/index.html`, { headers: { accept: 'text/html' } });
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('Blog OG shell fetch error:', error);
  }
  return '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8" /><title></title></head><body><div id="root"></div></body></html>';
}

function htmlResponse(html: string, cacheSeconds: number) {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  });
}

const handler = defineHandler(async (request) => {
  const url = getRequestUrl(request);
  const slug = url.searchParams.get('slug') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const origin = `https://${forwardedHost}`;
  const shell = await loadShell(origin);

  if (!slug) {
    return htmlResponse(shell, 60);
  }

  let post: Record<string, unknown> | undefined;
  try {
    const rows = await sql`
      SELECT title, subtitle, cover_image, published_at
      FROM blog_posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    post = rows[0];
  } catch (error) {
    console.error('Blog OG query error:', error);
  }

  if (!post) {
    return htmlResponse(shell, 60);
  }

  const title = String(post.title);
  const description = post.subtitle ? String(post.subtitle) : `Leia no blog da ${SITE_NAME}.`;
  const image = ogImageFor(String(post.cover_image));
  const pageUrl = `${origin}/blog/${encodeURIComponent(slug)}`;
  const publishedAt = post.published_at instanceof Date ? post.published_at.toISOString() : String(post.published_at);

  const meta = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="article:published_time" content="${escapeHtml(publishedAt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ].join('\n    ');

  const html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(`${title} | ${SITE_NAME}`)}</title>`)
    .replace(/<\/head>/i, `    ${meta}\n  </head>`);

  return htmlResponse(html, 300);
});

export const GET = handler.fetch;
export default handler;
