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
  "친구한테 공유하기",
  "설정",
  "로그인 상태",
  "로그아웃",
  "현재 상태",
  "초대가 도착했어요",
  "초대 응답하기",
  "개인정보",
  "로컬 데이터 지우기",
  "공유 준비됨",
  "공유 화면을 열었어요",
  "내가 만든 모임",
  "모임 삭제",
  "모임 이름",
  "예상 인원",
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
  "HostRoomEditor",
  "IOSCountSelect",
  "AppleDateTimePicker",
  "SettingsAccountPanel",
  "IncomingInviteCard",
  "AnimalBackground",
  "Button3D",
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

for (const forbidden of [
  "#2563eb",
  "#f7f8fa",
  "#17171c",
  "강한 불가",
  "Converging Orbit",
  "기능 MVP",
  "앱 준비",
  "General share link",
  "Find a time that works",
]) {
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

if (!html.includes("hammoyo-hero-animals.png")) {
  failures.push("Missing generated animal hero asset.");
}

if (!html.includes("hammoyo-animal-background.png")) {
  failures.push("Missing generated animal background asset.");
}

if (html.includes('data-testid="language-toggle-button"')) {
  failures.push("English language toggle should not be user-facing for Apps in Toss first release.");
}

if (!html.includes('data-testid="expected-count-select"')) {
  failures.push("Expected count should use an iOS-like select control.");
}

if (!html.includes("AppleDateTimePicker")) {
  failures.push("Candidate date/time controls should use the AppleDateTimePicker visual shell.");
}

if (!html.includes("navigator.share")) {
  failures.push("Friend sharing should use the native Web Share sheet before clipboard fallback.");
}

if (!html.includes('data-testid="delete-room-button-')) {
  failures.push("My meetups should expose per-room deletion.");
}

if (!html.includes("revokedRoomIds")) {
  failures.push("Deleted room share links should be locally revoked.");
}

if (failures.length) {
  console.error("HAMMOYEO app design verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("HAMMOYEO app design verification passed.");
