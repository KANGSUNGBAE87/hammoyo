# hammoyo AGENTS.md

이 폴더는 `함모여(hammoyo)`의 기본 프로젝트 루트입니다.

## 시작 순서

함모여 관련 작업을 시작할 때는 먼저 이 파일과 아래 파일을 읽습니다.

1. `README.md`
2. `00_PROJECT_BRIEF.md`
3. `01_DECISIONS.md`
4. `ai/plans/planning-status.md`
5. `ai/plans/product-plan.md`
6. `ai/plans/design-plan.md`
7. `ai/plans/implementation-plan.md`
8. `ai/reviews/review.md`
9. `planning-lab/index.md`
10. `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_CODEX_DESIGN_BRIEF.md`
11. `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_DESIGN_TOKENS.json`

## 현재 단계 경계

- 현재 공식 Planning Lab 단계는 `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL`입니다.
- 최신 실행은 Planning Lab corrective task `t_5fd833b9`이며, parent task `t_961aed7c`가 파일을 만들지 못한 뒤 실제 P2/P3/P4 산출물 패키지 `PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9`를 생성했습니다. 직전 live-pre-P4 run `PL-LIVE-PRE-P4-HAMMOYEO-2026-06-23-t_1093f4ab`에서는 실제 live 응답 수집이 모집/연락 경로 부재로 blocked였고, 이 evidence caveat는 P4 패키지에 보존되어 있습니다.
- P2 결과는 `AI_GRADE_B / AI_RECOMMEND_PROMOTE`였습니다.
- P3 결과는 `AI_GRADE_B / AI_RECOMMEND_PRE_P4_VALIDATION`이었습니다.
- pre-P4 결과는 `AI_GRADE_B` 유지이나 `AI_RECOMMEND_NARROWER_PRE_P4_VALIDATION`, `P4_HOLD`입니다.
- P4 최종 기획문, 디자인 기획문, 샘플은 task `t_5fd833b9`에서 실제 생성됐습니다. 공식 경로는 `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`입니다. 구현/Production Studio 전달과 `FINAL_APPROVED`는 아직 승인되지 않았습니다.
- 2026-06-24 Codex 보정으로 Supabase/권한/응답/AI/copy/디자인 샘플 기준이 프로젝트에 추가됐습니다. 현재 구현 전 기준은 `ai/plans/implementation-plan.md`, `ai/plans/design-plan.md`, `docs/mvp/index.html`입니다.
- 2026-06-24 Owner 지시로 `HAMMOYEO_DESIGN_PACKAGE`가 향후 디자인 source of truth가 되었습니다. 모든 UI 구현과 샘플 개선은 이 패키지의 design brief/token/task prompt를 먼저 따릅니다.

## 최신 함모여 해석

- 단순 일정 투표/링크/겹치는 시간 확인은 카카오톡 다중 투표, 캘모아, 언제볼까가 강하게 덮습니다.
- 함모여가 살아남을 수 있는 좁은 가설은 “전원 가능 시간이 없거나 선호가 갈릴 때, 방장이 납득 가능한 fallback 추천안 1~2개와 카카오톡 공유용 관계 안전 확정 문구를 얻는 것”입니다.
- 최신 조건부 P4 패키지는 `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`에 있습니다. fallback 관계 안전성/외부 링크 전환/WTP·반복 세그먼트 재논의와 validation protocol은 완료됐지만 실제 응답은 0건이므로, 패키지는 `EVIDENCE_UNVALIDATED`와 `IMPLEMENTATION_CONDITIONAL`로 표기되어 있습니다.
- 로그인은 Apps in Toss `appLogin()` 기준입니다. Supabase는 기본 backend로 준비하되 앱/domain 로직에서는 직접 import하지 않고 adapter/server boundary 뒤에 둡니다.
- AI는 추천 ranking이 아니라 공유 문구 polish에만 선택적으로 사용합니다. Template fallback과 AI 라벨은 필수입니다.
- 디자인 구현 기준은 `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_CODEX_DESIGN_BRIEF.md`와 `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_DESIGN_TOKENS.json`입니다.
- 정적 샘플 MVP는 `docs/mvp/index.html`이며 `npm run build`로 디자인 계약 검증을 실행합니다.
- 앞으로 구현되는 화면은 `SCR-00`, `SCR-01`, `SCR-02`, `SCR-02B`, `SCR-03`, `SCR-04`, `SCR-05`, `SCR-06` 흐름과 package token을 유지합니다.

## 원본과 작업 루트

- 작업 루트: `/Users/kangsungbae/Documents/hammoyo`
- 기본 GitHub remote: `origin` → `https://github.com/KANGSUNGBAE87/hammoyo.git`
- GitHub web URL: `https://github.com/KANGSUNGBAE87/hammoyo`
- 공식 Planning Lab 원본: `/Users/kangsungbae/Documents/지식저장소/planning-lab`
- 이 폴더의 `planning-lab/` 아래 파일은 작업 편의를 위한 사본입니다. 감사/출처가 필요하면 공식 원본을 확인합니다.
- 조건부 P4 전체 사본: `/Users/kangsungbae/Documents/hammoyo/planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9`
- 공유 platform note: `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`

## Planning Lab 산출물 복사 규칙

앞으로 Hermes Planning Lab이 P1/P2/P3/P4 산출물을 만들면 공식 원본은 `/Users/kangsungbae/Documents/지식저장소/planning-lab`에 저장하고, 해당 프로젝트 루트가 있으면 `planning-lab/<run-id>/` 아래에도 사본을 배치합니다. 보고 시 공식 원본 경로와 프로젝트 사본 경로를 모두 명시합니다.

## 주의

P2/P3/pre-P4 결과를 최종 제품기획으로 오해하지 않습니다. 함모여는 현재 “모임 확정 자동화 / 경량 합의 엔진” 방향의 검증된 후보이며, P4 final package 산출물은 task `t_5fd833b9`에서 생성됐습니다. live evidence 0건 caveat와 `FINAL_APPROVED` 미승인 상태를 보존합니다.

## Shared Knowledge Sources

- Reuse the shared long-term knowledge repository at `/Users/kangsungbae/Documents/지식저장소`.
- Before substantial planning, architecture, or coding work, read `/Users/kangsungbae/Documents/지식저장소/AI_CONTEXT.md`, then `agent/index.md`, `agent/profile.md`, `agent/operating-rules.md`, and the relevant `sessions/` or `projects/` notes.
- Treat `/Users/kangsungbae/Documents/최종관리자` as a historical/reference workspace when relevant. Search its dated folders for explicit files, but prefer promoted knowledge in `/Users/kangsungbae/Documents/지식저장소` as the durable source of truth.
- When reusable knowledge appears during `hammoyo` work, promote it into Markdown under `/Users/kangsungbae/Documents/지식저장소` so Codex, Claude, and future AI assistants can share it.
- Keep sync token-light: do not replay all raw logs, do not paste full transcripts, and do not repeatedly read large logs or generated graph files unless the task specifically requires it.
- Answer the user in Korean by default unless the task or requested artifact clearly calls for another language.

## Implementation Consent Gate

- Do not start implementation, file edits, configuration changes, installs,
  deployments, deletes, or other mutating work unless the latest user message
  explicitly asks to implement, modify, apply, update, create, run, install,
  delete, or otherwise execute that action.
- For questions, reviews, status checks, "확인해줘", "의견줘", "어떻게 할까", and
  ambiguous requests, read or inspect as needed and answer with findings,
  tradeoffs, and a recommended next step. Then wait for explicit implementation
  permission.
- Read-only inspection and planning are allowed when requested. Mutating
  commands and file edits require explicit action wording.

## Custom Subagent Routing

When the user explicitly asks for subagents, parallel agents, delegation, or a named custom agent:

- First consult `/Users/kangsungbae/.codex/agents/` and `/Users/kangsungbae/.codex/agent-routing/subagent-backends.toml`.
- Treat `subagent-backends.toml` as the source of truth for preferred backend/model routing.
- Prefer the routing file's external primary or secondary backend, such as `agy`/Gemini or Claude, before native Codex fallback when specified.
- Before using Claude CLI or Antigravity CLI (`agy`), run the auth checks from the global instructions: `claude auth status` for Claude and `agy -p 'Reply with exactly: AGY_AUTH_OK' --print-timeout 45s` for `agy`.
- If the preferred external backend is unavailable, unauthenticated, quota-limited, timed out, or rejected, tell 성배님 plainly and mark the run as degraded before falling back. Do not silently substitute GPT/native Codex for a custom-routed external worker.
- Subagents return a `세션로그용 요약 블록`; the main Codex/Claude session writes project-local `ai/session-logs/` when needed.

## understand-anything

This project uses Understand-Anything project memory in `.understand-anything/`.

Rules:
- For architecture mapping, onboarding, codebase Q&A, domain flow, or diff-risk analysis, prefer the installed Understand-Anything skills before doing a broad source walk.
- Keep `.understand-anything/config.json` with `"language": "ko"`, `"outputLanguage": "ko"`, and `"autoUpdate": true` unless the user asks otherwise.
- Refresh Understand-Anything only after meaningful project or code architecture changes. Do not run it for policy-only, copy-only, or note-only changes.

## Project Plans and Session Logs

This project stores AI-generated planning and session evidence under `ai/`.

Rules:
- Maintain canonical latest artifact files for recurring project documents:
  - `ai/plans/product-plan.md` for product/spec planning.
  - `ai/plans/design-plan.md` for UX/UI/design planning.
  - `ai/plans/implementation-plan.md` for implementation planning.
  - `ai/reviews/review.md` for review/QA critique and readiness notes.
- Put `version`, `status`, `updated`, and `canonical: true` frontmatter at the top of each canonical artifact.
- Update the canonical file in place when the plan changes; the newest state should be discoverable by opening the fixed filename.
- Keep a short `Change Log` inside each canonical file. Archive milestone snapshots only when useful under `ai/plans/archive/` or `ai/reviews/archive/`.
- Dated files remain appropriate for session logs, research notes, one-off handoff briefs, or archive snapshots, but they should not replace the canonical latest files.
- Keep `ai/session-logs/README.md` in every new project even before the first real log exists.
- Save meaningful session change logs in `ai/session-logs/` as dated Markdown files. Include user request, decisions, files changed, commands or verification, risks, next steps, and knowledge-store promotion status.
- Every meaningful session should first be recorded in this project's `ai/session-logs/`; `/Users/kangsungbae/Documents/지식저장소` is for promoted reusable summaries, not a replacement for the local project log.
- Name session-log files `YYYY-MM-DD-<short-topic>-<actor>.md` where `<actor>` is `codex`, `claude`, or `gemini` (use `both` only for a genuinely joint log).
- Same-day same-topic sessions must still be separated by actor. Append only to the matching actor's file and keep the internal `Actor:` field aligned with the filename.
- If this project has no session logs yet, write the first real log at the end of the first meaningful planning, implementation, review, QA, release, or durable-decision session. Do not create fake placeholder logs.
- Keep plans and logs concise. Do not paste full chat transcripts or full tool logs unless the raw evidence itself is the artifact being preserved.
- Keep `ai/` available to project-local Graphify; do not ignore it in `.graphifyignore`.
- Promote reusable knowledge from these logs to `/Users/kangsungbae/Documents/지식저장소`.
- Follow `/Users/kangsungbae/Documents/지식저장소/docs/workflows/graph-refresh-policy.md` for graph timing.
- Refresh project Graphify after new project setup, verified feature completion, finalized important project docs, durable decisions, or handoffs that depend on recent files.
- Do not refresh project Graphify for ordinary conversation, tiny copy edits, or short unsaved opinions.
- Use `graphify update . --no-cluster` as the routine structural fallback when a refresh is worthwhile.

## App Platform Portability

If this project is an app, follow `/Users/kangsungbae/Documents/지식저장소/docs/workflows/app-platform-standard.md`.

Rules:
- Keep every app compatible with both Apps in Toss and Google Play from the first implementation unless the user explicitly narrows the target.
- For game or game-like apps, use Google Play as the first release target while preserving Apps in Toss compatibility.
- For non-game apps, use Apps in Toss as the first release target while preserving Google Play compatibility.
- Before meaningful app planning, design, implementation, or QA, read `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-platform.md` and run `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-development-gate.md`.
- Before deploy, release review, Google Play-first game release prep, store packaging, or a user-facing release decision, run `/Users/kangsungbae/Documents/지식저장소/docs/workflows/apps-in-toss-release-gate.md`.
- Use `/Users/kangsungbae/Documents/지식저장소/docs/tools/apps-in-toss-developer-center-catalog.md` to find the exact official Apps in Toss developer-center page when details matter.
- Keep authentication/login, ads, in-app purchase, storage, analytics, haptics, share, and backend transport behind platform adapters.
- Do not import Apps in Toss, Google Play Billing, AdMob, Google login, or other platform SDKs directly from product/domain logic.
- Use Supabase as the default backend for every app project unless a project records an explicit exception. Keep Supabase behind `BackendAdapter`/repository/server boundaries; product/domain logic must not import `@supabase/supabase-js` directly.
- Use one shared Supabase project for MVPs and mini apps by default: `dr.kang-mini-project` (`project-ref: jwnuxxxthzkeiiuqopir`). Use only the `public` schema and separate app data with short, unique table prefixes.
- Use `core_`, `identity_`, and `authmap_` prefixes for shared user/account mapping. Google, Apps in Toss/Toss, Apple, Kakao, GitHub, and anonymous identities map to internal `core_users` through `authmap_user_identities`; do not automatically merge providers.
- Codex/Claude should write SQL migrations, adapter/repository code, `.env.example`, and setup docs. The user reviews and applies SQL in the Supabase SQL Editor by default. Do not run remote apply commands such as `supabase db push` unless explicitly asked.
- Enable RLS for user data tables by default. Do not write public-open policies like `using (true) with check (true)`, do not disable RLS, and do not store raw Toss userKey values.
- Keep Supabase service role keys, DB passwords, JWT/webhook secrets, receipt-verification secrets, and other server credentials out of app bundles. Frontend public env may contain only Supabase URL/anon key when RLS and storage policies are verified.
- For shared Supabase public client values across app projects, use `/Users/kangsungbae/.config/sungbae/shared-env/supabase-public.env.local`. Project `.env.local` may reference this file. Store only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` there; never store service role keys, `SUPABASE_ACCESS_TOKEN`, DB passwords, JWT secrets, webhook secrets, or platform private secrets in that shared public env file.
- For shared server-only AI provider secrets such as DeepSeek, use `/Users/kangsungbae/.config/sungbae/shared-env/ai-secrets.env.local`. Project `.env.server.local` may reference this file. Store `DEEPSEEK_API_KEY` there only as a server-side key; never expose it through `VITE_`, `NEXT_PUBLIC_`, or `PUBLIC_` env names. Client apps must call a backend/Supabase Edge Function/server proxy that owns the secret.
- Implement i18n from the first app version: Korean (`ko`) is the default, and English (`en`) must be user-selectable.
- Route UI copy, LLM prompts, notifications, purchase copy, errors, empty states, and onboarding through the active locale instead of hard-coding user-facing strings.
- Plan MVP stubs for login, ads, and IAP even when the first release does not enable them.
- Apps in Toss implementations should use Toss login, Apps in Toss ads, and Apps in Toss IAP.
- Google Play implementations should use Credential Manager or Play Games Services, AdMob, and Google Play Billing.
- Verify paid entitlements on a backend. Do not put store secrets, receipt-verification credentials, or LLM API keys in app bundles.
- Apps in Toss Console API key access uses `APPS_IN_TOSS_CONSOLE_API_KEY`. Treat it as server/agent/CI-only secret material: do not store the real value in project files, do not print it, and do not expose it through browser/app public env variables such as `VITE_`, `NEXT_PUBLIC_`, or `PUBLIC_`.
- Keep a project platform note in `/Users/kangsungbae/Documents/지식저장소/projects/<project-name>/platform.md` when the project becomes an app.

## Implementation Knowledge Graph Workflow

When implementing, modifying, debugging, or refactoring code in this project:

- Before broad source reading or code edits, consult the project knowledge graphs when they exist. Use Understand-Anything for architecture, components, data flow, onboarding, and diff-risk context. Use Graphify for cross-file, cross-document, decision, and relationship discovery. Fall back to direct file reads for exact code and trivial single-file edits.
- After meaningful code implementation, bug fixes, refactors, or architecture-affecting changes, refresh the project knowledge graphs before declaring the work complete unless the user explicitly asks to skip. Refresh Graphify with `graphify update . --no-cluster` as the routine structural fallback. Refresh Understand-Anything with the appropriate installed `understand*` skill for meaningful code or architecture changes.
- If either refresh cannot run or would be disproportionate for a tiny change, record the reason in the session log or final summary.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Follow `/Users/kangsungbae/Documents/지식저장소/docs/workflows/graph-refresh-policy.md` for graph refresh timing.
- Refresh project Graphify after new project setup, verified feature completion, finalized important project docs, durable decisions, or handoffs that depend on recent files.
- Do not refresh project Graphify for ordinary conversation, tiny copy edits, or short unsaved opinions.
- Use `graphify update . --no-cluster` as the routine structural fallback when a refresh is worthwhile.
