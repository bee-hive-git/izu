export type AppHandler = {
  fetch: (request: Request) => Promise<Response>;
};

type NodeLikeRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  [Symbol.asyncIterator]?: () => AsyncIterableIterator<unknown>;
};

type NodeLikeResponse = {
  statusCode?: number;
  status?: (code: number) => NodeLikeResponse;
  send?: (body: unknown) => unknown;
  setHeader?: (key: string, value: string | string[]) => void;
  end?: (body?: string | Uint8Array) => void;
};

function headerValue(value: string | string[] | undefined) {
  if (!value) {
    return '';
  }
  return Array.isArray(value) ? value.join(', ') : value;
}

export function json(data: unknown, status = 200, headers?: Headers | Record<string, string>) {
  return Response.json(data, { status, headers });
}

export function getRequestUrl(request: Request) {
  try {
    return new URL(request.url);
  } catch {
    return new URL(request.url, 'http://localhost');
  }
}

export function getCookie(request: Request, name: string) {
  const header = request.headers.get('cookie');
  if (!header) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}

export function getPathParam(request: Request, name: string, fallbackPath: RegExp) {
  const url = getRequestUrl(request);
  const fromQuery = url.searchParams.get(name);
  if (fromQuery) {
    return fromQuery;
  }

  return url.pathname.match(fallbackPath)?.[1];
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

async function readNodeBody(req: NodeLikeRequest) {
  if (req.body != null) {
    if (typeof req.body === 'string' || req.body instanceof Uint8Array) {
      return req.body;
    }
    return JSON.stringify(req.body);
  }

  if (typeof req[Symbol.asyncIterator] !== 'function') {
    return undefined;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req as AsyncIterable<unknown>) {
    if (typeof chunk === 'string') {
      chunks.push(new TextEncoder().encode(chunk));
    } else if (chunk instanceof Uint8Array) {
      chunks.push(chunk);
    }
  }

  if (!chunks.length) {
    return undefined;
  }

  const total = chunks.reduce((size, chunk) => size + chunk.byteLength, 0);
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function nodeToRequest(req: unknown): Promise<Request> {
  if (req instanceof Request) {
    return req;
  }

  const nodeReq = req as NodeLikeRequest;
  const method = nodeReq.method || 'GET';
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeReq.headers || {})) {
    if (!value) {
      continue;
    }
    headers.set(key, headerValue(value));
  }

  const host = headers.get('host') || 'localhost';
  const url = `https://${host}${nodeReq.url || '/'}`;
  const init: RequestInit = { method, headers };

  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readNodeBody(nodeReq);
    if (body != null) {
      init.body = body;
      Object.assign(init, { duplex: 'half' });
    }
  }

  return new Request(url, init);
}

export async function writeNodeResponse(res: NodeLikeResponse, response: Response) {
  const cookies =
    typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  const body = new Uint8Array(await response.arrayBuffer());

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      return;
    }
    res.setHeader?.(key, value);
  });

  if (cookies.length === 1) {
    res.setHeader?.('Set-Cookie', cookies[0]);
  } else if (cookies.length > 1) {
    res.setHeader?.('Set-Cookie', cookies);
  }

  if (typeof res.status === 'function') {
    const next = res.status(response.status);
    if (typeof next.send === 'function') {
      next.send(body);
      return;
    }
  }

  res.statusCode = response.status;
  res.end?.(body);
}

export function defineHandler(fetchHandler: (request: Request) => Promise<Response>): AppHandler {
  return {
    async fetch(request: Request) {
      try {
        return await fetchHandler(request);
      } catch (error) {
        console.error('Handler error:', error);
        return json(
          { error: error instanceof Error ? error.message : 'Erro interno' },
          500,
        );
      }
    },
  };
}
