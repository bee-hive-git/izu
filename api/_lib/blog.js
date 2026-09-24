import { randomBytes } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { deleteProductImage, storagePathFromUrl } from './bunny.js';

export const MAX_FEATURED = 3;
export const IMAGE_VARIANT_WIDTHS = [480, 960];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function slugify(text) {
  const slug = String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug || 'post';
}

export function randomSlugSuffix() {
  return randomBytes(3).toString('hex');
}

const SANITIZE_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    b: 'strong',
    i: 'em',
    strike: 's',
    del: 's',
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href || '',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  },
};

export function sanitizeRichText(html) {
  return sanitizeHtml(String(html || ''), SANITIZE_OPTIONS).trim();
}

function textIsEmpty(html) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim() === '';
}

function blockId(value) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 64) : randomBytes(6).toString('hex');
}

export function sanitizeContent(content) {
  if (!Array.isArray(content)) {
    return [];
  }

  const blocks = [];
  for (const raw of content) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }

    if (raw.type === 'text') {
      const html = sanitizeRichText(raw.html);
      if (!textIsEmpty(html)) {
        blocks.push({ id: blockId(raw.id), type: 'text', html });
      }
    } else if (raw.type === 'image') {
      if (typeof raw.url === 'string' && /^https:\/\//.test(raw.url)) {
        blocks.push({
          id: blockId(raw.id),
          type: 'image',
          url: raw.url,
          alt: typeof raw.alt === 'string' ? raw.alt.trim().slice(0, 300) : '',
        });
      }
    } else if (raw.type === 'products') {
      const productIds = Array.isArray(raw.productIds)
        ? [...new Set(raw.productIds.filter(isUuid))].slice(0, 12)
        : [];
      if (productIds.length) {
        blocks.push({ id: blockId(raw.id), type: 'products', productIds });
      }
    }
  }
  return blocks;
}

export function parsePostInput(body) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const coverImage = typeof body?.cover_image === 'string' ? body.cover_image.trim() : '';

  if (!title) {
    return { error: 'Informe o título do post' };
  }
  if (!category) {
    return { error: 'Escolha uma categoria' };
  }
  if (!/^https:\/\//.test(coverImage)) {
    return { error: 'Adicione a foto de capa' };
  }

  let publishedAt = null;
  if (body?.published_at) {
    const date = new Date(String(body.published_at));
    if (Number.isNaN(date.getTime())) {
      return { error: 'Data de publicação inválida' };
    }
    publishedAt = date.toISOString();
  }

  const subtitle = typeof body?.subtitle === 'string' ? body.subtitle.trim().slice(0, 400) : '';

  return {
    data: {
      title: title.slice(0, 200),
      subtitle: subtitle || null,
      category,
      cover_image: coverImage,
      published_at: publishedAt,
      published: Boolean(body?.published),
      featured: Boolean(body?.featured),
      content: sanitizeContent(body?.content),
    },
  };
}

function toIso(value) {
  if (value == null) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
}

export function mapPost(row) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: row.subtitle == null ? null : String(row.subtitle),
    category: String(row.category),
    cover_image: String(row.cover_image),
    published_at: toIso(row.published_at),
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    content: Array.isArray(row.content) ? row.content : undefined,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

export function mapCategory(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    post_count: row.post_count == null ? 0 : Number(row.post_count),
  };
}

export function postImageUrls(post) {
  const urls = [];
  if (post?.cover_image) {
    urls.push(String(post.cover_image));
  }
  if (Array.isArray(post?.content)) {
    for (const block of post.content) {
      if (block?.type === 'image' && block.url) {
        urls.push(String(block.url));
      }
    }
  }
  return urls;
}

function variantPaths(path) {
  const match = path.match(/^(blog\/[^/]+)\.webp$/);
  if (!match) {
    return [path];
  }
  const base = match[1];
  return [path, ...IMAGE_VARIANT_WIDTHS.map((width) => `${base}-${width}.webp`), `${base}-og.jpg`];
}

export async function deleteBlogImages(urls) {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((path) => path && path.startsWith('blog/'))
    .flatMap(variantPaths);

  await Promise.allSettled(paths.map((path) => deleteProductImage(path)));
}
