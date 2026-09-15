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

  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Erro na requisição');
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

export const productsApi = {
  list: (params?: { category?: string; subcategory?: string; search?: string; all?: boolean }) => {
    const searchParams = new URLSearchParams();
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
