import 'dotenv/config';
import http from 'node:http';
import { parse } from 'node:url';
import uploadHandler from '../api/upload';
import deleteHandler from '../api/delete';
import loginHandler from '../api/auth/login';
import logoutHandler from '../api/auth/logout';
import meHandler from '../api/auth/me';
import productsHandler from '../api/products/index';
import productItemHandler from '../api/products/[id]';
import healthHandler from '../api/health';
import adminIssuesHandler from '../api/admin/issues';
import blogUploadHandler from '../api/blog/upload';
import blogOgHandler from '../api/blog/og';
import blogPostsHandler from '../api/blog/posts/index';
import blogPostItemHandler from '../api/blog/posts/[id]';
import blogCategoriesHandler from '../api/blog/categories/index';
import blogCategoryItemHandler from '../api/blog/categories/[id]';
import { nodeToRequest, writeNodeResponse } from '../api/_lib/http.js';

const PORT = 3001;

async function dispatch(
  handler: { fetch: (request: Request) => Promise<Response> },
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const request = await nodeToRequest(req);
  const response = await handler.fetch(request);
  await writeNodeResponse(res, response);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (pathname === '/api/health') {
      await dispatch(healthHandler, req, res);
    } else if (pathname === '/api/upload') {
      await dispatch(uploadHandler, req, res);
    } else if (pathname === '/api/delete') {
      await dispatch(deleteHandler, req, res);
    } else if (pathname === '/api/auth/login') {
      await dispatch(loginHandler, req, res);
    } else if (pathname === '/api/auth/logout') {
      await dispatch(logoutHandler, req, res);
    } else if (pathname === '/api/auth/me') {
      await dispatch(meHandler, req, res);
    } else if (pathname === '/api/products') {
      await dispatch(productsHandler, req, res);
    } else if (pathname.startsWith('/api/products/')) {
      await dispatch(productItemHandler, req, res);
    } else if (pathname === '/api/admin/issues') {
      await dispatch(adminIssuesHandler, req, res);
    } else if (pathname === '/api/blog/upload') {
      await dispatch(blogUploadHandler, req, res);
    } else if (pathname === '/api/blog/og') {
      await dispatch(blogOgHandler, req, res);
    } else if (pathname === '/api/blog/posts') {
      await dispatch(blogPostsHandler, req, res);
    } else if (pathname.startsWith('/api/blog/posts/')) {
      await dispatch(blogPostItemHandler, req, res);
    } else if (pathname === '/api/blog/categories') {
      await dispatch(blogCategoriesHandler, req, res);
    } else if (pathname.startsWith('/api/blog/categories/')) {
      await dispatch(blogCategoryItemHandler, req, res);
    } else {
      console.log(`Route not found: ${pathname}`);
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } catch (error) {
    console.error('Server error handling request:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`> Local API server running at http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
