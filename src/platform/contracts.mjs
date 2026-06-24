export class BackendNotConnectedError extends Error {
  constructor(message = "Backend is not connected in this runtime.") {
    super(message);
    this.name = "BackendNotConnectedError";
    this.code = "BACKEND_NOT_CONNECTED";
  }
}

export class PlatformUnavailableError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PlatformUnavailableError";
    this.code = code;
  }
}

export const platformCapabilities = Object.freeze({
  preview: Object.freeze({
    auth: false,
    backend: false,
    share: false,
    aiCopy: false,
    ads: false,
    iap: false,
  }),
  appsInToss: Object.freeze({
    auth: true,
    backend: true,
    share: true,
    aiCopy: false,
    ads: false,
    iap: false,
  }),
  googlePlay: Object.freeze({
    auth: false,
    backend: true,
    share: false,
    aiCopy: false,
    ads: false,
    iap: false,
  }),
});

export function notConnectedResult(operation, message = "Connect BackendAdapter before using this operation.") {
  return {
    ok: false,
    code: "BACKEND_NOT_CONNECTED",
    operation,
    message,
  };
}

export function validateRequiredFunction(value, name) {
  if (typeof value !== "function") {
    throw new PlatformUnavailableError("PLATFORM_FUNCTION_MISSING", `${name} must be provided as a function.`);
  }
}
