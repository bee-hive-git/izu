import type { IncomingMessage, ServerResponse } from 'http';

export type VercelLikeRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function readJson<T>(req: IncomingMessage): Promise<T> {
  if ((req as VercelLikeRequest).body && typeof (req as VercelLikeRequest).body === 'object') {
    return (req as VercelLikeRequest).body as T;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('JSON inválido');
  }
}

export function getCookie(req: IncomingMessage, name: string): string | undefined {
  const header = req.headers.cookie;
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

export function getPathParam(req: VercelLikeRequest, name: string, fallbackPath?: RegExp): string | undefined {
  const queryValue = req.query?.[name];
  if (Array.isArray(queryValue)) {
    return queryValue[0];
  }
  if (typeof queryValue === 'string' && queryValue.length > 0) {
    return queryValue;
  }

  if (!fallbackPath || !req.url) {
    return undefined;
  }

  const pathname = req.url.split('?')[0];
  const match = pathname.match(fallbackPath);
  return match?.[1];
}
