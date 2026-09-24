import { readSession } from '../_lib/auth.js';
import { listStorageFolder, storagePathFromUrl } from '../_lib/bunny.js';
import { sql } from '../_lib/db.js';
import { defineHandler, json, readJson } from '../_lib/http.js';

type ProductRow = {
  id: string;
  name: string;
  category: string;
  active: boolean;
  images: string[];
};

async function externalImageMissing(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    return !response.ok || !(response.headers.get('content-type') || '').startsWith('image/');
  } catch {
    return true;
  }
}

async function findMissingImages(products: ProductRow[]) {
  const stored = new Set(await listStorageFolder('produtos'));
  const externalChecks = new Map<string, Promise<boolean>>();

  const result = new Map<string, string[]>();
  for (const product of products) {
    const missing: string[] = [];
    for (const url of product.images) {
      const path = storagePathFromUrl(url);
      if (path) {
        if (!stored.has(path)) missing.push(url);
        continue;
      }
      if (!externalChecks.has(url)) externalChecks.set(url, externalImageMissing(url));
      if (await externalChecks.get(url)) missing.push(url);
    }
    result.set(product.id, missing);
  }
  return result;
}

async function loadProducts(id?: string) {
  const rows = id
    ? await sql`SELECT id, name, category, active, images FROM products WHERE id = ${id}`
    : await sql`SELECT id, name, category, active, images FROM products ORDER BY name`;
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    active: Boolean(row.active),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
  }));
}

const handler = defineHandler(async (request) => {
  if (!readSession(request)) {
    return json({ error: 'Não autenticado' }, 401);
  }

  try {
    if (request.method === 'GET') {
      const products = await loadProducts();
      const missingById = await findMissingImages(products);

      const issues = products
        .map((product) => {
          const missing = missingById.get(product.id) ?? [];
          const problems: string[] = [];
          if (product.images.length === 0) problems.push('no_images');
          if (missing.length) problems.push('missing_images');
          if (missing.length && missing.includes(product.images[0])) problems.push('missing_cover');
          if (product.images.length > 0 && missing.length === product.images.length) problems.push('all_missing');
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            active: product.active,
            total_images: product.images.length,
            missing_images: missing,
            preview: product.images.find((url) => !missing.includes(url)) ?? null,
            problems,
          };
        })
        .filter((item) => item.problems.length > 0);

      return json({ issues, checked: products.length });
    }

    if (request.method === 'POST') {
      const body = await readJson<{ action?: string; productId?: string }>(request);
      if (body.action !== 'remove_missing' || !body.productId) {
        return json({ error: 'Ação inválida' }, 400);
      }

      const [product] = await loadProducts(body.productId);
      if (!product) {
        return json({ error: 'Produto não encontrado' }, 404);
      }

      const missing = new Set((await findMissingImages([product])).get(product.id) ?? []);
      const images = product.images.filter((url) => !missing.has(url));
      if (images.length === 0) {
        return json({ error: 'Todas as fotos deste produto se perderam. Envie novas fotos pela edição do produto.' }, 400);
      }

      await sql`UPDATE products SET images = ${images}, updated_at = now() WHERE id = ${product.id}`;
      return json({ removed: missing.size, remaining: images.length });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Admin issues error:', error);
    return json({ error: 'Erro ao verificar os produtos' }, 500);
  }
});

export const GET = handler.fetch;
export const POST = handler.fetch;
export default handler;
