import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

type SqlClient = NeonQueryFunction<false, false>;

let sqlClient: SqlClient | undefined;

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

export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getSql()(strings, ...values)) as SqlClient;

export type ProductRecord = {
  id: string;
  name: string;
  description: string;
  images: string[];
  height: number;
  width: number;
  depth: number;
  colors: string[];
  category: string;
  subcategory: string;
  weight: number | null;
  engraving_dimensions: string | null;
  additional_info: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export function mapProduct(row: Record<string, unknown>): ProductRecord {
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
