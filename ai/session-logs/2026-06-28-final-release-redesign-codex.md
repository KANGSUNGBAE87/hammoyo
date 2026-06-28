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
