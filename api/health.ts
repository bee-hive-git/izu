async function handleHealth(request: Request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return Response.json({
    ok: true,
    database: Boolean(process.env.DATABASE_URL),
    session: Boolean(process.env.SESSION_SECRET),
  });
}

export function GET(request: Request) {
  return handleHealth(request);
}

export default {
  fetch: handleHealth,
};
