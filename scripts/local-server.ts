import 'dotenv/config';
import http from 'http';
import { parse } from 'url';
import uploadHandler from '../api/upload';
import deleteHandler from '../api/delete';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Habilitar CORS para desenvolvimento local se necessário (mas o proxy resolve isso)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (pathname === '/api/upload') {
      await uploadHandler(req, res);
    } else if (pathname === '/api/delete') {
      await deleteHandler(req, res);
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
  console.log(`> Ready to handle /api/upload and /api/delete requests`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
