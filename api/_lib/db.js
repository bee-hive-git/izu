import { neon } from '@neondatabase/serverless';

let sqlClient;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  try {
    const parsed = new URL(databaseUrl);
    parsed.searchParams.delete('channel_binding');
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    return databaseUrl;
  }
}

function getSql() {
  if (!sqlClient) {
    sqlClient = neon(getDatabaseUrl());
  }
  return sqlClient;
}

export const sql = (strings, ...values) => getSql()(strings, ...values);

export function mapProduct(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    height: Number(row.height),
    width: Number(row.width),
    depth: Number(row.depth),
    colors: Array.isArray(row.colors) ? row.colors.map(String) : [],
    category: String(row.category),
    subcategory: String(row.subcategory),
    weight: row.weight == null ? null : Number(row.weight),
    engraving_dimensions: row.engraving_dimensions == null ? null : String(row.engraving_dimensions),
    additional_info: row.additional_info == null ? null : String(row.additional_info),
    active: Boolean(row.active),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(String(row.created_at)).toISOString(),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(String(row.updated_at)).toISOString(),
  };
}
