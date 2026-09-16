import { clearSessionCookieValue } from '../../server/auth';
import { defineHandler, json } from '../../server/http';

export const config = {
  runtime: 'nodejs',
};

export default defineHandler(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  return json({ success: true }, 200, { 'Set-Cookie': clearSessionCookieValue() });
});
