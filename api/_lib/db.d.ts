export const sql: (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Array<Record<string, unknown>>>;

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

export function mapProduct(row: Record<string, unknown>): ProductRecord;
