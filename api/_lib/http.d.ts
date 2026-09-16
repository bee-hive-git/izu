export function json(
  data: unknown,
  status?: number,
  headers?: Headers | Record<string, string>,
): Response;

export function getRequestUrl(request: Request): URL;
export function getCookie(request: Request, name: string): string | undefined;
export function getPathParam(request: Request, name: string, fallbackPath: RegExp): string | undefined;
export function readJson<T = unknown>(request: Request): Promise<T>;
export function nodeToRequest(req: unknown): Promise<Request>;
export function writeNodeResponse(
  res: {
    statusCode?: number;
    status?: (code: number) => { send?: (body: unknown) => unknown };
    setHeader?: (key: string, value: string | string[]) => void;
    end?: (body?: string | Uint8Array) => void;
  },
  response: Response,
): Promise<void>;
export function defineHandler(fetchHandler: (request: Request) => Promise<Response>): {
  fetch: (request: Request) => Promise<Response>;
};
