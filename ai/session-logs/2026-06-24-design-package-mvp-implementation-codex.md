# 함모여 디자인 패키지 MVP 구현 세션

Date: 2026-06-24
Actor: codex

## User Request

`HAMMOYEO_DESIGN_PACKAGE` 아래 디자인 개선문, 기획문, 샘플을 모두 확인해 현재 디자인을 전체 개편하고, 필요하면 구현 내용도 개선한다. 앞으로 구현될 모든 내용은 이 디자인에 맞추도록 하며, 서브에이전트를 활용해 구현을 시작한다.

## Stage

`implementation` + `qa`

## Subagents Used

- `context-brief`: 디자인 패키지의 토큰, 화면, 상태 정책, 필수 산출물 요약.
- `code-mapper`: 기존 `docs/mvp/index.html` 구조와 패키지 대비 누락 화면/문구/토큰 gap 확인.
- `reviewer`: 모바일 폭, 내부 용어 노출, AI 라벨 조건, 만료/확정 상태 CTA 위험 점검.

## Decisions Made

- `HAMMOYEO_DESIGN_PACKAGE`를 현재 함모여 디자인 source of truth로 승격했다.
- 정적 MVP는 실제 앱 화면 우선으로 재구성하고, 데스크톱 폭에서만 QA용 화면 선택/토큰 패널을 노출한다.
- AI copy는 기본 비활성 상태로 두고 `?ai=on` fixture에서만 AI 라벨을 보여준다.
- 응답 부족 상태에서는 추천/AI/share CTA를 숨긴다.
- 만료 링크와 확정 완료 상태에서는 응답 저장, 응답 수정, 추천 재계산 CTA를 제공하지 않는다.
- React Bits는 현 정적 HTML 단계에서는 설치하지 않고 DOM/CSS micro-interaction과 reduced-motion 대응만 사용한다.

## Files Changed

- `docs/mvp/index.html`
- `docs/mvp/README.md`
- `scripts/verify-mvp-design.mjs`
- `package.json`
- `ai/plans/design-plan.md`
- `ai/reviews/review.md`
- `AGENTS.md`
- `CLAUDE.md`

## Verification Run

- `npm run build`
  - Result: passed.
  - Verifies required screen IDs, package token values, required labels, component markers, query route support, reduced motion, 44px touch target token, and AI copy default-off fixture.
- Chrome + Playwright using system Chrome executable.
  - Result: passed for viewport widths `360`, `390`, and `420`.
  - Checked every screen route from `SCR-00` through `SCR-06`.
  - Checked no horizontal overflow, no visible legacy/internal copy, visible buttons at least 44px, AI label hidden by default and shown only with `?ai=on`, low-response CTA restrictions, expired/closed CTA restrictions, and hidden mobile sample panel.
- Visual evidence:
  - `/tmp/hammoyo-mvp-screens/result-390.png`
- Graph refresh:
  - `/Users/kangsungbae/.codex/bin/graphify update . --no-cluster`
  - Result: project graph rebuilt successfully.
  - `/Users/kangsungbae/.codex/bin/graphify global add "/Users/kangsungbae/Documents/hammoyo/graphify-out/graph.json" --as "hammoyo"`
  - Result: `hammoyo` re-registered in `/Users/kangsungbae/.graphify/global-graph.json`.
- Understand-Anything refresh:
  - Ran deterministic scan/fingerprint refresh with `102` analyzed files.
  - Added design package/MVP implementation nodes and edges to `.understand-anything/knowledge-graph.json`.
  - Result: UA graph validates with `97 nodes`, `98 edges`, `5 layers`, and `5 tour steps`.

## Remaining Risks

- This is still a static HTML MVP. It does not prove Supabase, Apps in Toss runtime, Toss login, or AI provider integration.
- Live validation evidence is still 0 responses.
- The next real implementation should move the same copy/state contract into the app source structure with i18n files and adapters.
- UA refresh was lightweight/deterministic, not a full 7-phase LLM reanalysis.

## Promotion

No new cross-project knowledge was promoted. The project-local design source rule is recorded in `AGENTS.md`, `CLAUDE.md`, `ai/plans/design-plan.md`, and `ai/reviews/review.md`.
