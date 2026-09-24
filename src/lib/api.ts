export type Product = {
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

export type ProductPayload = {
  name: string;
  description: string;
  images: string[];
  height: number;
  width: number;
  depth: number;
  colors: string[];
  category: string;
  subcategory: string;
  weight?: number | null;
  engraving_dimensions?: string | null;
  additional_info?: string | null;
  active?: boolean;
};

export type AdminSession = {
  email: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (options?.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const { signal, ...rest } = options ?? {};
  const response = await fetch(path, {
    credentials: 'include',
    ...rest,
    headers,
    signal: signal ?? AbortSignal.timeout(15000),
  });

  const text = await response.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
        ? data.error
        : '';
    if (message.includes('FUNCTION_INVOCATION_FAILED') || (!message && response.status >= 500)) {
      throw new Error('Servidor indisponível. Tente de novo em instantes.');
    }
    throw new Error(message || 'Erro na requisição');
  }

  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AdminSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: async () => {
    try {
      return await request<AdminSession>('/api/auth/me');
    } catch {
      return null;
    }
  },
};

export type BlogBlock =
  | { id: string; type: 'text'; html: string }
  | { id: string; type: 'image'; url: string; alt: string }
  | { id: string; type: 'products'; productIds: string[] };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  cover_image: string;
  published_at: string;
  published: boolean;
  featured: boolean;
  content?: BlogBlock[];
  created_at: string;
  updated_at: string;
};

export type BlogPostPayload = {
  title: string;
  subtitle: string | null;
  category: string;
  cover_image: string;
  published_at: string | null;
  published: boolean;
  featured: boolean;
  content: BlogBlock[];
};

export type BlogCategory = {
  id: string;
  name: string;
  post_count: number;
};

export const blogApi = {
  listPosts: (params?: { all?: boolean; category?: string; exclude?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.all) searchParams.set('all', '1');
    if (params?.category) searchParams.set('category', params.category);
    if (params?.exclude) searchParams.set('exclude', params.exclude);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return request<{ posts: BlogPost[] }>(`/api/blog/posts${query ? `?${query}` : ''}`);
  },
  getPost: (idOrSlug: string) =>
    request<{ post: BlogPost }>(`/api/blog/posts/${encodeURIComponent(idOrSlug)}`),
  createPost: (payload: BlogPostPayload) =>
    request<{ post: BlogPost }>('/api/blog/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePost: (id: string, payload: BlogPostPayload) =>
    request<{ post: BlogPost }>(`/api/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  removePost: (id: string) =>
    request<{ success: boolean }>(`/api/blog/posts/${id}`, { method: 'DELETE' }),
  listCategories: () => request<{ categories: BlogCategory[] }>('/api/blog/categories'),
  createCategory: (name: string) =>
    request<{ category: BlogCategory }>('/api/blog/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  renameCategory: (id: string, name: string) =>
    request<{ category: BlogCategory }>(`/api/blog/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  removeCategory: (id: string) =>
    request<{ success: boolean }>(`/api/blog/categories/${id}`, { method: 'DELETE' }),
  uploadImage: (file: Blob, fileName: string, kind: 'cover' | 'content') => {
    const form = new FormData();
    form.append('file', file, fileName);
    form.append('kind', kind);
    return request<{ url: string; width: number; height: number }>('/api/blog/upload', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(90000),
    });
  },
};

export type ProductIssue = {
  id: string;
  name: string;
  category: string;
  active: boolean;
  total_images: number;
  missing_images: string[];
  preview: string | null;
  problems: Array<'no_images' | 'missing_images' | 'missing_cover' | 'all_missing'>;
};

export const ISSUES_COUNT_EVENT = 'admin-issues-count';

export const adminIssuesApi = {
  list: () =>
    request<{ issues: ProductIssue[]; checked: number }>('/api/admin/issues', {
      signal: AbortSignal.timeout(60000),
    }),
  removeMissing: (productId: string) =>
    request<{ removed: number; remaining: number }>('/api/admin/issues', {
      method: 'POST',
      body: JSON.stringify({ action: 'remove_missing', productId }),
      signal: AbortSignal.timeout(30000),
    }),
};

export const productsApi = {
  list: (params?: { category?: string; subcategory?: string; search?: string; all?: boolean; ids?: string[] }) => {
    const searchParams = new URLSearchParams();
    if (params?.ids) searchParams.set('ids', params.ids.join(','));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.subcategory) searchParams.set('subcategory', params.subcategory);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.all) searchParams.set('all', '1');
    const query = searchParams.toString();
    return request<{ products: Product[] }>(`/api/products${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<{ product: Product }>(`/api/products/${id}`),
  create: (payload: ProductPayload) =>
    request<{ product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: ProductPayload) =>
    request<{ product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  setActive: (id: string, active: boolean) =>
    request<{ product: Product }>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),
};
