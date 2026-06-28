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
