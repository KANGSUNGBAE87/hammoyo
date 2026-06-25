import fs from "node:fs";

const htmlPath = "docs/mvp/index.html";
const tokenPath = "HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_DESIGN_TOKENS.json";

const html = fs.readFileSync(htmlPath, "utf8");
const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

const requiredScreens = [
  "scr-00-entry",
  "scr-01-host-room",
  "scr-02-participant-input",
  "scr-02b-response-complete",
  "scr-03-result-recommendation",
  "scr-04-insufficient-response",
  "scr-05-link-expired",
  "scr-06-room-closed",
  "scr-07-settings",
  "scr-08-my-meetups",
];

const requiredLabels = [
  "가장 좋아요",
  "가능해요",
  "조정하면 가능해요",
  "어려워요",
  "추천 1순위",
  "공유 문구 복사하기",
  "개인정보",
  "로컬 데이터 지우기",
  "일반 공유 링크",
  "내가 만든 모임",
  "Find a time that works",
  "General share link",
];

const requiredComponentMarkers = [
  "CandidateSlotCard",
  "PreferenceSelector",
  "RecommendationHeroCard",
  "ReasonChip",
  "ResponseCoverage",
  "ParticipantAvatarStack",
  "ShareCopyBox",
  "HostStatusCard",
  "StateGraphic",
  "StickyBottomCTA",
];

const requiredTokens = [
  tokens.color.brand,
  tokens.color.brandSoft,
  tokens.color.background,
  tokens.color.surface,
  tokens.color.textPrimary,
  tokens.color.textSecondary,
  tokens.color.border,
  tokens.color.success,
  tokens.color.warning,
  tokens.color.danger,
];

const failures = [];
const assertIncludes = (value, label) => {
  if (!html.includes(value)) failures.push(`Missing ${label}: ${value}`);
};

for (const screen of requiredScreens) {
  assertIncludes(`id="${screen}"`, `screen id`);
}

for (const label of requiredLabels) {
  assertIncludes(label, "required copy");
}

for (const marker of requiredComponentMarkers) {
  assertIncludes(marker, "component marker");
}

for (const token of requiredTokens) {
  assertIncludes(token, "design token");
}

for (const forbidden of ["#2563eb", "#f7f8fa", "#17171c", "강한 불가"]) {
  if (html.toLowerCase().includes(forbidden.toLowerCase())) {
    failures.push(`Forbidden legacy value/copy remains: ${forbidden}`);
  }
}

if (!html.includes("new URLSearchParams")) {
  failures.push("Missing query-parameter screen routing.");
}

if (!html.includes("prefers-reduced-motion")) {
  failures.push("Missing reduced-motion CSS.");
}

if (!html.includes("--touch-target: 44px") && !html.includes("--min-touch-target: 44px")) {
  failures.push("Missing 44px touch target token.");
}

if (!html.includes("data-ai-copy-enabled=\"false\"")) {
  failures.push("Default fixture must keep AI copy disabled.");
}

if (!html.includes('id="locale-en"')) {
  failures.push("Missing English locale resource.");
}

if (!html.includes('data-testid="language-toggle-button"')) {
  failures.push("Missing user-facing language toggle.");
}

if (failures.length) {
  console.error("HAMMOYEO app design verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("HAMMOYEO app design verification passed.");
