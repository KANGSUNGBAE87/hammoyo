# 2026-06-24 Platform Scaffold Implementation

Actor: codex

## User Request

서브에이전트를 활용해서 남은 실서비스 연결 쪽 구현을 시작해 달라는 요청.

## Stage

Implementation. 범위는 실제 외부 적용이 아니라 Apps in Toss / Supabase / Google Play readiness scaffold입니다.

## Subagents

- `planner`: 정적 최종출시제품에서 실서비스 연결을 시작하기 위한 P0/P1/P2 범위와 금지 범위를 정리.
- `toss-compliance-auditor`: Apps in Toss, Google Play, Supabase/RLS 기준의 blocker와 구현 제약 확인.

외부 Claude/Antigravity 라우터는 현재 Codex native subagent 도구에서 직접 호출하지 못해 native subagent degraded mode로 진행했습니다.

## Files Changed

- `package.json`
  - `verify:platform` 추가.
  - `build`에 platform readiness 검증 포함.
- `scripts/verify-platform-readiness.mjs`
  - platform adapter, Supabase migration, env boundary, release readiness, contact/delete placeholder, intoss share contract 검증.
- `src/platform/contracts.mjs`
  - platform capability와 공통 error/result contract.
- `src/platform/preview-adapters.mjs`
  - local preview backend/share/auth adapter.
- `src/platform/toss-adapters.mjs`
  - `appLogin()` authorizationCode -> backend exchange 경계.
  - `intoss://...` -> `getTossShareLink()` 경계.
- `supabase/migrations/20260624_hammoyo_backend.sql`
  - `core_users`, `authmap_user_identities`, `hm_*` tables, RLS, membership select policy.
- `docs/release/platform-readiness.md`
  - 원격 Supabase 적용 금지, Apps in Toss share/auth, Google Play privacy/delete blocker 정리.
- `docs/release/contact.html`, `docs/release/delete-data.html`
  - 제출 전 public contact/delete placeholder pages.
- `.env.example`
  - public URL/contact/delete placeholder, `AI_COPY_ENABLED=false`, `APPS_IN_TOSS_CONSOLE_API_KEY=`.
- `ai/plans/implementation-plan.md`, `ai/reviews/review.md`, `README.md`
  - platform scaffold state 반영.
- `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`
  - shared platform note를 `platform-connection-scaffold` 기준으로 갱신.

## Decisions Made

- Production app shell migration은 이번 턴에서 하지 않고, 정적 최종출시제품은 reference fixture로 유지.
- 실제 remote Supabase apply는 하지 않음.
- ShareAdapter live path는 일반 HTTPS URL이 아니라 공식 `intoss://...` deep link만 허용.
- raw Toss identifier는 저장하지 않고 `provider_subject_hash`만 사용.
- 클라이언트 직접 table write는 열지 않음.

## Verification Run

- `npm run verify:platform`
  - RED: platform contract/migration/release files missing.
  - GREEN: scaffold 추가 후 통과.
  - RED: Toss share target이 HTTPS 기준이라 `intoss://` 계약에서 실패.
  - GREEN: Toss share adapter를 `intoss://` 기준으로 수정 후 통과.
  - RED: contact/delete placeholder page missing.
  - GREEN: 페이지 추가 후 통과.
- `npm run build`
  - `HAMMOYEO 최종출시제품 design verification passed.`
  - `[기능 계약 검증기] 통과`
  - `[플랫폼 준비 검증기] 통과`

## Review Remediation

- Code review blocker: host가 자기 방 하위 데이터를 못 읽을 수 있는 RLS 불일치.
  - `hm_can_read_room(room_id)` helper를 추가하고 `hm_room_members`, `hm_candidate_slots`, `hm_responses`, `hm_response_preferences`, `hm_recommendation_runs`, `hm_share_messages` select policy가 host-or-member helper를 사용하게 수정했다.
- Code review blocker: canonical state machine의 `draft`가 SQL status check에 없음.
  - `hm_rooms.status` default/check에 `draft`를 추가했다.
- 문서 drift:
  - `rooms.host_user_id`를 `hm_rooms.host_core_user_id`로, `app_users.deleted_at`을 `core_users.deleted_at`으로 수정했다.
- Policy review should-fix:
  - `verify-platform-readiness.mjs`가 `docs/release/privacy.html`의 preview badge, English summary, data deletion URL caveat, contact/delete links를 직접 확인하게 했다.
- Verification after remediation:
  - `npm run verify:platform` 통과.
  - `npm run build` 통과.

## Remaining Risks

- Toss token exchange runtime(mTLS/secure worker vs Supabase Edge Function)은 공식 문서 기준 재확인이 필요.
- 실제 Apps in Toss `intoss://<app-name>/...` prefix와 테스트 scheme은 미정.
- public privacy/contact/delete URL은 placeholder 상태.
- Supabase SQL은 원격 DB에 적용하지 않음.

## Knowledge Promotion

- Project-local session log 작성 완료.
- Shared platform note `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md` 갱신 완료.
