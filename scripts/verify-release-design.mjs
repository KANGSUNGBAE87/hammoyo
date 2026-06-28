import fs from "node:fs";

const htmlPath = "docs/release/index.html";
const deployedHtmlPath = "docs/index.html";
const tokenPath = "docs/final-delivery/tokens.json";

const html = fs.readFileSync(htmlPath, "utf8");
const deployedHtml = fs.readFileSync(deployedHtmlPath, "utf8");
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
  "진행 상태",
  "비밀 투표",
  "마지막 투표, 항상 부담되셨죠?",
  "안 맞는 사람은 숨기고",
  "초대가 도착했어요",
  "초대 응답하기",
  "현재 모임이 없어요",
  "개인정보",
  "로컬 데이터 지우기",
  "정말 지울까요?",
  "되돌릴 수 없어요",
  "공유 준비 완료",
  "공유 화면을 열었어요",
  "내가 만든 모임",
  "모임 삭제",
  "모임 이름",
  "예상 인원",
  "직접입력",
  "인원 확인",
  "이번 모임은 어떻게 정할까요?",
  "모두 함께",
  "많이 모이면",
  "빨리 정하기",
  "최소 참석 인원",
  "익명 집계",
  "사람은 숨기고, 상황은 보여준다",
  "기준 바꿔서 다시 보기",
  "방장이 합의 기준을 변경했어요",
  "부담 있음",
  "확인 필요",
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
  "CustomChoiceControl",
  "CustomChoicePopover",
  "DeadlineCalendarPicker",
  "DeadlineTimeWheel",
  "BottomNav",
  "BottomNavItem",
  "BottomNavLabel",
  "HomeHeroStatusOverlay",
  "HeroStatusPill",
  "ResponseInbox",
  "ResponseEmptyState",
  "ConfirmDialog",
  "IPhoneCalendarPicker",
  "ReleaseCalendarSheet",
  "ReleaseCalendarDay",
  "ReleaseTimeWheel",
  "ReleaseTimeWheelColumn",
  "ReleaseTimeWheelOption",
  "ExpectedCountPreset",
  "CustomExpectedCountInput",
  "SettingsAccountPanel",
  "IncomingInviteCard",
  "AgreementModeSelector",
  "AgreementModeButton",
  "AgreementChangeSheet",
  "AgreementNotice",
  "AnonymousAggregatePanel",
  "AnonymousAggregateCard",
  "HostAggregateMini",
  "AnimalBackground",
  "Button3D",
  "StateGraphic",
  "StickyBottomCTA",
];

const requiredTokens = [
  tokens.color.brand,
  tokens.color.brandStrong,
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

if (html !== deployedHtml) {
  failures.push(`${htmlPath} and ${deployedHtmlPath} must stay identical for GitHub Pages and release verification.`);
}

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
  "앱 준비",
  "General share link",
  "Find a time that works",
  "hammoyo-hero-animals.png",
  "hammoyo-animal-background.png",
  "hero_animals_calendar_tight.png",
  "최근 방:",
  "IOSCountSelect",
  "selectShell",
  'data-testid="expected-count-select"',
  'data-testid="deadline-input"',
  "<select",
]) {
  if (html.toLowerCase().includes(forbidden.toLowerCase())) {
    failures.push(`Forbidden legacy value/copy remains: ${forbidden}`);
  }
}

if (/\bm\s*v\s*p\b/i.test(html)) {
  failures.push("Reduced launch-product wording remains in active release HTML.");
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

if (!html.includes("assets/final/hero/hero_animals_calendar_full_square.png")) {
  failures.push("Missing final delivery animal hero asset.");
}

if (!html.includes("assets/final/backgrounds/background_sparse_pattern_example.png")) {
  failures.push("Missing final delivery animal background asset.");
}

for (const stateAsset of [
  "assets/final/states/state_confirmed_object.png",
  "assets/final/states/state_expired_link_object.png",
  "assets/final/states/state_insufficient_response_object.png",
  "assets/final/states/state_private_negotiation_object.png",
]) {
  assertIncludes(stateAsset, "final delivery state asset");
}

if (html.includes('data-testid="language-toggle-button"')) {
  failures.push("English language toggle should not be user-facing for Apps in Toss first release.");
}

if (!html.includes('testPrefix: "expected-count"') || !html.includes('value: "custom"')) {
  failures.push("Expected count should use a custom app-shaped choice popover with a direct-input option.");
}

if (!html.includes('data-testid="deadline-calendar-trigger"') || !html.includes('data-testid="deadline-calendar-sheet"')) {
  failures.push("Deadline date should use the same iPhone-like calendar picker pattern as candidate dates.");
}

if (!html.includes('testPrefix: "deadline-time"') || !html.includes("DeadlineTimeWheel")) {
  failures.push("Deadline time should use the app time wheel instead of a plain text input.");
}

const legacyPickerMarker = ["Apple", "DateTime", "Picker"].join("");
if (html.includes(legacyPickerMarker)) {
  failures.push("Candidate date/time controls must not use the legacy date/time shell.");
}

if (html.includes('type="date"') || html.includes('type="time"')) {
  failures.push("Release candidate controls must not expose browser-native date/time pickers.");
}

if (html.includes("ReleaseDateChip") || html.includes("ReleaseTimeSlot")) {
  failures.push("Candidate date/time controls should no longer use compact chip/slot controls.");
}

if (!html.includes("IPhoneCalendarPicker") || !html.includes("ReleaseCalendarDay")) {
  failures.push("Candidate date controls should use the iPhone-like calendar picker.");
}

if (!html.includes("ReleaseTimeWheel") || !html.includes("ReleaseTimeWheelOption")) {
  failures.push("Candidate time controls should use the vertical alarm-style time wheel.");
}

if (!html.includes("buildContinuousHourValues") || !html.includes("buildContinuousMinuteValues")) {
  failures.push("Time wheel options should be generated in continuous hour/minute order.");
}

if (html.includes('data-time-part="period"') || html.includes('candidate-time-period-')) {
  failures.push("Candidate time wheel should use 24-hour hour/minute columns without an AM/PM period column.");
}

if (!html.includes("bottom-nav") || !html.includes("bottom-nav-create")) {
  failures.push("Release app shell should expose a keepthis-style bottom navigation.");
}

if (html.includes('data-testid="settings-button"')) {
  failures.push("Topbar settings button should be removed because bottom settings tab owns that route.");
}

if (!html.includes("custom-confirm-modal") || !html.includes("confirm-modal-confirm")) {
  failures.push("Dirty/delete confirmation should use an in-app custom modal instead of native confirm.");
}

if (!html.includes("response-inbox-list") || !html.includes("받은 초대")) {
  failures.push("Response tab should expose a received-invites list before the detail response form.");
}

if (html.includes('class="HomeStatusPanel"')) {
  failures.push("Home status should be integrated into the poster hero, not rendered as a separate HomeStatusPanel card.");
}

if (!html.includes('data-testid="home-status-overlay"') || !html.includes('data-testid="hero-status-pill"')) {
  failures.push("Home hero should expose an integrated 3D status overlay and pill.");
}

if (!html.includes('data-testid="response-empty-state"')) {
  failures.push("Response tab should render an empty state even when there is no current room.");
}

if (html.includes("window.confirm")) {
  failures.push("Native window.confirm should not be used for release confirmation flows.");
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
