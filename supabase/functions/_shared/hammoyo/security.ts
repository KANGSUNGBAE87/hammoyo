import { getProviderHashSecret, getSessionSecret, runQuery } from "./backend.ts";

type SessionPayload = {
  coreUserId: string;
  exp: number;
};

function bytes(input: string) {
  return new TextEncoder().encode(input);
}

function base64Url(buffer: ArrayBuffer | Uint8Array) {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  data.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", bytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, bytes(message));
}

export async function hashProviderSubject(providerSubject: string) {
  const digest = await hmac(getProviderHashSecret(), providerSubject);
  return base64Url(digest);
}

export async function signSessionToken(coreUserId: string, ttlSeconds = 60 * 60 * 24 * 14) {
  const payload: SessionPayload = {
    coreUserId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = base64Url(bytes(JSON.stringify(payload)));
  const signature = base64Url(await hmac(getSessionSecret(), encodedPayload));
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(authorizationHeader: string | null) {
  const token = authorizationHeader?.startsWith("Bearer ") ? authorizationHeader.slice("Bearer ".length) : "";
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return { ok: false as const, code: "SESSION_REQUIRED" };

  const expectedSignature = base64Url(await hmac(getSessionSecret(), encodedPayload));
  if (signature !== expectedSignature) return { ok: false as const, code: "SESSION_INVALID" };

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
  if (!payload.coreUserId || payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false as const, code: "SESSION_EXPIRED" };
  }

  return { ok: true as const, coreUserId: payload.coreUserId };
}

export async function requireActiveSession(supabase: unknown, request: Request) {
  const session = await verifySessionToken(request.headers.get("authorization"));
  if (!session.ok) return session;

  const user = await runQuery(
    // deno-lint-ignore no-explicit-any
    (supabase as any)
      .from("core_users")
      .select("id, deleted_at")
      .eq("id", session.coreUserId)
      .maybeSingle(),
  );
  if (!user || user.deleted_at) return { ok: false as const, code: "SESSION_REVOKED" };

  return session;
}
