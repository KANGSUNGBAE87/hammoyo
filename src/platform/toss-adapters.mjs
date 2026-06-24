import { PlatformUnavailableError, validateRequiredFunction } from "./contracts.mjs";

function extractAuthorizationCode(loginResult) {
  if (typeof loginResult === "string") return loginResult;
  return loginResult?.authorizationCode || loginResult?.code || loginResult?.authCode || "";
}

export function createTossAuthAdapter({ appLogin, backend }) {
  validateRequiredFunction(appLogin, "appLogin");
  validateRequiredFunction(backend?.exchangeTossAuth, "backend.exchangeTossAuth");

  return Object.freeze({
    kind: "apps-in-toss-auth",
    connected: true,
    async signIn() {
      const loginResult = await appLogin();
      const authorizationCode = extractAuthorizationCode(loginResult);
      if (!authorizationCode) {
        throw new PlatformUnavailableError("TOSS_AUTH_CODE_MISSING", "appLogin did not return an authorization code.");
      }
      return backend.exchangeTossAuth({ authorizationCode });
    },
    async signOut() {
      return { ok: true };
    },
  });
}

export function createTossShareAdapter({ getTossShareLink }) {
  validateRequiredFunction(getTossShareLink, "getTossShareLink");

  return Object.freeze({
    kind: "apps-in-toss-share",
    connected: true,
    async createInvite({ deepLink, ogImageUrl }) {
      if (!deepLink || !/^intoss:\/\//.test(deepLink)) {
        throw new PlatformUnavailableError("INVALID_SHARE_TARGET", "Apps in Toss share targets must be intoss:// deep links.");
      }
      const shareLink = await getTossShareLink(deepLink, ogImageUrl);
      return {
        ok: true,
        method: "getTossShareLink",
        url: shareLink,
      };
    },
  });
}
