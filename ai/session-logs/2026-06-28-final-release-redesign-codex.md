# 2026-06-28 Final Release Redesign

Actor: codex
Date: 2026-06-28

## User Request

- `HAMMOYEO_FINAL_DELIVERY`를 최종 기획안으로 보고 전면 재조정.
- 날짜/시간 선택 UI의 브라우저 기본 picker 느낌을 제거.
- 하단 탭 참고안은 검토하되, 최종 제품 흐름에 맞게 화면 전환을 재판단.
- 서브에이전트 2개 이상 의견을 취합.
- 모든 프로젝트에서 작은 검증물 프레임 대신 `최종출시제품` 기준으로 명명.

## Subagent Inputs

- `market-ux-researcher`: 초대, 응답, fallback, 공유 흐름을 빠르게 끝내는 것이 경쟁 앱 대비 핵심이라고 판단. 날짜/시간은 native picker보다 chip/slot control이 낫다고 제안.
- `planner`: final delivery 기준에서는 memo-app식 bottom tab/FAB 확장이 오히려 흐름을 흐린다고 판단. 방장 중심 single-room flow, Supabase canonical state, AI copy polish boundary를 우선하라고 권고.
- `reviewer`: 기존 picker와 app-shell 확장이 품질 리스크라고 지적. `HARD_NO`, anonymous participant, server lookup, ko/en/i18n 경계를 먼저 맞추라고 권고.
- `code-mapper`: 실제 변경 중심 파일은 `docs/release/index.html`, 검증 스크립트, canonical plans라고 정리.

## Decisions

- 하단 탭은 채택하지 않음. final delivery의 핵심은 앱 탐색 구조가 아니라 초대 링크에서 모임 생성/응답/추천/공유까지 빠르게 이어지는 room-centric flow라고 판단.
- 날짜/시간은 native date/time input을 제거하고 후보 날짜 chip + 낮/저녁/밤 segmented time slot으로 교체.
- active 출시 화면 경로는 `docs/release/index.html`, 공개 root mirror는 `docs/index.html`로 유지.
- 기존 작은 검증물 명명과 경로는 `release`/`최종출시제품` 기준으로 정리.

## Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `scripts/verify-platform-readiness.mjs`
- `package.json`
- `AGENTS.md`, `CLAUDE.md`
- `ai/plans/product-plan.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `ai/reviews/review.md`
- prior session logs and Planning Lab project copies were mechanically renamed/reworded to remove the old framing.

## Verification

- `npm run build` passed.
- Browser screenshot QA captured:
  - `/tmp/hammoyo-release-390.png`
  - `/tmp/hammoyo-release-create-390.png`
  - `/tmp/hammoyo-release-time-390.png`
- Repository scan found no active old product acronym, old docs path, old verify script name, old storage key, legacy picker marker, or legacy candidate input marker.

## Remaining Risks

- GitHub Pages deploy was not run in this session.
- Apps in Toss sandbox QA is still needed for safe area, share/deep link, and login runtime.
- P1 `negotiating`/`ready_to_confirm` scope remains an implementation decision.

## Knowledge Promotion

- Durable preference was recorded as a Codex memory update note:
  `/Users/kangsungbae/.codex/memories/extensions/ad_hoc/notes/2026-06-28-final-release-product-framing.md`
- No additional shared knowledge-store promotion was made in this session.

## Later Update: Bottom Tabs, Calendar, Time Wheel

Actor: codex
Date: 2026-06-28

### User Request

- keepthis 레이아웃을 참고해 하단 중요 탭으로 화면을 전환할 수 있게 전면 개편.
- 날짜 선택은 브라우저 기본 picker가 아니라 iPhone형 calendar sheet로 구현.
- 시간 선택은 Android 알람 설정처럼 오전/오후, 시, 분을 위아래 wheel로 고르게 구현.
- 서브에이전트로 구조를 다시 분석하고 개선 의견을 반영.

### Subagent Inputs

- `code-mapper`: 변경 중심 파일은 `docs/release/index.html`, `scripts/verify-release-design.mjs`, `scripts/verify-release-functional.mjs`라고 분석. 기존 hidden input name과 `readRoomForm` 계약은 보존해야 한다고 권고.
- `market-ux-researcher`: keepthis의 5탭 shell을 채택하되 SCR 화면 전체를 탭으로 노출하지 말고 `홈`, `응답`, 중앙 `만들기`, `내 모임`, `설정`으로 묶으라고 권고. 날짜는 iPhone형 월간 sheet, 시간은 알람형 wheel이 사용자 요청과 가장 잘 맞는다고 판단.

### Decisions

- 이전 “하단 탭 미채택” 결정은 최신 Owner 지시로 superseded.
- release 화면에 하단 5탭 shell을 도입하고, SCR 화면은 각 탭 아래의 상태 화면으로 유지.
- 후보 날짜는 `IPhoneCalendarPicker`, 후보 시간은 `ReleaseTimeWheel`로 전환.
- 시간 wheel은 버튼이 가진 고정 전체 시간값이 아니라 현재 hidden input 값과 누른 열의 token을 조합해 누적 선택하도록 수정.
- CTA는 화면 완료 행동으로 유지하고, 하단 탭은 주요 화면 이동만 담당.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `scripts/verify-backend-ai.mjs`
- `docs/release/README.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `ai/reviews/review.md`

### Verification

- `npm run verify:release` passed.
- `npm run build` passed.
- Playwright screenshots captured:
  - `/tmp/hammoyo-redesign-390.png`
  - `/tmp/hammoyo-redesign-320.png`
  - `/tmp/hammoyo-picker-scroll-390.png`
  - `/tmp/hammoyo-picker-scroll-320.png`

### Remaining Risks

- GitHub Pages deployment was not run for this later update.
- Apps in Toss sandbox safe-area/back/share validation remains pending.

## Later Update: Final Navigation, Response Inbox, Custom Confirm

Actor: codex
Date: 2026-06-28

### User Request

- 상단 설정/홈 중복 버튼 제거.
- 필요한 버튼은 화면 폭을 채우고, 홈/내 모임의 중복 CTA 제거.
- 응답 탭은 받은 공유 링크가 여러 개일 수 있으니 리스트를 먼저 보여주기.
- 응답 상태를 `1/7` 같은 progress로 표시.
- 좋아요/가능해요 선택 후 화면이 상단으로 튀는 현상 수정.
- 작성 중 이동 시 기본 브라우저 알림창이 아니라 앱 내부 팝업 사용.
- 서브에이전트로 구조를 다시 분석하고 구현.

### Subagent Inputs

- `ui-fixer`: 초기 구현 일부를 맡겼으나 작업 범위를 벗어난 AGENTS/CLAUDE 지침 변경이 섞여 해당 변경은 되돌렸다.
- `reviewer`: 구현 후 read-only 검토에서 history confirm 승인 경로, 응답함/detail back-stack, share-link inbox-first, locale/accessibility 이슈를 P1/P2로 지적했다.
- `reviewer`: 최종 diff 재검토를 별도 subagent에 다시 의뢰했다.

### Decisions

- 상단 topbar는 브랜드만 남기고 설정/홈 이동은 하단 탭으로 통일.
- 홈 화면은 상태/초대 맥락 중심으로 유지하고 `새 모임 만들기`, `내가 만든 모임` 중복 CTA를 제거.
- 응답 탭과 초대 CTA는 `response=inbox` 목록으로 들어가고, 카드 선택 후 `response=detail` 상세로 이동.
- `showResponseInbox` 단독 상태 대신 URL route와 동기화해 browser back이 inbox/detail을 구분하도록 수정.
- 기본 `window.confirm`은 금지하고 `ConfirmDialog`를 사용.
- 하단 탭 click이 상위/하위 listener에서 두 번 처리되어 history stack이 중복되는 문제를 제거.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `docs/release/README.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `ai/reviews/review.md`

### Verification

- `npm run verify:functional` passed after adding regression checks for response inbox back-stack, share-link inbox-first, and custom confirm accept path.
- `npm run build` passed after updating the backend/AI verifier's accepted release implementation status.
- `graphify update . --no-cluster` passed and refreshed the local structural graph.
- Visual QA screenshots captured:
  - `/tmp/hammoyo-final-home-390.png`
  - `/tmp/hammoyo-final-home-320-fixed.png`
  - `/tmp/hammoyo-final-response-inbox-390.png`
  - `/tmp/hammoyo-final-custom-modal-390.png`

### Remaining Risks

- GitHub Pages deployment was not run in this implementation pass.
- Apps in Toss sandbox safe-area/back/share validation remains pending.

## Later Update: Responsive Product Shell Inspection

Actor: codex
Date: 2026-06-28

### User Request

- 데스크톱/넓은 화면에서 앱이 옆으로 늘어나지 않는 문제 확인.
- 우선 폭 고정 문제는 고치고, 이미지/상태/하단 탭/캘린더/시간 휠/내 모임 카드 개편은 서브에이전트 분석 후 구현 방향을 확인.

### Subagent Inputs

- `market-ux-researcher`: 기본 데스크톱의 가상 단말 프레임, 사진처럼 들어간 hero/state asset, 상시 노출 calendar, 좁은 time wheel, 내 모임 버튼 1열 스택을 주요 UX 문제로 진단. 권장 우선순위는 frame 제거, hero/title 통합, calendar overlay, time wheel 폭/행간 조정, 내 모임 3+1 액션 압축.
- `code-mapper`: 폭 제한의 직접 원인은 `.phone { max-width: 430px; }`, `body:not([data-debug-panels="true"]) .layout { grid-template-columns: minmax(320px, 430px); }`, desktop default의 820px 높이 cap이라고 확인. debug mode만 430px phone frame을 유지하는 패치 경로를 제안.

### Decisions

- 기본 제품 URL은 실제 앱 화면으로 보고 viewport 전체 폭/높이를 사용한다.
- `?debug=1`에서만 기존 430px phone-frame preview와 화면 점검 패널을 유지한다.
- 나머지 디자인 개편은 별도 구현 묶음으로 확인 후 진행한다.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run verify:release` passed.
- `npm run build` passed.
- Playwright measurement:
  - 390px default: `.phone` width 390.
  - 1024px default: `.phone` width 1024.
  - 1536px default: `.phone` width 1536.
  - 1024px `?debug=1`: `.phone` width 430.
- Visual QA screenshot captured: `/tmp/hammoyo-responsive-1024-settled.png`.

### Remaining Risks

- Full-width shell exposes the next design issue more clearly: hero/state images still feel like inserted photos, and status/my-meetups information density needs redesign.
- GitHub Pages deployment was not run for this responsive shell patch.

## Later Update: Roster-Based Final Product Redesign Implementation

Actor: codex
Date: 2026-06-28

### User Request

- 지금까지 논의한 전면 개편 전체를 서브에이전트와 함께 구현 시작.
- 참여자 인원수에 맞춰 사람 이름을 필수 입력하고, 응답자는 명단에서 자기 이름을 선택하도록 변경.
- 고급 개인별 링크는 UI 복잡도를 낮추는 숨김 패널로 제공.
- 홈 hero/status, 하단 탭, 캘린더/시간 선택, 내 모임 카드 레이아웃을 최종출시제품 기준으로 재정리.

### Subagent Inputs

- `code-mapper`: `docs/release/index.html`의 생성/공유/응답/캘린더/내 모임 경로와 검증 스크립트 변경 지점을 맵핑.
- `reviewer`: 공유 링크에 roster가 포함되지 않으면 새 브라우저에서 이름 선택이 깨지고, alias 문자열 기준 응답 저장은 중복/덮어쓰기 위험이 있다고 차단 의견 제시.

### Decisions

- 방 생성 전 참여자 명단은 예상 인원수만큼 필수 입력한다.
- 응답 저장은 `participantId` 기준으로 같은 사람의 응답을 수정하고, 다른 사람 응답을 덮어쓰지 않는다.
- 일반 공유 링크에는 전체 roster를 포함하고, 개인별 링크는 `details` disclosure 안에 숨겨 기본 UI를 복잡하게 만들지 않는다.
- 날짜 선택은 기본 닫힘 상태이며 버튼을 누르면 화면 위 fixed calendar sheet로 열린다.
- 시간 선택은 한 후보 카드 안에서 날짜 아래 full-width wheel로 유지한다.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run verify:functional` passed.
- `npm run verify:release` passed.
- `npm run build` passed.
- Playwright visual QA screenshots:
  - `/tmp/hammoyo-home-390-v2.png`
  - `/tmp/hammoyo-create-calendar-390-v2.png`
  - `/tmp/hammoyo-my-meetups-390-v2.png`
  - `/tmp/hammoyo-home-1024-settled-v2.png`

### Remaining Risks

- GitHub Pages deployment was not run in this implementation pass.
- Supabase-backed multi-device roster and per-person link tracking remain future backend work; current release page still stores state in browser storage and share payloads.

## Later Update: Poster Hero And Empty Response Tab Pass

Actor: codex
Date: 2026-06-28

### User Request

- 이전 구현 이후 논의한 홈 poster hero, 3D 진행 상태, 응답 탭 empty state, 직접입력 인원, 24시간제 time wheel, 로컬 데이터 삭제 확인 팝업을 서브에이전트와 함께 구현.
- 응답 탭은 현재 모임이 없어도 눌리고, `현재 모임이 없어요` empty state를 보여야 함.

### Subagent Inputs

- `ui-fixer`: `docs/release/index.html`에서 hero status overlay, response empty state, expected count direct input, 24-hour time wheel, clear-local-data confirm을 구현하고 기능 검증을 통과했다고 보고.
- `reviewer`: final diff review requested after integration.

### Decisions

- 홈의 별도 `HomeStatusPanel`은 제거하고, `HomeHeroStatusOverlay` / `HeroStatusPill`을 poster hero 하단에 통합한다.
- 응답 탭은 `appState.room`이 없어도 `scr-02-participant-input&response=inbox`로 진입하며, 받은 초대 empty state와 내가 보낸 방 안내를 함께 보여준다.
- 예상 인원 select는 `3~10 + 직접입력`으로 제한하고, 직접입력 확인 후 참여자 입력 칸 수를 동기화한다.
- 시간 wheel은 오전/오후 열을 제거하고 0~23시 hour/minute 2열로 유지한다.
- 로컬 데이터 삭제는 기존 custom confirm modal을 재사용하고, 취소 시 storage를 보존한다.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- `docs/release/index.html` and `docs/index.html` are identical (`cmp_exit=0`).
- Playwright visual QA screenshots:
  - `/tmp/hammoyo-agreement-create-panel-390.png`
  - `/tmp/hammoyo-anonymous-result-panel-390.png`
  - `/tmp/hammoyo-agreement-sheet-panel-390.png`
- Playwright visual QA screenshots:
  - `/tmp/hammoyo-home-390-v4.png`
  - `/tmp/hammoyo-home-320-v4.png`
  - `/tmp/hammoyo-response-empty-390-v4.png`
  - `/tmp/hammoyo-host-custom-390-v4.png`

### Remaining Risks

- GitHub Pages deployment was not run yet in this pass.
- Empty response tab is local-state based; truly knowing who has not responded still requires server-backed invite tracking or per-person links.

## Later Update: Anonymous Consensus And Agreement Criteria Pass

Actor: codex
Date: 2026-06-28

### User Request

- 첨부된 새 방향대로 함모여를 `개별 선택은 비공개, 현재 합의 상황은 공개` 구조로 변경.
- 별도 의견은 나중에 주고, P1/P1.5/P2까지 서브에이전트를 활용해 구현.
- 구현 후 부족하거나 충돌되는 부분은 다시 조정.

### Subagent Inputs

- Native Codex subagents `planner` and `reviewer` were attempted first, but both failed immediately due to usage-limit exhaustion.
- Claude CLI first-party auth status was valid, but the delegated read-only review failed with API 401.
- Antigravity/Gemini read-only UX/QA review completed and recommended: hide candidate aggregates before response, show anonymous aggregates after response and to host, add agreement modes, keep individual choices hidden, and expand functional/design tests.

### Decisions

- Product principle is now `사람은 숨기고, 상황은 보여준다`.
- Participant detail before response shows only progress and privacy guidance; candidate-level aggregate counts are hidden until after submission.
- Response-complete, recommendation, insufficient-response host contexts, and my-meetups host cards now use anonymous aggregate/status summaries without person-choice matrices.
- Room model now includes `agreementMode`, `minimumAttendees`, `agreementRevision`, previous criterion fields, and `agreementChangedAt`.
- Agreement modes:
  - `all_together`: default; any burden response can hold a candidate back.
  - `threshold`: recommends a candidate when host-selected minimum attendees are available.
  - `fast_decision`: recommends the earliest candidate that reaches the minimum attendees.
- Changing agreement criteria keeps existing responses and recalculates recommendation; a criterion-change notice is shown.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `node scripts/verify-release-functional.mjs` passed.
- `npm run build` passed.
- `git diff --check` passed.
- `docs/release/index.html` and `docs/index.html` are identical (`cmp_exit=0`).

### Remaining Risks

- 네이티브 Codex 서브에이전트와 Claude delegated review는 환경/사용량 문제로 완료되지 못해 이번 pass는 Antigravity 보조 검토 + main Codex 통합 검증으로 마무리했다.
- 현재 GitHub Pages 정적 앱은 localStorage/share payload 기반이라, 다른 기기에서 같은 방의 실시간 응답 집계를 공유하려면 Supabase-backed room/response 저장소가 필요하다.
- 기준 변경 notice는 새 share payload 또는 같은 저장 상태를 보는 사용자에게 표시된다. 이미 오래전에 받은 정적 링크만 다시 열면 최신 기준 변경을 서버 없이 알 수 없다.

## Later Update: Secret Vote Hero And Custom Form Controls Pass

Actor: codex
Date: 2026-06-28

### User Request

- 홈 첫 화면에서 전체 hero 이미지와 이미지 아래 현재 진행상태가 보이도록 재구성.
- 비밀 투표 가치를 첫 설명에서 강하게 강조하고, 파란색 문장으로 "마지막 투표, 항상 부담되셨죠?" 흐름을 보여주기.
- 하단 탭의 희미한 그림 제거, 글자 중심 정렬.
- 모든 dropdown/native calendar 기본형을 앱에 맞는 custom control로 바꾸고, 이 원칙을 전역지침에 반영.
- 응답 마감도 iPhone-like calendar와 24시간/10분 단위 time wheel로 바꾸기.
- 후보 삭제 시 카드가 실제로 사라지도록 보장.

### Subagent Inputs

- Native Codex subagent `019f0e5d-7a06-7e83-b1a6-87b4f49f9fec` read-only UX review found P0 issues: home hero overlay structure, response tab decorative graphic, native select usage, deadline plain input, discontinuous time wheel, weak candidate delete verification.
- Native Codex subagent `019f0e5d-d138-74b1-8264-db9debcdb4e5` read-only verifier review blocked the previous state due to native `select`, plain deadline input, stale tests, and weak visual regressions.

### Decisions

- Home hero now leads with a blue `비밀 투표` message and keeps the animal/calendar image in-flow, followed by the current status card.
- Bottom navigation no longer uses background animal/object art on the tab items; non-center tabs are text-only.
- Expected count and minimum attendees use `CustomChoiceControl` and `CustomChoicePopover` instead of native select.
- Deadline uses the same visual calendar system as candidate dates plus the release time wheel.
- Time wheel data order is continuous: hours `00` through `23`, minutes `00,10,20,30,40,50`; the selected item is centered inside the wheel column without scrolling the whole screen.
- Candidate deletion no longer pads back to three cards automatically; removing a third candidate leaves two cards until the user adds another.
- Global design preflight now records the custom dropdown/calendar/time-control rule.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`
- `/Users/kangsungbae/Documents/지식저장소/docs/workflows/design-preflight.md`
- `/Users/kangsungbae/.codex/memories/extensions/ad_hoc/notes/2026-06-28-225452-custom-form-controls-calendar.md`

### Verification

- `npm run build` passed.
- Playwright screenshots checked:
  - `/tmp/hammoyo-home-390-v3.png`
  - `/tmp/hammoyo-home-320-v3.png`
  - `/tmp/hammoyo-create-390-v3.png`
  - `/tmp/hammoyo-create-count-open-v2.png`
  - `/tmp/hammoyo-create-calendar-open.png`

### Remaining Risks

- Static GitHub Pages/localStorage still cannot know cross-device response state without Supabase-backed room/response storage.
- Native browser controls are now blocked in this release HTML, but future projects need the global design preflight and memory note to be read before UI implementation.

## Later Update: Enlarged Animal Bottom Navigation

Actor: codex
Date: 2026-06-28

### User Request

- 하단 탭 글자를 훨씬 크게 만들기.
- 탭 사이 영역/경계를 더 분명하게 키우기.
- 기존 이미지 assets를 90% 불투명 배경으로 넣기.
- 선택된 탭은 글자를 더 진하게 하고 이미지가 10% 커지게 만들기.
- 서브에이전트를 활용해서 구현하기.

### Subagent Inputs

- `019f0e8d-ffb1-79c0-b4cc-14c74290c679` read-only review warned that literal 36px text breaks 320px widths, so nav height, screen height calculation, text clamp, image layer, and label plate must be adjusted together.
- `019f0e8d-bffd-7e71-b1b7-1a01dafc83b9` implemented the initial BottomNav CSS and `data-nav-art` wiring in `docs/release/index.html`; main Codex integrated, corrected letter spacing, added small-width safeguards, synced `docs/index.html`, and updated functional verification.

### Decisions

- Bottom nav height increased and all screen height calculations continue using `--bottom-nav-height`.
- Non-center tab labels scale up to 30px on wider viewports and use a small-screen override at 320px so labels stay inside each tab.
- Each tab now has a 90% opacity asset background and a separate label plate to preserve readability.
- Active tabs use `data-active="true"` to increase asset scale to `1.1`, strengthen label weight, and apply a brand-colored label state.
- Functional verifier now checks for requested nav art and active-state scale/weight instead of the previous no-art contract.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Playwright screenshot checks:
  - `/tmp/hammoyo-bottomnav-wide768.png`
  - `/tmp/hammoyo-bottomnav-mobile390.png`
  - `/tmp/hammoyo-bottomnav-narrow320.png`
- Computed layout checks confirmed labels fit within tab bounds at 320px, 390px, and 768px; active `내 모임` art transforms to `matrix(1.1, 0, 0, 1.1, 0, 0)`.

### Remaining Risks

- The user's "3x" label request is fully reached on wider viewports (`30px` from the previous `12px`), but 320px phones require a smaller responsive label to prevent overlap.
- The center `모임 만들기` label remains smaller than the side labels because the central plus button and longer label need to coexist in the same fixed bottom navigation.

## Later Update: Home Current Room Title Emphasis

Actor: codex
Date: 2026-06-28

### User Request

- 홈 현재상태 카드에서 어떤 모임의 상태인지 제목이 너무 작게 보여서, 모임 제목을 더 강조하기.

### Decisions

- `현재 모임 · 제목 · 응답 수`를 작은 문장으로 두지 않고 `HeroStatusContext` 제목 블록으로 분리했다.
- 모임 제목은 `clamp(22px, 5.9vw, 30px)`와 `font-weight: 950`으로 강조한다.
- 상태 카드 안에서 제목 블록을 가장 먼저 배치해서 하단 탭에 가려지기 전에 모임 제목이 보이게 했다.
- hero 이미지 크기는 기존 기능 검증 기준을 유지하면서 제목이 첫 화면에 보이도록 `min(224px, 66%)`로 조정했다.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Playwright screenshot checked: `/tmp/hammoyo-home-status-title-390-v2.png`.
- Computed check confirmed demo room title `대학 동기 모임` is `23.01px`, weight `950`, and fully above the bottom nav on 390px viewport.

### Remaining Risks

- On very short screens, the metric cards below the title can still require scroll because the enlarged bottom nav uses more vertical space. The room title itself remains visible before the nav.

## Later Update: Single Poster Scene Home

Actor: codex
Date: 2026-06-28

### User Request

- 홈 화면이 카드/패널 여러 개로 나뉘어 보이는 문제를 전면 수정.
- 동물 이미지는 배경화면처럼 깔고, 글자와 현재 상태 정보가 그 위에 떠 있는 구조로 변경.
- 비밀 투표 문구, 모임 제목, 응답 현황은 유지하되 패널 경계를 줄이기.
- 서브에이전트를 활용해서 구현.

### Subagent Inputs

- `019f0eac-88cc-7af2-ab86-9a027ccf65c0` read-only review identified nested `HomeHeroPrivacyMessage`, `HomeHeroStatusOverlay`, and `HomeMetricCard` panels as the main cause of the fragmented home feel. It recommended a single poster root with an art layer and floating text/status overlays.
- `019f0eac-2d41-72d3-9dde-d5e9d2de12ac` implemented the first poster-scene CSS pass in `docs/release/index.html`, converting `HomeHeroAnimals` to an absolute background layer and removing heavy panel borders/shadows from privacy/status areas.

### Decisions

- `HomeHero` now behaves as a single poster scene instead of a card containing multiple cards.
- `HomeHeroAnimals` is an absolute background art layer behind the copy and status text.
- Privacy copy and status information use light scrim/blur only, with heavy borders and card shadows removed.
- Home status metrics remain visible but are visually softened so they read as floating information rather than separate panels.
- The functional verifier's hero contract now checks for poster composition: background art layer, no privacy/status border, and floating status title.
- Small-width media rules compress the status block so 320px screens keep the metric row above the enlarged bottom nav.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Playwright screenshots checked:
  - `/tmp/hammoyo-poster-v4-mobile390.png`
  - `/tmp/hammoyo-poster-v4-narrow320.png`
- Computed 320px check confirmed the status metric row has 11px clearance above the bottom nav.

### Remaining Risks

- The enlarged bottom nav still consumes substantial vertical space on short phones, so the poster scene is tightly composed at 320px.
- The status metrics keep a light translucent backing for readability; fully removing the backing would reduce contrast over the animal art.

## Later Update: Sent Room Folder And Responsive Width Fix

Actor: codex
Date: 2026-06-28

### User Request

- 하단 탭 이미지를 기존 단체 이미지를 잘라 쓰는 느낌이 아니라 각 캐릭터 자산으로 보이게 수정.
- 홈 화면은 패널 안에 갇힌 느낌을 줄이고 화면을 꽉 채우는 poster scene으로 유지.
- 내 모임 카드의 버튼과 패널이 왼쪽에 쏠리지 않고 가로폭을 채우도록 수정.
- 작은 글자들을 전반적으로 키워 가독성을 확보.
- 응답 탭에서는 내가 보낸 방이 여러 개일 때 folder/accordion 형태로 전체 목록과 count를 보여주기.
- 내가 만든 방은 받은 초대 카드로 보이지 않게 구분.

### Subagent Inputs

- `019f0ebe-9196-7d13-9922-436953acb057` implemented a first pass for bottom tab art, poster layout, and typography; it flagged that browser verification was still needed.
- `019f0ec2-b4fb-7450-b89c-654b6ebf49fd` read-only review identified duplicate bottom-nav art declarations, `responseInbox()` single-room assumptions, `HostCardActions`/`IndividualLinks` width issues, and small text selectors that needed late overrides.

### Decisions

- Bottom navigation now uses standalone final character assets for every tab: rabbit, penguin, dog, bear, and cat. The center create tab no longer uses the group hero image.
- `responseInbox()` now renders a reusable `sentRoomsFolder()` based on `appState.hostRooms`, including count, expandable list, room title, response progress, and status chip.
- Hosted rooms are not shown as received-invite cards. Only `room.isSharedLink` is treated as a received invite; hosted rooms live under the sent-room folder.
- My-meetups cards, action rows, individual-link panels, and link fields are forced to stretch to full card width.
- Metric typography remains larger, but host metric values use a responsive no-wrap size to avoid breaking `미응답 3명` across lines.
- Functional verifier now checks standalone nav assets, sent-room folder count/list behavior, own-room vs received-invite separation, and full-width action/link sections.

### Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-28-final-release-redesign-codex.md`

### Verification

- `npm run verify:functional` passed after the new failing sent-folder regression test was added and implemented.
- `npm run build` passed.
- `git diff --check` passed.
- `rg -n "mvp|MVP"` over changed release/test/log files returned no matches.
- Playwright screenshots checked:
  - `/tmp/hammoyo-latest-home-v2-390.png`
  - `/tmp/hammoyo-latest-response-folder-v2-390.png`
  - `/tmp/hammoyo-latest-my-meetups-v2-390.png`

### Remaining Risks

- The bottom navigation is intentionally tall because tab text is now much larger. It fits current 320px and 390px checks but leaves less vertical space on short phones.
- The home status overlay keeps a translucent scrim for readability over the animal art; removing it entirely would make white title text unstable over the background.
