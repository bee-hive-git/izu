export type BlogBlock =
  | { id: string; type: 'text'; html: string }
  | { id: string; type: 'image'; url: string; alt: string }
  | { id: string; type: 'products'; productIds: string[] };

export type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  cover_image: string;
  published_at: string | null;
  published: boolean;
  featured: boolean;
  content?: BlogBlock[];
  created_at: string | null;
  updated_at: string | null;
};

export type BlogCategoryRecord = {
  id: string;
  name: string;
  post_count: number;
};

export const MAX_FEATURED: number;
export const IMAGE_VARIANT_WIDTHS: number[];
export function isUuid(value: unknown): value is string;
export function slugify(text: string): string;
export function randomSlugSuffix(): string;
export function sanitizeRichText(html: unknown): string;
export function sanitizeContent(content: unknown): BlogBlock[];
export type BlogPostInput = {
  title: string;
  subtitle: string | null;
  category: string;
  cover_image: string;
  published_at: string | null;
  published: boolean;
  featured: boolean;
  content: BlogBlock[];
};
export function parsePostInput(body: unknown): { error: string; data?: undefined } | { data: BlogPostInput; error?: undefined };
export function mapPost(row: Record<string, unknown>): BlogPostRecord;
export function mapCategory(row: Record<string, unknown>): BlogCategoryRecord;
export function postImageUrls(post: { cover_image?: unknown; content?: unknown } | null | undefined): string[];
export function deleteBlogImages(urls: string[]): Promise<void>;
