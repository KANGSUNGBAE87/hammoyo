export const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-max-age": "86400",
  vary: "Origin",
};

export function jsonResponse(body: Record<string, unknown>, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

export function jsonError(code: string, message: string, status = 400) {
  return jsonResponse({ ok: false, code, message }, { status });
}

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function preflightResponse() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function methodNotAllowed() {
  return jsonResponse({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405 });
}

export function requirePost(request: Request) {
  if (request.method === "OPTIONS") return preflightResponse();
  return request.method === "POST" ? null : methodNotAllowed();
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const code = message.includes("required") ? "BACKEND_NOT_CONFIGURED" : "BACKEND_OPERATION_FAILED";
  console.error("[hammoyo-edge-function-error]", message);
  const safeMessage =
    code === "BACKEND_NOT_CONFIGURED"
      ? "Backend configuration is not ready."
      : "Unable to complete this request.";
  return jsonError(code, safeMessage, code === "BACKEND_NOT_CONFIGURED" ? 503 : 500);
}
