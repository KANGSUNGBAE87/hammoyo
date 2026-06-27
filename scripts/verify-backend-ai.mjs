import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  assert(existsSync(path), `missing required file: ${path}`);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const backendAdapterPath = "src/platform/supabase-backend-adapter.mjs";
const aiPolicyPath = "src/platform/ai-copy-policy.mjs";
const platformReadinessPath = "docs/release/platform-readiness.md";
const implementationPlanPath = "ai/plans/implementation-plan.md";
const envExamplePath = ".env.example";
const functionPaths = [
  "supabase/functions/_shared/hammoyo/response.ts",
  "supabase/functions/_shared/hammoyo/backend.ts",
  "supabase/functions/_shared/hammoyo/security.ts",
  "supabase/functions/_shared/hammoyo/rooms.ts",
  "supabase/functions/_shared/hammoyo/recommendation.ts",
  "supabase/functions/_shared/hammoyo/ai-copy.ts",
  "supabase/functions/_shared/hammoyo/schedule-coordinator.ts",
  "supabase/functions/_shared/hammoyo/ai-provider.ts",
  "supabase/functions/exchange-toss-auth/index.ts",
  "supabase/functions/lookup-room/index.ts",
  "supabase/functions/create-room/index.ts",
  "supabase/functions/join-room/index.ts",
  "supabase/functions/submit-response/index.ts",
  "supabase/functions/recompute-recommendation/index.ts",
  "supabase/functions/generate-share-copy/index.ts",
  "supabase/functions/close-room/index.ts",
  "supabase/functions/delete-room/index.ts",
  "supabase/functions/request-data-deletion/index.ts",
];

const backendAdapterSource = read(backendAdapterPath);
const aiPolicySource = read(aiPolicyPath);
const platformReadiness = read(platformReadinessPath);
const implementationPlan = read(implementationPlanPath);
const envExample = read(envExamplePath);
const functionSources = Object.fromEntries(functionPaths.map((path) => [path, read(path)]));
const aiProviderSource = functionSources["supabase/functions/_shared/hammoyo/ai-provider.ts"];

if (failures.some((failure) => failure.startsWith("missing required file:"))) {
  console.error("[백엔드/AI 검증기] 실패");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const token of [
  "createSupabaseBackendAdapter",
  "exchangeTossAuth",
  "createRoom",
  "lookupRoom",
  "joinRoom",
  "submitResponse",
  "recomputeRecommendation",
  "createShareLink",
  "generateShareCopy",
  "closeRoom",
  "deleteRoom",
  "requestDataDeletion",
]) {
  assert(backendAdapterSource.includes(token), `Supabase backend adapter missing ${token}`);
}

assert(!backendAdapterSource.includes("localStorage"), "backend adapter must not persist auth or backend payloads in localStorage");

for (const token of [
  "buildTemplateShareCopy",
  "buildAiCopyPayload",
  "sanitizeAiCopyInput",
  "resolveShareCopy",
  "AI_COPY_DISABLED",
  "AI_COPY_FALLBACK_TEMPLATE",
]) {
  assert(aiPolicySource.includes(token), `AI copy policy missing ${token}`);
}

for (const forbidden of [
  "alias",
  "display_alias",
  "provider_subject_hash",
  "authorizationCode",
  "access_token",
  "refresh_token",
  "hardNoReason",
  "freeText",
]) {
  const pattern = new RegExp(`\\b${forbidden}\\b`);
  assert(!pattern.test(aiPolicySource), `AI copy policy source should not include forbidden payload token: ${forbidden}`);
}

for (const [path, source] of Object.entries(functionSources)) {
  if (path.endsWith("/index.ts") || path.endsWith("/response.ts")) {
    assert(source.includes("jsonResponse"), `${path} should return through jsonResponse`);
  }
  if (path !== "supabase/functions/_shared/hammoyo/backend.ts") {
    assert(!source.includes("SUPABASE_SERVICE_ROLE_KEY"), `${path} must read privileged Supabase keys only through the backend boundary`);
  }
  if (!path.endsWith("/ai-provider.ts")) {
    assert(!source.includes("DEEPSEEK_API_KEY"), `${path} must not read AI provider secrets directly outside the AI provider boundary`);
  }
  assert(!source.includes("using (true)"), `${path} must not contain public-open RLS text`);
  assert(!source.includes("localStorage"), `${path} must not persist auth payloads in localStorage`);
  assert(!source.includes("userKey"), `${path} must not reference raw Toss userKey`);
  assert(!source.includes("access_token"), `${path} must not reference provider access tokens`);
  assert(!source.includes("refresh_token"), `${path} must not reference provider refresh tokens`);
  assert(!source.includes("_NOT_CONNECTED"), `${path} must not return placeholder NOT_CONNECTED responses`);
}

const functionIndexExpectations = {
  "supabase/functions/_shared/hammoyo/response.ts": [
    "corsHeaders",
    "preflightResponse",
    "access-control-allow-origin",
    "access-control-allow-headers",
    "OPTIONS",
    "Unable to complete this request.",
  ],
  "supabase/functions/_shared/hammoyo/backend.ts": [
    "createSupabaseAdminClient",
    "HAMMOYEO_DB_ADMIN_KEY",
    "PAIRTUNE_SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "createClient",
  ],
  "supabase/functions/_shared/hammoyo/security.ts": [
    "signSessionToken",
    "verifySessionToken",
    "hashProviderSubject",
    "hashAnonymousParticipantKey",
    "generateAnonymousParticipantKey",
    "readOptionalActiveSession",
    "requireActiveSession",
    "SESSION_REVOKED",
    "deleted_at",
  ],
  "supabase/functions/_shared/hammoyo/rooms.ts": [
    "canonicalRoomStatus",
    "isJoinableRoom",
    "isWritableRoom",
    "low_confidence",
    "recommended",
    "deleted",
  ],
  "supabase/functions/_shared/hammoyo/recommendation.ts": [
    "rankCandidates",
    "minimumResponses",
    "deterministic-v2",
    "prefer: 3",
    "available: 2",
    "hardNo: 0",
    "hardNo",
    "hardNo > 0",
    "expectedCount || 4",
  ],
  "supabase/functions/_shared/hammoyo/ai-provider.ts": [
    "DEFAULT_DEEPSEEK_MODEL",
    "resolveDeepSeekModel",
    "generateAiPolishedCopy",
    "DEEPSEEK_API_KEY",
    "chat/completions",
    "thinking",
    "response_format",
    "deepseek-v4-pro",
  ],
  "supabase/functions/_shared/hammoyo/schedule-coordinator.ts": [
    "AI_COORDINATION_ALLOWED_KEYS",
    "buildScheduleCoordinationPayload",
    "resolveScheduleCoordination",
    "validateAiScheduleCoordination",
    "ai-schedule-coordination-v1",
    "cannotChangeDeterministicTop",
  ],
  "supabase/functions/exchange-toss-auth/index.ts": [
    "exchangeTossAuth",
    "authorizationCode",
    "getTossExchangeUrl",
    "signSessionToken",
    "authmap_user_identities",
    "apps_in_toss",
    "provider_subject",
    "provider_metadata",
    "ACCOUNT_DELETED",
  ],
  "supabase/functions/create-room/index.ts": [
    "createRoom",
    "requireActiveSession",
    "createSupabaseAdminClient",
    "hammoyo_rooms",
    "hammoyo_candidate_slots",
    "hammoyo_room_members",
  ],
  "supabase/functions/lookup-room/index.ts": [
    "lookupRoom",
    "inviteSlug",
    "hammoyo_rooms",
    "hammoyo_candidate_slots",
    "canonicalRoomStatus",
    "deleted_at",
    "joinable",
  ],
  "supabase/functions/join-room/index.ts": [
    "joinRoom",
    "readOptionalActiveSession",
    "anonymousParticipantKey",
    "generateAnonymousParticipantKey",
    "hashAnonymousParticipantKey",
    "participant_kind",
    "anonymous_key_hash",
    "inviteSlug",
    "hammoyo_room_members",
    "upsert",
  ],
  "supabase/functions/submit-response/index.ts": [
    "submitResponse",
    "readOptionalActiveSession",
    "anonymousParticipantKey",
    "hashAnonymousParticipantKey",
    "PARTICIPANT_AUTH_REQUIRED",
    "MEMBERSHIP_REQUIRED",
    "CANDIDATE_SLOT_NOT_IN_ROOM",
    "CANDIDATE_SLOT_INACTIVE",
    "responseRound",
    "hammoyo_candidate_slots",
    "hammoyo_responses",
    "hammoyo_response_preferences",
    "upsert",
  ],
  "supabase/functions/recompute-recommendation/index.ts": [
    "recomputeRecommendation",
    "requireActiveSession",
    "shouldCoordinateWithAi",
    "rankCandidates",
    "generateAiScheduleCoordination",
    "resolveScheduleCoordination",
    "hammoyo_recommendation_runs",
    "hammoyo_ai_coordination_runs",
    "hammoyo_responses",
  ],
  "supabase/functions/generate-share-copy/index.ts": [
    "generateShareCopy",
    "requireActiveSession",
    "resolveShareCopy",
    "generateAiPolishedCopy",
    "resolveDeepSeekModel",
    "hammoyo_share_messages",
    "insert",
  ],
  "supabase/functions/close-room/index.ts": ["closeRoom", "requireActiveSession", "closed", "update"],
  "supabase/functions/delete-room/index.ts": [
    "deleteRoom",
    "requireActiveSession",
    "deleted",
    "deleted_at",
    "deleted_by_core_user_id",
    "HOST_REQUIRED",
  ],
  "supabase/functions/request-data-deletion/index.ts": ["requestDataDeletion", "requireActiveSession", "core_users", "deleted_at", "update"],
};

for (const [path, source] of Object.entries(functionSources)) {
  assert(!/\bhm_[a-z_]+/.test(source), `${path} must use hammoyo_ table/helper prefix, not hm_`);
}

for (const [path, tokens] of Object.entries(functionIndexExpectations)) {
  for (const token of tokens) {
    assert(functionSources[path].includes(token), `${path} missing ${token}`);
  }
}

assert(
  !functionSources["supabase/functions/submit-response/index.ts"].includes("role: \"participant\""),
  "submit-response must not create membership from roomId alone",
);
assert(
  functionSources["supabase/functions/submit-response/index.ts"].includes("hammoyo_candidate_slots") &&
    functionSources["supabase/functions/submit-response/index.ts"].includes("CANDIDATE_SLOT_NOT_IN_ROOM"),
  "submit-response must validate candidate-slot room ownership before inserting preferences",
);
assert(
  functionSources["supabase/functions/submit-response/index.ts"].includes("anonymousParticipantKey") &&
    functionSources["supabase/functions/submit-response/index.ts"].includes("PARTICIPANT_AUTH_REQUIRED"),
  "submit-response must support anonymous participant keys without accepting roomId-only writes",
);
assert(
  functionSources["supabase/functions/join-room/index.ts"].includes("anonymous_key_hash") &&
    functionSources["supabase/functions/join-room/index.ts"].includes("participant_kind"),
  "join-room must persist anonymous participants through hashed participant keys",
);
assert(
  functionSources["supabase/functions/lookup-room/index.ts"].includes("canonicalRoomStatus") &&
    functionSources["supabase/functions/lookup-room/index.ts"].includes("joinable"),
  "lookup-room must expose canonical invite status and joinability",
);
assert(
  !functionSources["supabase/functions/_shared/hammoyo/schedule-coordinator.ts"].includes("label: text(item.candidate?.label"),
  "AI schedule coordination payload must not send user-entered candidate labels",
);
assert(
  functionSources["supabase/functions/_shared/hammoyo/schedule-coordinator.ts"].includes(
    "selectedCandidateId !== payload.deterministicTopCandidateId",
  ),
  "AI schedule coordination must not change the deterministic top candidate",
);
assert(
  functionSources["supabase/functions/exchange-toss-auth/index.ts"].includes("providerMetadata("),
  "exchange-toss-auth should merge Hammoyo provider metadata instead of replacing shared metadata",
);
assert(
  functionSources["supabase/functions/request-data-deletion/index.ts"].includes("unlinked_at"),
  "request-data-deletion should unlink authmap identities to prevent silent re-login to deleted account",
);

for (const token of [
  "SupabaseBackendAdapter",
  "generate-share-copy",
  "AI copy payload",
  "template fallback",
  "server-only",
]) {
  assert(platformReadiness.includes(token), `platform readiness doc missing backend/AI token: ${token}`);
}

assert(
  implementationPlan.includes("backend-invite-anonymous-hardening-implemented"),
  "implementation plan status should mention backend-invite-anonymous-hardening-implemented",
);
assert(envExample.includes("AI_PROVIDER="), ".env.example should include AI_PROVIDER placeholder");
assert(envExample.includes("AI_MODEL_COPY="), ".env.example should include AI_MODEL_COPY placeholder");
assert(envExample.includes("AI_MODEL_SAFETY="), ".env.example should include AI_MODEL_SAFETY placeholder");
assert(envExample.includes("AI_PROVIDER=deepseek"), ".env.example should default AI_PROVIDER to deepseek");
assert(envExample.includes("AI_MODEL_COPY=deepseek-v4-pro"), ".env.example should default AI_MODEL_COPY to DeepSeek V4 Pro");
assert(envExample.includes("AI_MODEL_SAFETY=deepseek-v4-pro"), ".env.example should default AI_MODEL_SAFETY to DeepSeek V4 Pro");
assert(envExample.includes("HAMMOYEO_SESSION_SECRET="), ".env.example should include HAMMOYEO_SESSION_SECRET placeholder");
assert(envExample.includes("HAMMOYEO_PROVIDER_HASH_SECRET="), ".env.example should include HAMMOYEO_PROVIDER_HASH_SECRET placeholder");
assert(envExample.includes("TOSS_AUTH_EXCHANGE_URL="), ".env.example should include TOSS_AUTH_EXCHANGE_URL placeholder");
assert(!envExample.includes("VITE_DEEPSEEK"), ".env.example must not expose DeepSeek to frontend");
assert(!aiProviderSource.includes("deepseek-chat"), "AI provider must not default or fall back to deprecated deepseek-chat");
assert(
  functionSources["supabase/functions/generate-share-copy/index.ts"].includes("model: copy.method === \"ai\" ? resolveDeepSeekModel() : null"),
  "generate-share-copy should persist the actual DeepSeek V4 Pro model used for AI copy",
);
assert(envExample.includes("AI_COORDINATION_ENABLED=false"), ".env.example should include AI_COORDINATION_ENABLED=false");
assert(envExample.includes("AI_MODEL_COORDINATION=deepseek-v4-pro"), ".env.example should default AI_MODEL_COORDINATION to DeepSeek V4 Pro");
assert(!envExample.includes("VITE_AI_COORDINATION"), ".env.example must not expose AI coordination flags to frontend");
assert(!functionSources["supabase/functions/exchange-toss-auth/index.ts"].includes("preferred_locale"), "exchange-toss-auth must use existing core_users.default_locale");
assert(!functionSources["supabase/functions/exchange-toss-auth/index.ts"].includes("core_user_id"), "exchange-toss-auth must use existing authmap_user_identities.user_id");
assert(!functionSources["supabase/functions/exchange-toss-auth/index.ts"].includes("provider_subject_hash"), "exchange-toss-auth must use existing authmap_user_identities.provider_subject field");

const backendModule = await import(pathToFileURL(`${process.cwd()}/${backendAdapterPath}`).href);
const aiPolicy = await import(pathToFileURL(`${process.cwd()}/${aiPolicyPath}`).href);
const roomsModule = await import(pathToFileURL(`${process.cwd()}/supabase/functions/_shared/hammoyo/rooms.ts`).href);
const recommendationModule = await import(pathToFileURL(`${process.cwd()}/supabase/functions/_shared/hammoyo/recommendation.ts`).href);
const serverAiCopySource = functionSources["supabase/functions/_shared/hammoyo/ai-copy.ts"];
const generateShareCopySource = functionSources["supabase/functions/generate-share-copy/index.ts"];

function extractAllowedKeys(source) {
  const match = source.match(/AI_COPY_ALLOWED_KEYS[\s\S]*?\[([\s\S]*?)\]/);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

const clientAllowedKeys = aiPolicy.AI_COPY_ALLOWED_KEYS || [];
const serverAllowedKeys = extractAllowedKeys(serverAiCopySource);
assert(clientAllowedKeys.length > 0, "client AI policy should expose AI_COPY_ALLOWED_KEYS");
assert(serverAllowedKeys.length > 0, "server AI helper should expose AI_COPY_ALLOWED_KEYS");
assert(
  JSON.stringify(clientAllowedKeys) === JSON.stringify(serverAllowedKeys),
  "client and server AI copy allowlists should match",
);
assert(!/aiPayload\s*[:,]/.test(generateShareCopySource), "generate-share-copy response must not expose internal aiPayload");

const calls = [];
const adapter = backendModule.createSupabaseBackendAdapter({
  invoke: async (functionName, payload) => {
    calls.push({ functionName, payload });
    return { ok: true, functionName, payload };
  },
  createIntossDeepLink: ({ roomId, inviteSlug }) => `intoss://hammoyo/rooms/${roomId || inviteSlug}`,
});

await adapter.createRoom({ title: "테스트 모임" });
await adapter.lookupRoom({ inviteSlug: "abc123" });
await adapter.joinRoom({ inviteSlug: "abc123" });
await adapter.submitResponse({ roomId: "room-1", responseRound: 1, preferences: { slot1: "prefer" } });
await adapter.recomputeRecommendation({ roomId: "room-1" });
await adapter.generateShareCopy({ roomId: "room-1", locale: "ko" });
await adapter.closeRoom({ roomId: "room-1" });
await adapter.deleteRoom({ roomId: "room-1", reasonCode: "host_deleted" });
await adapter.requestDataDeletion({ reasonCode: "user_request" });

const functionNames = calls.map((call) => call.functionName);
for (const expected of [
  "create-room",
  "lookup-room",
  "join-room",
  "submit-response",
  "recompute-recommendation",
  "generate-share-copy",
  "close-room",
  "delete-room",
  "request-data-deletion",
]) {
  assert(functionNames.includes(expected), `adapter did not invoke ${expected}`);
}

const shareLink = await adapter.createShareLink({ roomId: "room-42" });
assert(shareLink.ok === true, "adapter createShareLink should return ok");
assert(shareLink.deepLink === "intoss://hammoyo/rooms/room-42", "createShareLink should produce an intoss deep link");

const edgeCalls = [];
const invoker = backendModule.createEdgeFunctionInvoker({
  endpointBase: "https://example.test/functions/v1",
  anonKey: "anon-key",
  getSessionToken: () => "hammoyo-session",
  fetchImpl: async (url, init) => {
    edgeCalls.push({ url, init });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  },
});
await invoker("create-room", { title: "동적 세션" });
assert(edgeCalls[0].url === "https://example.test/functions/v1/create-room", "edge invoker should compose function URL");
assert(edgeCalls[0].init.headers.apikey === "anon-key", "edge invoker should attach anon key as apikey");
assert(
  edgeCalls[0].init.headers.authorization === "Bearer hammoyo-session",
  "edge invoker should attach the dynamic Hammoyo session token",
);

assert(roomsModule.canonicalRoomStatus({ status: "collecting" }) === "collecting", "rooms helper should preserve collecting status");
assert(roomsModule.canonicalRoomStatus({ status: "recommended" }) === "recommended", "rooms helper should preserve recommended status");
assert(roomsModule.canonicalRoomStatus({ status: "deleted" }) === "deleted", "rooms helper should preserve deleted status");
assert(
  roomsModule.canonicalRoomStatus({ status: "collecting", expires_at: "2000-01-01T00:00:00.000Z" }) === "expired",
  "rooms helper should canonicalize expired rooms",
);
assert(roomsModule.isJoinableRoom({ status: "collecting" }) === true, "collecting rooms should be joinable");
assert(roomsModule.isJoinableRoom({ status: "low_confidence" }) === true, "low-confidence rooms should remain joinable");
assert(roomsModule.isJoinableRoom({ status: "recommended" }) === true, "recommended rooms should remain joinable for edits");
assert(roomsModule.isJoinableRoom({ status: "closed" }) === false, "closed rooms should not be joinable");
assert(roomsModule.isJoinableRoom({ status: "deleted" }) === false, "deleted rooms should not be joinable");

assert(recommendationModule.minimumResponses(7) === 5, "backend recommendation helper should require 5 responses for 7 expected participants");
assert(recommendationModule.minimumResponses(3) === 3, "backend recommendation helper should keep a 3-response floor");

const constrainedRecommendation = recommendationModule.rankCandidates({
  expectedCount: 5,
  candidates: [
    { id: "slot-1", label: "7.5 토요일", sort_order: 0 },
    { id: "slot-2", label: "7.6 일요일", sort_order: 1 },
    { id: "slot-3", label: "7.7 월요일", sort_order: 2 },
  ],
  responses: [
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "prefer" },
        { candidate_slot_id: "slot-2", value: "adjustable" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "prefer" },
        { candidate_slot_id: "slot-2", value: "adjustable" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "prefer" },
        { candidate_slot_id: "slot-2", value: "adjustable" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "prefer" },
        { candidate_slot_id: "slot-2", value: "adjustable" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "hardNo" },
        { candidate_slot_id: "slot-2", value: "adjustable" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
  ],
});
assert(constrainedRecommendation.algorithmVersion === "deterministic-v2", "backend recommendation should expose deterministic-v2");
assert(constrainedRecommendation.top?.candidate.id === "slot-2", "backend recommendation should treat any hardNo as an eligibility constraint");
assert(
  constrainedRecommendation.items.find((item) => item.candidate.id === "slot-1")?.excluded === true,
  "backend recommendation should mark hardNo-constrained candidates as excluded",
);

const sameDayTieRecommendation = recommendationModule.rankCandidates({
  expectedCount: 3,
  candidates: [
    { id: "slot-1", label: "7.5 토요일 20:00", starts_at: "2026-07-05T20:00:00+09:00", sort_order: 0 },
    { id: "slot-2", label: "7.5 토요일 18:00", starts_at: "2026-07-05T18:00:00+09:00", sort_order: 1 },
    { id: "slot-3", label: "7.6 일요일 19:00", starts_at: "2026-07-06T19:00:00+09:00", sort_order: 2 },
  ],
  responses: [
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "available" },
        { candidate_slot_id: "slot-2", value: "available" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "available" },
        { candidate_slot_id: "slot-2", value: "available" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
    {
      preferences: [
        { candidate_slot_id: "slot-1", value: "available" },
        { candidate_slot_id: "slot-2", value: "available" },
        { candidate_slot_id: "slot-3", value: "hardNo" },
      ],
    },
  ],
});
assert(sameDayTieRecommendation.top?.candidate.id === "slot-2", "backend recommendation should use starts_at for same-day tied candidates");

let missingConfigError = "";
try {
  backendModule.createSupabaseBackendAdapter({});
} catch (error) {
  missingConfigError = error.code;
}
assert(missingConfigError === "BACKEND_ADAPTER_CONFIG_MISSING", "adapter should reject missing invoke function");

const templateResult = aiPolicy.resolveShareCopy({
  aiEnabled: false,
  locale: "ko",
  recommendation: {
    title: "대학 동기 모임",
    topCandidateLabel: "6.29 토요일",
    topCandidateTime: "18:30",
    confidence: "high",
    aggregateCounts: { responses: 4, prefer: 2, available: 2, adjustable: 0, hardNo: 0 },
    caveatCode: "none",
  },
});
assert(templateResult.method === "template", "AI disabled should use template copy");
assert(templateResult.body.includes("대학 동기 모임"), "template copy should include title");
assert(!templateResult.body.includes("AI"), "template copy should not claim AI polish");

const aiPayload = aiPolicy.buildAiCopyPayload({
  locale: "ko",
  tone: "warm",
  recommendation: {
    title: "삭제되어야 하는 자유 제목",
    topCandidateLabel: "6.29 토요일",
    topCandidateTime: "18:30",
    confidence: "high",
    aggregateCounts: { responses: 4, prefer: 2, available: 2, adjustable: 0, hardNo: 0 },
    caveatCode: "none",
    alias: "민지",
    hardNoReason: "개인 사유",
    provider_subject_hash: "secret",
  },
});
assert(!JSON.stringify(aiPayload).includes("민지"), "AI payload must not include participant aliases");
assert(!JSON.stringify(aiPayload).includes("개인 사유"), "AI payload must not include hard-no reasons");
assert(!JSON.stringify(aiPayload).includes("secret"), "AI payload must not include provider hashes");
assert(!("title" in aiPayload), "AI payload must not include room title");
assert(!("note" in aiPayload), "AI payload must not include notes");
assert(!("name" in aiPayload), "AI payload must not include names");
assert(!("phone" in aiPayload), "AI payload must not include phone numbers");
assert(!("email" in aiPayload), "AI payload must not include email addresses");
assert(aiPayload.topCandidateLabel === "6.29 토요일", "AI payload may include top candidate label");
assert(aiPayload.aggregateCounts.responses === 4, "AI payload may include aggregate counts");
assert(JSON.stringify(Object.keys(aiPayload)) === JSON.stringify(clientAllowedKeys), "AI payload keys should match the allowlist exactly");

const aiFallback = await aiPolicy.resolveShareCopy({
  aiEnabled: true,
  locale: "en",
  recommendation: {
    title: "Study meetup",
    topCandidateLabel: "Sat",
    topCandidateTime: "18:30",
    confidence: "medium",
    aggregateCounts: { responses: 3, prefer: 1, available: 2, adjustable: 0, hardNo: 0 },
    caveatCode: "low_response_count",
  },
  generateAiCopy: async () => {
    throw new Error("provider timeout");
  },
});
assert(aiFallback.method === "template", "AI failure should fall back to template");
assert(aiFallback.fallbackReason === "AI_COPY_FALLBACK_TEMPLATE", "AI failure should expose fallback reason");

if (failures.length > 0) {
  console.error("[백엔드/AI 검증기] 실패");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[백엔드/AI 검증기] 통과");
