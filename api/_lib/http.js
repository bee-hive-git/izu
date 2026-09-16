function headerValue(value) {
  if (!value) {
    return '';
  }
  return Array.isArray(value) ? value.join(', ') : value;
}

export function json(data, status = 200, headers) {
  return Response.json(data, { status, headers });
}

export function getRequestUrl(request) {
  try {
    return new URL(request.url);
  } catch {
    return new URL(request.url, 'http://localhost');
  }
}

export function getCookie(request, name) {
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

export function getPathParam(request, name, fallbackPath) {
  const url = getRequestUrl(request);
  const fromQuery = url.searchParams.get(name);
  if (fromQuery) {
    return fromQuery;
  }

  return url.pathname.match(fallbackPath)?.[1];
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function readNodeBody(req) {
  if (req.body != null) {
    if (typeof req.body === 'string' || req.body instanceof Uint8Array) {
      return req.body;
    }
    return JSON.stringify(req.body);
  }

  if (typeof req[Symbol.asyncIterator] !== 'function') {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
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

export async function nodeToRequest(req) {
  if (req instanceof Request) {
    return req;
  }

  const method = req.method || 'GET';
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value) {
      continue;
    }
    headers.set(key, headerValue(value));
  }

  const host = headers.get('host') || 'localhost';
  const url = `https://${host}${req.url || '/'}`;
  const init = { method, headers };

  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readNodeBody(req);
    if (body != null) {
      init.body = body;
      init.duplex = 'half';
    }
  }

  return new Request(url, init);
}

export async function writeNodeResponse(res, response) {
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

export function defineHandler(fetchHandler) {
  return {
    async fetch(request) {
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
