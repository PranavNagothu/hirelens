// Small, consistent JSON responses for route handlers.
export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function badRequest(message = "Bad request"): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Not authenticated"): Response {
  return Response.json({ error: message }, { status: 401 });
}

/** Used for both "does not exist" and "not yours" — we never reveal that another org's object exists. */
export function notFound(message = "Not found"): Response {
  return Response.json({ error: message }, { status: 404 });
}
