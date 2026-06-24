import { notConnectedResult } from "./contracts.mjs";

export function createPreviewBackendAdapter() {
  const blocked = (operation) =>
    Promise.resolve(
      notConnectedResult(operation, "Static preview stores data locally and does not call Supabase or server APIs."),
    );

  return Object.freeze({
    kind: "preview-backend",
    connected: false,
    exchangeTossAuth: () => blocked("exchangeTossAuth"),
    createRoom: () => blocked("createRoom"),
    joinRoom: () => blocked("joinRoom"),
    submitResponse: () => blocked("submitResponse"),
    recomputeRecommendation: () => blocked("recomputeRecommendation"),
    createShareLink: () => blocked("createShareLink"),
    closeRoom: () => blocked("closeRoom"),
    requestDataDeletion: () => blocked("requestDataDeletion"),
  });
}

export function createPreviewShareAdapter() {
  return Object.freeze({
    kind: "preview-share",
    connected: false,
    async createInvite({ locale = "ko" } = {}) {
      const text =
        locale === "en"
          ? "Preview-only invite copy. A real participant link will be generated after ShareAdapter and Supabase are connected."
          : "preview 전용 초대 문구입니다. 실제 참여 링크는 ShareAdapter와 Supabase 연결 후 생성됩니다.";
      return {
        ok: false,
        code: "SHARE_ADAPTER_NOT_CONNECTED",
        text,
      };
    },
    async createResultCopy({ text = "" } = {}) {
      return {
        ok: true,
        method: "clipboard-text",
        text,
      };
    },
  });
}

export function createPreviewAuthAdapter() {
  return Object.freeze({
    kind: "preview-auth",
    connected: false,
    async getCurrentUser() {
      return { ok: false, code: "AUTH_NOT_CONNECTED", user: null };
    },
    async signIn() {
      return { ok: false, code: "AUTH_NOT_CONNECTED" };
    },
    async signOut() {
      return { ok: true };
    },
  });
}
