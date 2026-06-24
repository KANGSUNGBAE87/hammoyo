---
version: 7
status: backend-ai-live-connected
updated: 2026-06-25
canonical: true
---

# 함모여 구현 준비 보정 기획

## 목적

이 문서는 조건부 P4 패키지에서 비어 있던 Supabase, 권한, 응답 정책, AI/copy 경계를 닫기 위한 구현 전 보정 기획입니다. 아직 production 구현 문서가 아니라, 구현자가 같은 해석으로 MVP를 시작하도록 만드는 기준입니다.

현재 기준은 `backend-ai-live-connected`입니다. 정적 기능 MVP 위에 platform adapter contract, `hammoyo_` Supabase migration, release readiness 문서, contact/delete placeholder, platform 검증 스크립트를 추가했고, 이어서 `SupabaseBackendAdapter`, 실제 Supabase DB write/read를 수행하는 Edge Function, server-only DeepSeek V4 Pro AI provider proxy, AI copy/coordination policy 검증을 붙였습니다. shared Supabase 한 프로젝트에 여러 앱이 붙는 전제를 반영해 app table/helper/policy prefix는 `hammoyo_`로 고정합니다. 원격 shared Supabase DB에는 `hammoyo_` tables와 service role grants가 적용됐고, 8개 Edge Function은 `verify_jwt=false` + Hammoyo signed session 검증 경계로 배포됐습니다. remote smoke는 create-room, submit-response, recompute, deletion-revokes-session, DeepSeek AI coordination audit까지 통과했습니다. Toss secure worker/mTLS 실제 경로, Apps in Toss sandbox evidence, 공개 privacy/contact/delete URL은 아직 release blocker입니다.

## 앱/플랫폼 경계

- Target: Apps in Toss 비게임 미니앱 우선.
- Login: Apps in Toss 로그인 우선. 클라이언트는 `appLogin()`으로 일회성 `authorizationCode`만 받고, 서버가 토큰 교환과 사용자 조회를 수행합니다.
- Backend: Supabase 기본. 앱/domain 로직은 `@supabase/supabase-js`를 직접 import하지 않습니다.
- Share: 초대/결과 공유는 Toss 내부 deep link를 `getTossShareLink()`로 변환하는 구조를 우선합니다.
- Google Play: 현재 MVP에서는 준비만 기록합니다. 별도 출시 지시 전까지 Google 로그인, Billing, AdMob은 구현하지 않습니다.
- i18n: 한국어 기본, 영어 선택 가능. UI copy, 오류, 공유 문구, AI prompt는 locale resource를 통해 관리합니다.

## 어댑터 구조

```text
src/core/
  recommendation/
  room-state/
  copy-policy/
src/features/
  host-room/
  participant-response/
  result/
src/platform/
  AuthAdapter
  BackendAdapter
  ShareAdapter
  LocaleAdapter
  AnalyticsAdapter
src/platform/toss/
  tossAuthAdapter
  tossShareAdapter
backend/
  supabase/functions/
  supabase/migrations/
```

Production runtime 코드는 아직 없으므로 위 구조는 다음 구현자의 파일 배치 기준입니다. 현재 샘플 MVP는 `docs/mvp/index.html`에 정적 HTML/CSS/JS로 두며, localStorage 기반 방 생성/응답/추천/확정 흐름까지 동작합니다.

## Auth Mapping

1. 앱은 Apps in Toss SDK의 `appLogin()`을 호출합니다.
2. 앱은 받은 `authorizationCode`를 `POST /auth/toss/exchange`로 전송합니다.
3. Edge Function 또는 얇은 secure worker가 Toss 서버 API와 통신해 사용자 식별자를 확인합니다.
4. backend는 `core_users`를 만들거나 찾고, `authmap_user_identities.provider = apps_in_toss`, HMAC 처리된 값을 `provider_subject`에 저장해 외부 식별자를 연결합니다.
5. 앱은 raw authorization code, access token, refresh token을 저장하지 않습니다.

Supabase Edge Function만으로 Toss mTLS/인증서 요구를 처리하기 어려우면, token exchange는 Supabase 옆의 얇은 서버/worker로 분리하고 결과만 Supabase에 저장합니다.

## Supabase 데이터 모델 초안

| Table | 목적 | 주요 필드 |
| --- | --- | --- |
| `core_users` | 내부 사용자 기준 | `id`, `display_name`, `default_locale`, `created_at`, `updated_at`, `deleted_at` |
| `authmap_user_identities` | Toss/Google 등 외부 identity 매핑 | `id`, `user_id`, `provider`, `provider_subject`, `provider_metadata`, `linked_at`, `unlinked_at` |
| `hammoyo_rooms` | 약속방 | `id`, `host_core_user_id`, `invite_slug`, `title`, `status`, `expected_count`, `expires_at`, `closed_at`, `response_round` |
| `hammoyo_room_members` | 방 참여 권한 | `room_id`, `core_user_id`, `role`, `display_alias`, `joined_at`, `deleted_at` |
| `hammoyo_candidate_slots` | 후보 일정 | `id`, `room_id`, `starts_at`, `ends_at`, `label`, `sort_order`, `active` |
| `hammoyo_responses` | 사용자 응답 묶음 | `id`, `room_id`, `core_user_id`, `response_round`, `status`, `updated_at` |
| `hammoyo_response_preferences` | 후보별 선호 | `response_id`, `candidate_slot_id`, `value` |
| `hammoyo_recommendation_runs` | 추천 계산 snapshot | `id`, `room_id`, `response_round`, `algorithm_version`, `result_json`, `confidence`, `created_at` |
| `hammoyo_share_messages` | 공유 문구 snapshot | `id`, `room_id`, `recommendation_run_id`, `locale`, `generation_method`, `body`, `model`, `prompt_version`, `created_at` |
| `hammoyo_analytics_events` | 최소 검증 이벤트 | `id`, `core_user_id`, `room_id`, `event_name`, `payload_json`, `created_at` |

개인 자유 텍스트는 MVP에서 받지 않습니다. 장소/활동/식사는 `category`, `area_hint`, `avoid_flags` 수준의 구조화 필드만 허용합니다.

## RLS와 API 경계

- 모든 table은 RLS를 켭니다.
- 클라이언트의 직접 table write는 MVP에서 금지합니다.
- 앱은 `BackendAdapter`를 통해 Edge Function만 호출합니다.
- service role key는 Edge Function/server-only runtime에만 둡니다.
- public env에는 Supabase URL/anon key만 둘 수 있고, 그 경우에도 직접 table 권한은 닫아 둡니다.
- RLS는 방어층입니다. 실제 권한 검사는 Edge Function에서 `current_app_user_id`와 room membership을 기준으로 다시 수행합니다.
- 실제 SQL은 `supabase/migrations/20260624_hammoyo_backend.sql`에 있으며, 원격 shared Supabase에는 `hammoyo_` prefix로 적용합니다.

## Edge Function 초안

| Function | 권한 | 동작 |
| --- | --- | --- |
| `auth-toss-exchange` | anonymous + authorizationCode | Toss 로그인 교환, user mapping, app session 발급 |
| `create-room` | logged-in | 방장 방 생성, 후보 일정 생성 |
| `join-room` | logged-in + invite_slug | room_member 생성 또는 조회 |
| `submit-response` | member | 응답 upsert, 중복 방지, round 검증 |
| `recompute-recommendation` | host | 추천 snapshot 생성 |
| `generate-share-copy` | host | template 또는 AI copy 생성 |
| `close-room` | host | room close, 최종 snapshot 고정 |
| `delete-room` | host | soft delete 또는 hard delete queue |

## 응답/권한 정책

- Host 권한은 URL token이 아니라 `hammoyo_rooms.host_core_user_id`로 판단합니다. 하위 RLS 조회는 host 또는 member를 모두 허용하는 `hammoyo_can_read_room(room_id)` helper로 닫습니다.
- 초대 링크에는 `invite_slug`만 포함합니다. 이 값은 참여 진입을 위한 locator이지 admin 권한이 아닙니다.
- 한 사용자당 한 round에 하나의 active response만 허용합니다.
- 참여자는 room 상태가 `collecting`, `low_confidence`, `recommended`이고 `expires_at` 이전이면 자기 응답을 수정할 수 있습니다.
- 방장이 후보 일정을 응답 이후 수정하면 기존 응답을 조용히 재매핑하지 않습니다. 새 `response_round`를 열고 이전 추천 snapshot은 invalid 처리합니다.
- `closed` 또는 `expired` 상태에서는 응답 저장과 추천 재계산을 거절합니다.
- `closed` 이후에는 결과/공유 문구 조회만 허용합니다.
- `expired` 링크는 만료 안내만 보여주고 write를 허용하지 않습니다.

## Room State Machine

```text
draft -> collecting -> low_confidence -> recommended -> closed
                         |              |
                         +--------------+
collecting -> expired
low_confidence -> expired
recommended -> expired
closed -> reopened(optional, later)
```

- `draft`: 방장 작성 중. 공유 전.
- `collecting`: 초대 링크 활성, 응답 가능.
- `low_confidence`: 응답은 있으나 추천 최소 기준 미달.
- `recommended`: 추천 snapshot 생성 가능.
- `closed`: 방장이 최종 확정. 재계산 금지.
- `expired`: 만료. 응답/재계산 금지.

## 추천 로직 v1

Preference value:

| 입력 | 점수 |
| --- | ---: |
| 선호 | `+3` |
| 가능 | `+2` |
| 조정 가능 | `+1` |
| 강한 불가 | `-5` |

Minimum response threshold:

```text
minimum_responses = min(4, max(3, ceil(expected_count * 0.5)))
```

- `expected_count`가 없으면 기본 4명으로 계산합니다.
- 응답 수가 threshold 미만이면 추천과 AI copy를 만들지 않고 `low_confidence`를 보여줍니다.
- 단, 내부 host preview는 응답 2명 이상에서만 가능하며 공유 문구는 생성하지 않습니다.

Safety exclusion:

```text
exclude candidate if hard_no_count >= 2
exclude candidate if hard_no_ratio >= 0.34
```

Tie breaker:

1. exclude되지 않은 후보 우선
2. total score 높은 후보
3. hard_no_count 낮은 후보
4. `선호` 수 높은 후보
5. `선호 + 가능` 수 높은 후보
6. 방장이 입력한 후보 순서

Confidence:

- `high`: threshold 충족, hard no 0명, 1위와 2위 score gap 3 이상.
- `medium`: threshold 충족, 제외 후보 아님, score gap 1 이상.
- `low`: threshold 충족했지만 동점/근소차/일부 hard no 존재.
- `none`: threshold 미달 또는 모든 후보 제외.

## AI / Copy 경계

MVP는 hybrid 방식입니다.

- 추천 후보 ranking은 deterministic algorithm이 먼저 계산합니다.
- 기본 공유 문구는 template으로 항상 생성합니다.
- AI 일정 조율은 `recompute-recommendation` backend function 안에서만 집계 응답 matrix와 deterministic 후보를 받아 조율 설명/근거를 정리합니다.
- AI copy는 `generate-share-copy` backend function 안에서만 template 문구를 부드럽게 다듬는 선택 기능입니다.
- 기본값은 local/dev 문서 기준 `AI_COPY_ENABLED=false`, `AI_COORDINATION_ENABLED=false`입니다. 원격 MVP runtime에서는 DeepSeek 연결 검증을 위해 server-only secret으로 켤 수 있습니다.
- AI provider는 DeepSeek로 고정하며, copy/coordination/safety 기본 모델은 DeepSeek V4 Pro API 모델명 `deepseek-v4-pro`입니다.
- LLM에는 이름, 원문 자유 텍스트, raw user id, hard-no 사유를 보내지 않습니다.
- LLM input은 copy에서는 locale, confidence, top candidate label, aggregate counts, caveat code, tone만 허용하고, coordination에서는 후보별 집계값/점수/threshold/deterministic top candidate id만 허용합니다. coordination payload에는 사용자가 입력한 후보 label을 보내지 않습니다.
- DeepSeek V4 Pro 호출은 thinking mode를 끄고, coordination은 JSON output mode를 사용합니다.
- AI 결과를 사용자에게 보여주면 UI에 `AI가 다듬은 문구예요` 라벨을 붙입니다.
- AI 실패, timeout, safety reject, privacy mode에서는 template copy로 fallback합니다.

Environment placeholders:

```text
AI_COPY_ENABLED=false
AI_COORDINATION_ENABLED=false
AI_PROVIDER=deepseek
AI_MODEL_COPY=deepseek-v4-pro
AI_MODEL_COORDINATION=deepseek-v4-pro
AI_MODEL_SAFETY=deepseek-v4-pro
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
Supabase privileged server key: shared admin/server-only env only, never client/public env
APPS_IN_TOSS_CONSOLE_API_KEY=agent-or-ci-only
```

## 보관/삭제 정책

- 기본 방 만료: 생성 후 14일 또는 방장 설정 만료일 중 이른 값.
- close 후 조회 가능 기간: 7일.
- hard delete/anonymize queue: 만료 또는 close 후 30일.
- 사용자 삭제 요청 시 `core_users.deleted_at`을 기록하고 `hammoyo_room_members.display_alias`와 응답 식별자를 익명화합니다.
- recommendation snapshot은 디버깅을 위해 집계값만 30일 보관 후 삭제합니다.
- analytics payload에는 개인 이름, 자유 텍스트, 연락처, raw Toss id를 넣지 않습니다.

## 구현 순서

1. 현재 정적 기능 MVP를 기준으로 화면/상태/카피를 확정합니다. `docs/mvp/index.html`에서 localStorage mock adapter, deterministic recommendation, template share copy를 확인할 수 있습니다.
2. React/Vite 또는 Apps in Toss 권장 runtime을 선택합니다.
3. i18n resource, adapter interface, pure recommendation module을 먼저 만듭니다.
4. Supabase migration과 Edge Function skeleton을 만듭니다.
5. Toss Login exchange 경로를 server-only로 연결합니다.
6. room create, join, submit, recompute, share copy flow를 연결합니다.
7. template copy fallback을 먼저 완성한 뒤 AI copy feature flag를 붙입니다.
8. Apps in Toss sandbox/test app에서 login, deep link, safe area, share link를 검증합니다.

## 테스트 계획

- Unit/static: recommendation weight, threshold, exclusion, tie-breaker, confidence.
- Unit/static: room state transition과 closed/expired write rejection.
- Unit: i18n key coverage for ko/en.
- Integration: duplicate response upsert, response edit, new response_round.
- Integration: Edge Function auth mapping and host/member permission.
- Integration: AI off/template fallback and AI failure fallback.
- Browser/UI: 360px, 390px, 430px, desktop preview에서 text overflow 없음.
- Apps in Toss: appLogin, Toss share link, safe area, back/close behavior.

## Open Items

- 실제 Apps in Toss app id/deep link prefix.
- Toss 로그인 server API credential/mTLS 처리 위치.
- Supabase project id와 region.
- DeepSeek V4 Pro 월 예산과 live 호출량 한도.
- 방장/참여자 live validation 모집 경로.

## Change Log

- 2026-06-24: Supabase, 권한, 응답, AI/copy 경계를 보정해 최초 작성.
- 2026-06-24: `docs/mvp/index.html`에 localStorage 기반 방 생성, 참여자 응답, deterministic 추천, 공유 문구 복사, 약속 확정 흐름을 구현하고 상태를 `static-functional-mvp-implemented`로 갱신.
- 2026-06-24: platform adapter contract, Apps in Toss auth/share skeleton, preview adapters, Supabase `hammoyo_` migration, release readiness 문서, contact/delete placeholder, `verify:platform` 검증을 추가하고 상태를 `platform-connection-scaffold-implemented`로 갱신.
- 2026-06-25: `SupabaseBackendAdapter`, `supabase/functions/*` runtime connection code, AI provider proxy, AI copy policy, `verify:backend-ai` 검증을 추가하고 상태를 `backend-ai-runtime-connection-code-implemented`로 갱신.
- 2026-06-25: server-only AI provider proxy의 기본 provider/model을 `deepseek` / `deepseek-v4-pro`로 고정하고 `verify:backend-ai`가 deprecated `deepseek-chat` fallback을 거부하도록 갱신.
- 2026-06-25: shared Supabase multi-app 전제를 반영해 app table/helper/policy prefix를 `hm_`에서 `hammoyo_`로 교체하고 검증기가 `hm_` 재도입을 실패 처리하도록 갱신.
- 2026-06-25: 원격 shared Supabase에 `hammoyo_` schema/grants를 적용하고, Edge Functions를 `verify_jwt=false` + Hammoyo signed session 경계로 배포. CORS/OPTIONS, 삭제 후 세션 차단, submit-response membership requirement, deterministic top 고정 AI coordination, DeepSeek JSON/non-thinking mode를 보강. `npm run build`, `npm run smoke:remote`, live AI coordination smoke(`method=ai`, audit row 1) 통과.
