# 함모여 backend/AI/design 보정 세션

Date: 2026-06-24
Actor: codex

## User Request

Supabase/권한/응답 정책, AI/copy 경계가 비어 있으므로 보정 기획을 수행하고, Supabase와 AI는 어디에 어떻게 붙일지 준비 의견을 남긴다. 로그인은 Apps in Toss login으로 잡는다. 추가로 디자인 기획을 보강하고, 디자인 기획에 따른 샘플 최종출시제품을 현재 프로젝트에 생성하며, 전체 P4 산출물 사본을 현재 프로젝트에 넣는다. 향후 Hermes Planning Lab 산출물은 각 프로젝트에도 복사하도록 지시한다.

## Decisions Made

- Apps in Toss `appLogin()`을 기본 로그인으로 정했다.
- Supabase는 기본 backend로 쓰되, 앱/domain 로직에서 직접 import하지 않고 `BackendAdapter`/Edge Function/server boundary 뒤에 둔다.
- Host 권한은 URL token이 아니라 Toss login 기반 `host_user_id`로 판단한다.
- 초대 링크는 `invite_slug` locator만 포함한다.
- 한 사용자당 한 round에 한 active response만 허용하고, 수정은 room close/expiry 전까지만 허용한다.
- Closed/expired room에서는 write와 recompute를 막는다.
- AI는 추천 ranking이 아니라 공유 문구 polish에만 optional로 붙인다.
- Template fallback을 기본값으로 두고, AI copy는 라벨/고지/프라이버시 제한을 적용한다.
- 사람 리뷰는 구현 전 필수 게이트로 두지 않고 문서 정합성/샘플 확인/에이전트 QA로 대체한다.

## Files Changed

- `ai/plans/implementation-plan.md`
- `ai/plans/design-plan.md`
- `docs/design/image-generation-brief.md`
- `docs/release/README.md`
- `docs/release/index.html`
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `00_PROJECT_BRIEF.md`
- `01_DECISIONS.md`
- `ai/plans/product-plan.md`
- `ai/plans/planning-status.md`
- `ai/reviews/review.md`
- `planning-lab/index.md`
- `planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/`
- `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/index.md`
- `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/context.md`
- `/Users/kangsungbae/Documents/지식저장소/agent/operating-rules.md`
- `/Users/kangsungbae/Documents/지식저장소/planning-lab/00_SYSTEM/OPERATING_POLICY.md`
- `/Users/kangsungbae/Documents/지식저장소/planning-lab/00_SYSTEM/STAGE_ARTIFACT_POLICY.md`

## Verification Run

- Confirm P4 copy exists in current project.
- Confirm canonical implementation/design docs exist.
- Confirmed required files exist with a Node smoke check.
- Confirmed `docs/release/index.html` includes expected sample screen tokens: `SCR-01`, `SCR-02`, `SCR-03`, `AI가 다듬은 문구`, `Apps in Toss`, `Supabase`.
- Ran `tidy` and `xmllint` against `docs/release/index.html`. Local `tidy` uses an old HTML profile and warns on modern attributes, while `xmllint --html --noout --encode UTF-8` exited 0.
- Refreshed project Graphify after final sample edits: `548 nodes, 2839 edges`.
- Refreshed shared knowledge-store Graphify: `3014 nodes, 113925 edges`.
- Ran global Graphify refresh. `hammoyo`, `planning-lab`, and `지식저장소` were registered in `/Users/kangsungbae/.graphify/global-graph.json`.
- Re-registered `hammoyo` graph into global Graphify after final sample edits.

## Remaining Risks

- Live validation responses are still 0.
- Toss app id, Supabase project, server credentials, and AI provider/model are not connected.
- The 최종출시제품 sample is static and does not prove real Apps in Toss runtime behavior.

## Promotion

The Planning Lab project-copy rule was promoted to shared operating rules and Planning Lab regional policy.
