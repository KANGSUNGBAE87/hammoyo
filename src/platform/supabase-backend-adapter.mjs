import { PlatformUnavailableError, validateRequiredFunction } from "./contracts.mjs";

const FUNCTION_NAMES = Object.freeze({
  exchangeTossAuth: "exchange-toss-auth",
  createRoom: "create-room",
  joinRoom: "join-room",
  submitResponse: "submit-response",
  recomputeRecommendation: "recompute-recommendation",
  generateShareCopy: "generate-share-copy",
  closeRoom: "close-room",
  requestDataDeletion: "request-data-deletion",
});

function defaultIntossDeepLink({ roomId, inviteSlug }) {
  const target = roomId || inviteSlug;
  if (!target) {
    throw new PlatformUnavailableError("SHARE_TARGET_MISSING", "roomId or inviteSlug is required to create a share link.");
  }
  return `intoss://hammoyo/rooms/${encodeURIComponent(target)}`;
}

function assertInvoke(invoke) {
  if (typeof invoke !== "function") {
    throw new PlatformUnavailableError("BACKEND_ADAPTER_CONFIG_MISSING", "createSupabaseBackendAdapter requires invoke.");
  }
}

export function createSupabaseBackendAdapter({ invoke, createIntossDeepLink = defaultIntossDeepLink } = {}) {
  assertInvoke(invoke);
  validateRequiredFunction(createIntossDeepLink, "createIntossDeepLink");

  const call = (operation, payload = {}) => invoke(FUNCTION_NAMES[operation], payload);

  return Object.freeze({
    kind: "supabase-backend",
    connected: true,
    exchangeTossAuth: (payload) => call("exchangeTossAuth", payload),
    createRoom: (payload) => call("createRoom", payload),
    joinRoom: (payload) => call("joinRoom", payload),
    submitResponse: (payload) => call("submitResponse", payload),
    recomputeRecommendation: (payload) => call("recomputeRecommendation", payload),
    generateShareCopy: (payload) => call("generateShareCopy", payload),
    async createShareLink(payload = {}) {
      const deepLink = createIntossDeepLink(payload);
      return {
        ok: true,
        method: "intoss-deep-link",
        deepLink,
      };
    },
    closeRoom: (payload) => call("closeRoom", payload),
    requestDataDeletion: (payload) => call("requestDataDeletion", payload),
  });
}

export function createEdgeFunctionInvoker({
  endpointBase,
  fetchImpl = globalThis.fetch,
  headers = {},
  anonKey = "",
  getSessionToken = null,
} = {}) {
  if (!endpointBase) {
    throw new PlatformUnavailableError("BACKEND_ENDPOINT_MISSING", "endpointBase is required.");
  }
  validateRequiredFunction(fetchImpl, "fetchImpl");

  const normalizedBase = String(endpointBase).replace(/\/+$/, "");

  return async function invoke(functionName, payload = {}) {
    const sessionToken =
      typeof getSessionToken === "function" ? await getSessionToken({ functionName, payload }) : getSessionToken;
    const requestHeaders = {
      "content-type": "application/json",
      ...headers,
    };
    if (anonKey && !requestHeaders.apikey) {
      requestHeaders.apikey = anonKey;
    }
    if (sessionToken) {
      requestHeaders.authorization = `Bearer ${sessionToken}`;
    }

    const response = await fetchImpl(`${normalizedBase}/${functionName}`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        code: body.code || "BACKEND_FUNCTION_FAILED",
        status: response.status,
        message: body.message || "Backend function call failed.",
      };
    }
    return body;
  };
}
