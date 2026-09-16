import { clearSessionCookieValue } from '../_lib/auth.js';
import { defineHandler, json } from '../_lib/http.js';

const handler = defineHandler(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  return json({ success: true }, 200, { 'Set-Cookie': clearSessionCookieValue() });
});

export const POST = handler.fetch;
export default handler;
