import { defineHandler, json } from '../server/http';

export const config = {
  runtime: 'nodejs',
};

export default defineHandler(async (request) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  return json({
    ok: true,
    database: Boolean(process.env.DATABASE_URL),
    session: Boolean(process.env.SESSION_SECRET),
  });
});
