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

const contractsPath = "src/platform/contracts.mjs";
const previewAdaptersPath = "src/platform/preview-adapters.mjs";
const tossAdaptersPath = "src/platform/toss-adapters.mjs";
const migrationPath = "supabase/migrations/20260624_hammoyo_backend.sql";
const releaseDocPath = "docs/release/platform-readiness.md";
const privacyPath = "docs/mvp/privacy.html";
const contactPath = "docs/mvp/contact.html";
const deleteDataPath = "docs/mvp/delete-data.html";

const contractsSource = read(contractsPath);
const previewSource = read(previewAdaptersPath);
const tossSource = read(tossAdaptersPath);
const migration = read(migrationPath);
const releaseDoc = read(releaseDocPath);
const privacyDoc = read(privacyPath);
const contactDoc = read(contactPath);
const deleteDataDoc = read(deleteDataPath);
const envExample = read(".env.example");
const implementationPlan = read("ai/plans/implementation-plan.md");
const authmapTableMatch = migration.match(/create table if not exists public\.authmap_user_identities \(([\s\S]*?)\n\);/);
const authmapTableDefinition = authmapTableMatch?.[1] || "";

if (failures.some((failure) => failure.startsWith("missing required file:"))) {
  console.error("[플랫폼 준비 검증기] 실패");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

assert(contractsSource.includes("BackendNotConnectedError"), "platform contracts should expose BackendNotConnectedError");
assert(previewSource.includes("createPreviewBackendAdapter"), "preview adapters should expose createPreviewBackendAdapter");
assert(previewSource.includes("createPreviewShareAdapter"), "preview adapters should expose createPreviewShareAdapter");
assert(tossSource.includes("createTossAuthAdapter"), "toss adapters should expose createTossAuthAdapter");
assert(tossSource.includes("createTossShareAdapter"), "toss adapters should expose createTossShareAdapter");

for (const expectedTable of [
  "hammoyo_rooms",
  "hammoyo_room_members",
  "hammoyo_candidate_slots",
  "hammoyo_responses",
  "hammoyo_response_preferences",
  "hammoyo_recommendation_runs",
  "hammoyo_ai_coordination_runs",
  "hammoyo_share_messages",
  "hammoyo_analytics_events",
]) {
  assert(migration.includes(expectedTable), `migration missing app-prefixed table: ${expectedTable}`);
}

assert(!/\bhm_[a-z_]+/.test(migration), "migration must use the explicit hammoyo_ app prefix, not hm_");

for (const forbidden of [
  "create table rooms",
  "create table users",
  "create table events",
  "using (true)",
  "with check (true)",
  "disable row level security",
  "toss_user_key",
]) {
  assert(!migration.toLowerCase().includes(forbidden), `migration contains forbidden token: ${forbidden}`);
}

assert(migration.includes("default_locale"), "migration should use existing shared core_users.default_locale column");
assert(!migration.includes("preferred_locale"), "migration must not use obsolete core_users.preferred_locale column");
assert(authmapTableDefinition.includes("user_id uuid not null references public.core_users"), "migration should use existing shared authmap_user_identities.user_id column");
assert(authmapTableDefinition.includes("provider_subject text not null"), "migration should use existing shared authmap_user_identities.provider_subject column");
assert(authmapTableDefinition.includes("provider_metadata jsonb"), "migration should use existing shared authmap_user_identities.provider_metadata column");
assert(migration.includes("'apps_in_toss'"), "migration should use the existing Apps in Toss provider value");
assert(!authmapTableDefinition.includes("core_user_id"), "shared authmap table must not define obsolete core_user_id column");
assert(!authmapTableDefinition.includes("provider_subject_hash"), "shared authmap table must not define obsolete provider_subject_hash column");
assert(migration.includes("enable row level security"), "migration should enable RLS");
assert(migration.includes("grant select, insert, update, delete on public.hammoyo_rooms to service_role"), "migration should grant Edge Function role access to app tables");
assert(migration.includes("hammoyo_app_user_id()"), "migration should define an app-user lookup helper");
assert(migration.includes("hammoyo_can_read_room"), "migration should define a host-or-member read helper");
assert((migration.match(/public\.hammoyo_can_read_room/g) || []).length >= 6, "dependent RLS policies should use host-or-member read helper");
assert(migration.includes("'draft'"), "room status check should include draft state from the canonical state machine");
assert(migration.includes("authmap_user_identities"), "migration should map providers through shared authmap identities");
assert(!implementationPlan.includes("rooms.host_user_id"), "implementation plan should use hammoyo_rooms.host_core_user_id");
assert(!implementationPlan.includes("app_users.deleted_at"), "implementation plan should use core_users.deleted_at");

for (const envName of [
  "VITE_SUPABASE_URL=",
  "VITE_SUPABASE_ANON_KEY=",
  "AI_COPY_ENABLED=false",
  "APPS_IN_TOSS_CONSOLE_API_KEY=",
  "PUBLIC_PRIVACY_URL=",
  "PUBLIC_CONTACT_EMAIL=",
  "PUBLIC_DATA_DELETION_URL=",
]) {
  assert(envExample.includes(envName), `.env.example missing ${envName}`);
}

for (const forbiddenEnv of ["VITE_DEEPSEEK", "NEXT_PUBLIC_DEEPSEEK", "PUBLIC_DEEPSEEK"]) {
  assert(!envExample.includes(forbiddenEnv), `.env.example must not expose ${forbiddenEnv}`);
}
assert(!/^SUPABASE_SERVICE_ROLE_KEY=/m.test(envExample), ".env.example must not expose SUPABASE_SERVICE_ROLE_KEY=");

for (const docToken of [
  "원격 Supabase 적용 금지",
  "Apps in Toss",
  "Google Play",
  "BackendAdapter",
  "AuthAdapter",
  "ShareAdapter",
  "intoss://",
  "공개 개인정보처리방침 URL",
  "데이터 삭제 요청 URL",
]) {
  assert(releaseDoc.includes(docToken), `release readiness doc missing: ${docToken}`);
}

for (const docToken of ["문의", "공개 문의 이메일은 정식 제출 전 확정", "Apps in Toss", "Google Play"]) {
  assert(contactDoc.includes(docToken), `contact page missing: ${docToken}`);
}

for (const forbiddenPublicToken of ["PUBLIC_CONTACT_EMAIL", "PUBLIC_PRIVACY_URL", "PUBLIC_DATA_DELETION_URL"]) {
  assert(!contactDoc.includes(forbiddenPublicToken), `contact page should not expose env placeholder token: ${forbiddenPublicToken}`);
}

for (const docToken of ["정적 MVP preview 전용", "English Summary", "데이터 삭제 요청 URL", "contact.html", "delete-data.html"]) {
  assert(privacyDoc.includes(docToken), `privacy page missing: ${docToken}`);
}

for (const docToken of ["데이터 삭제", "공개 데이터 삭제 요청 URL은 정식 제출 전 확정", "로컬 삭제", "서버 데이터 삭제"]) {
  assert(deleteDataDoc.includes(docToken), `data deletion page missing: ${docToken}`);
}

assert(!deleteDataDoc.includes("PUBLIC_DATA_DELETION_URL"), "data deletion page should not expose env placeholder token: PUBLIC_DATA_DELETION_URL");

const contracts = await import(pathToFileURL(`${process.cwd()}/${contractsPath}`).href);
const preview = await import(pathToFileURL(`${process.cwd()}/${previewAdaptersPath}`).href);
const toss = await import(pathToFileURL(`${process.cwd()}/${tossAdaptersPath}`).href);

const backend = preview.createPreviewBackendAdapter();
const createRoomResult = await backend.createRoom({ title: "테스트" });
assert(createRoomResult.ok === false, "preview backend should not claim remote create success");
assert(createRoomResult.code === "BACKEND_NOT_CONNECTED", "preview backend should return BACKEND_NOT_CONNECTED");

const share = preview.createPreviewShareAdapter();
const invite = await share.createInvite({ roomId: "room-1", locale: "ko" });
assert(invite.ok === false, "preview share adapter should not claim real share-link success");
assert(!String(invite.text || "").includes("room="), "preview share text must not include fake room links");

let exchangedCode = "";
const auth = toss.createTossAuthAdapter({
  appLogin: async () => ({ authorizationCode: "auth-code" }),
  backend: {
    exchangeTossAuth: async ({ authorizationCode }) => {
      exchangedCode = authorizationCode;
      return { ok: true, user: { id: "core-user-id", provider: "toss" } };
    },
  },
});
const authResult = await auth.signIn();
assert(authResult.ok === true, "toss auth adapter should return backend exchange result");
assert(exchangedCode === "auth-code", "toss auth adapter should pass authorizationCode to backend only");

let shareTarget = "";
const tossShare = toss.createTossShareAdapter({
  getTossShareLink: async (url) => {
    shareTarget = url;
    return `https://toss.im/_ul/apps?deep_link_value=${encodeURIComponent(url)}`;
  },
});
const shareResult = await tossShare.createInvite({ deepLink: "intoss://hammoyo/rooms/invite", text: "invite" });
assert(shareResult.ok === true, "toss share adapter should create a share link through injected SDK function");
assert(shareTarget === "intoss://hammoyo/rooms/invite", "toss share adapter should pass intoss deep links to SDK function");

assert(contracts.platformCapabilities.preview.backend === false, "preview backend capability should be false");
assert(contracts.platformCapabilities.appsInToss.auth === true, "Apps in Toss auth capability should be true");

if (failures.length > 0) {
  console.error("[플랫폼 준비 검증기] 실패");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[플랫폼 준비 검증기] 통과");
