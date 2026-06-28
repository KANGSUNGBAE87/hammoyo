---
version: 15
status: final-nav-response-inbox-implemented
updated: 2026-06-28
canonical: true
---

# 함모여 구현 준비 보정 기획

## 목적

이 문서는 조건부 P4 패키지에서 비어 있던 Supabase, 권한, 응답 정책, AI/copy 경계를 닫고 앱 흐름 구현 기준을 유지하기 위한 구현 기획입니다.

현재 기준은 `final-nav-response-inbox-implemented`입니다. 앱 화면에는 keepthis 참고형 하단 5탭, 중앙 `모임 만들기` 탭, iPhone형 월간 캘린더 날짜 선택, Android 알람형 3열 시간 wheel, 후보 추가/삭제, OS/브라우저 공유 화면 우선 공유, 초대 홈 진입, 응답함 우선 진입, 내가 만든 모임 상태판, 브라우저 기반 host room 목록과 모임 수정/삭제 흐름을 추가했습니다. 상단 중복 홈/설정 버튼과 홈/내 모임 중복 CTA는 제거했고, 작성 중 이동/브라우저 뒤로가기/삭제 확인은 앱 내부 커스텀 모달로 통일했습니다. platform adapter contract, `hammoyo_` Supabase migration, release readiness 문서, `SupabaseBackendAdapter`, 실제 Supabase DB write/read를 수행하는 Edge Function, server-only DeepSeek V4 Pro AI provider proxy, AI copy/coordination policy 검증도 연결되어 있습니다. shared Supabase 한 프로젝트에 여러 앱이 붙는 전제를 반영해 app table/helper/policy prefix는 `hammoyo_`로 고정합니다. 2026-06-28 기준으로 `lookup-room`, `delete-room`, anonymous participant key 기반 `join-room`/`submit-response`, candidate-slot ownership validation, DB trigger hardening, expanded remote smoke path가 구현됐고, 신규 migration과 Edge Function도 원격 shared Supabase에 적용/배포됐습니다. `npm run smoke:remote`는 host 생성, lookup, 익명 join, 익명 응답 수정, signed session plus anonymous key 응답 재사용, candidate ownership rejection, recompute, delete-room, 삭제 후 lookup/write 차단, 삭제 요청 후 세션 차단까지 통과했습니다.

2026-06-28 추가 기준: 사용자-facing 날짜/시간 입력은 브라우저 native picker를 쓰지 않습니다. 후보 날짜는 `IPhoneCalendarPicker` 월간 sheet, 시간은 `ReleaseTimeWheel` 3열 wheel로 선택합니다. 응답 탭과 공유 링크 CTA는 모두 받은 초대 목록을 먼저 보여준 뒤 상세 응답으로 들어갑니다. 프로젝트 문서와 검증 스크립트는 작은 검증 프레임을 버리고 `최종출시제품`/`release` 기준으로 유지합니다.

2026-06-27부터 다음 구현은 `HAMMOYEO_FINAL_DELIVERY` 기준으로 재정렬합니다. 현재 배포본은 final delivery의 베이스로 충분하지만, 그대로 final/store-ready는 아닙니다. 핵심 불일치는 참여자 익명 응답 모델, `어려워요` 제약 처리, 최소 응답 기준, 서버 invite/status lookup, `negotiating`/`ready_to_confirm` 상태입니다.

## 2026-06-27 재정렬 결정

- `docs/final-delivery/product-plan.md`, `implementation-plan.md`, `design-plan.md`, `image-asset-plan.md`, `tokens.json`을 다음 구현의 우선 기준으로 둡니다.
- 원본 `HAMMOYEO_FINAL_DELIVERY/` 폴더는 local archive로 유지하고 git/Graphify에서 제외합니다. 구현 기준 subset은 `docs/final-delivery/`, `docs/assets/final/`, `docs/release/assets/final/`로 승격했습니다.
- 이전 `HAMMOYEO_DESIGN_PACKAGE` 기준 구현은 history/reference입니다.
- 다음 코딩 순서는 UI asset 적용보다 recommendation/auth/link-state 계약 정렬을 우선합니다. UI만 먼저 바꾸면 final delivery의 핵심인 합의 엔진이 맞지 않습니다.

## P0/P1/P2 실행 순서

### P0: Final delivery 계약 정렬

1. 완료: 제품 홈을 final delivery sample 기준으로 정리하고 debug/토큰/화면 점검 UI는 `?debug=1` 전용으로 유지합니다.
2. 완료: `docs/assets/final`과 `docs/release/assets/final`의 hero/state/icon/background/character assets를 실제 화면에 연결합니다.
3. 완료: `hardNo`를 점수에서 제거하고 후보 자격 조건으로 분리합니다.
4. 완료: 최소 응답 기준을 `max(3, ceil(expected_count * 0.6))`로 프론트/백엔드/검증기에서 통일합니다.
5. 원격 적용 완료: 공유 링크의 정식 서버 경로는 `invite_slug` + `lookup-room` status lookup으로 판단합니다. GitHub Pages preview는 서버 env가 없으므로 base64 snapshot fallback을 유지합니다.
6. 원격 적용 완료: `deleted`, `expired`, `closed` 상태를 Supabase canonical source로 판단하는 `lookup-room`/shared room helper/terminal write rejection을 구현했습니다.
7. 원격 적용 완료: 참여자는 로그인 없이 anonymous participant key로 join/respond/edit할 수 있고, 같은 key가 오면 signed session이 함께 있어도 같은 익명 응답 row를 재사용합니다. 방장은 Apps in Toss 로그인/session으로 관리하는 모델을 유지합니다.
8. 완료: `submit-response`에서 candidate slot이 같은 room에 속하고 active인지 함수와 DB trigger 양쪽에서 검증합니다.

### P1: 합의 엔진 고도화

1. `insufficient`, `evaluating`, `negotiating`, `ready_to_confirm`, `archived` 상태를 도입할지 확정하고 SQL/Edge Function/UI를 맞춥니다.
2. 비공개 조정 skeleton을 추가합니다. 유지 범위는 `hammoyo_negotiation_requests`와 방장/참여자 상태 화면 최소 UI입니다.
3. 결과 카드와 공유 문구를 final delivery sample 기준으로 재정리합니다.
4. room update/delete API와 host dashboard를 server-backed로 전환합니다.

### P2: 출시/검증 보강

1. Apps in Toss sandbox에서 `appLogin`, anonymous participant path, `intoss://` deep link, share, safe area, back/close behavior를 검증합니다.
2. 공개 privacy/contact/delete URL과 운영자 연락처를 확정합니다.
3. DeepSeek V4 Pro AI copy/coordination은 feature flag로 유지하고, AI가 실패해도 template fallback이 항상 동작하는지 smoke합니다.
4. 방장/총무/운영진 8~12명 live validation을 다시 진행합니다.

## 앱/플랫폼 경계

- Target: Apps in Toss 비게임 미니앱 우선.
- Login: Apps in Toss 로그인 우선. 클라이언트는 `appLogin()`으로 일회성 `authorizationCode`만 받고, 서버가 토큰 교환과 사용자 조회를 수행합니다.
- Backend: Supabase 기본. 앱/domain 로직은 `@supabase/supabase-js`를 직접 import하지 않습니다.
- Share: 초대/결과 공유는 Toss 내부 deep link를 `getTossShareLink()`로 변환하는 구조를 우선합니다.
- Google Play: 현재는 준비만 기록합니다. 별도 출시 지시 전까지 Google 로그인, Billing, AdMob은 구현하지 않습니다.
- Locale: 첫 Apps in Toss 화면은 한국어 단일 UI입니다. 사용자 화면에 언어 전환 버튼을 두지 않고, 추후 다국어가 필요하면 locale resource를 다시 활성화합니다.

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

현재 `docs/release/index.html`과 `docs/index.html`은 정적 HTML/CSS/JS 앱 화면으로 유지하되, localStorage 기반 방 생성/응답/추천/확정뿐 아니라 하단 5탭 navigation, custom calendar picker, time wheel picker, 후보 추가/삭제, 응답함 우선 진입, 초대 홈 진입, native share 우선 공유, 내가 만든 모임 상태판, 모임 수정/삭제, 커스텀 확인 모달까지 동작합니다. 원격 Supabase/DeepSeek 경계는 `src/platform/*`와 `supabase/functions/*`에 구현되어 있으며, Toss login/account 동기화 UI가 붙기 전 GitHub Pages 화면은 브라우저 저장을 우선 사용합니다. GitHub Pages의 삭제 후 링크 무효화는 같은 브라우저의 revoked room id 기준이며, 다른 기기까지 완전하게 막는 정식 동작은 Supabase invite lookup에서 `deleted/expired` 상태를 확인해야 합니다.

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
| `hammoyo_rooms` | 약속방 | `id`, `host_core_user_id`, `invite_slug`, `title`, `status`, `expected_count`, `expires_at`, `closed_at`, `deleted_at`, `response_round` |
| `hammoyo_room_members` | 방 참여 권한 | `room_id`, `core_user_id`, `anonymous_key_hash`, `role`, `display_alias`, `joined_at`, `deleted_at` |
| `hammoyo_candidate_slots` | 후보 일정 | `id`, `room_id`, `starts_at`, `ends_at`, `label`, `sort_order`, `active` |
| `hammoyo_responses` | 사용자 응답 묶음 | `id`, `room_id`, `core_user_id`, `anonymous_key_hash`, `response_round`, `status`, `updated_at` |
| `hammoyo_response_preferences` | 후보별 선호 | `response_id`, `candidate_slot_id`, `value` |
| `hammoyo_recommendation_runs` | 추천 계산 snapshot | `id`, `room_id`, `response_round`, `algorithm_version`, `result_json`, `confidence`, `created_at` |
| `hammoyo_negotiation_requests` | 비공개 조정 요청 | `id`, `room_id`, `candidate_slot_id`, `target_member_id`, `request_type`, `status`, `created_at`, `expires_at` |
| `hammoyo_room_events` | 안전한 이벤트 로그 | `id`, `room_id`, `core_user_id`, `event_name`, `payload_json`, `created_at` |
| `hammoyo_share_messages` | 공유 문구 snapshot | `id`, `room_id`, `recommendation_run_id`, `locale`, `generation_method`, `body`, `model`, `prompt_version`, `created_at` |
| `hammoyo_analytics_events` | 최소 검증 이벤트 | `id`, `core_user_id`, `room_id`, `event_name`, `payload_json`, `created_at` |

개인 자유 텍스트는 현재 앱 단계에서 받지 않습니다. 장소/활동/식사는 `category`, `area_hint`, `avoid_flags` 수준의 구조화 필드만 허용합니다.

## RLS와 API 경계

- 모든 table은 RLS를 켭니다.
- 클라이언트의 직접 table write는 현재 앱 단계에서 금지합니다.
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
| `lookup-room` | invite_slug + optional anonymous key | deleted/expired/closed 포함 서버 상태 확인 |
| `join-room` | anonymous participant or logged-in + invite_slug | room_member 생성 또는 조회 |
| `submit-response` | member or anonymous key | 응답 upsert, candidate ownership, 중복 방지, round 검증 |
| `recompute-recommendation` | host | 추천 snapshot 생성 |
| `update-room` | host | 후보/기간/예상 인원 수정, response_round 재시작 |
| `generate-share-copy` | host | template 또는 AI copy 생성 |
| `create-negotiation-request` | host | 개인 지목 없는 조정 요청 생성 |
| `submit-negotiation-answer` | target participant | 조정 응답 저장 |
| `close-room` | host | room close, 최종 snapshot 고정 |
| `delete-room` | host | soft delete 또는 hard delete queue |

## 응답/권한 정책

- Host 권한은 URL token이 아니라 `hammoyo_rooms.host_core_user_id`로 판단합니다. 하위 RLS 조회는 host 또는 member를 모두 허용하는 `hammoyo_can_read_room(room_id)` helper로 닫습니다.
- 초대 링크에는 `invite_slug`만 포함합니다. 이 값은 참여 진입을 위한 locator이지 admin 권한이 아닙니다.
- 한 사용자당 한 round에 하나의 active response만 허용합니다.
- 참여자는 room 상태가 `collecting`, `insufficient`, `recommended`, `negotiating`, `ready_to_confirm`이고 `expires_at` 이전이면 자기 응답을 수정할 수 있습니다.
- 방장이 후보 일정을 응답 이후 수정하면 기존 응답을 조용히 재매핑하지 않습니다. 새 `response_round`를 열고 이전 추천 snapshot은 invalid 처리합니다.
- `deleted`, `closed`, `expired` 상태에서는 응답 저장과 추천 재계산을 거절합니다.
- `closed` 이후에는 결과/공유 문구 조회만 허용합니다.
- `expired` 링크는 만료 안내만 보여주고 write를 허용하지 않습니다.
- `submit-response`는 모든 `candidate_slot_id`가 동일한 `room_id`에 속하고 `active = true`인지 서버에서 검증합니다.

## Room State Machine

```text
draft -> collecting -> insufficient -> evaluating -> recommended -> ready_to_confirm -> closed
                                      -> negotiating -> ready_to_confirm
collecting -> expired
insufficient -> expired
recommended -> expired
negotiating -> expired
closed -> archived
draft/collecting/insufficient/recommended/negotiating -> deleted
```

- `draft`: 방장 작성 중. 공유 전.
- `collecting`: 초대 링크 활성, 응답 가능.
- `insufficient`: 응답은 있으나 추천 최소 기준 미달.
- `evaluating`: 응답 기준으로 계산 중.
- `recommended`: 추천 snapshot 생성 가능.
- `negotiating`: 일부 조정 확인이 필요함. 개인 이름은 방장 공유 화면에 노출하지 않음.
- `ready_to_confirm`: 방장이 확정할 수 있음.
- `closed`: 방장이 최종 확정. 재계산 금지.
- `expired`: 만료. 응답/재계산 금지.
- `archived`: 보관/삭제 대기.
- `deleted`: 방장 삭제. 초대 링크 write/read를 막고 만료/삭제 안내로 분기.

## 추천 로직 v2

Preference value:

| 입력 | 점수 |
| --- | ---: |
| 선호 | `+3` |
| 가능 | `+2` |
| 조정 가능 | `+1` |
| 어려워요 | eligibility flag |

Minimum response threshold:

```text
minimum_responses = max(3, ceil(expected_count * 0.6))
```

- `expected_count`가 없으면 기본 4명으로 계산합니다.
- 응답 수가 threshold 미만이면 추천과 AI copy를 만들지 않고 `low_confidence`를 보여줍니다.
- 단, 내부 host preview는 응답 2명 이상에서만 가능하며 공유 문구는 생성하지 않습니다.

Eligibility:

```text
all_attendance mode: exclude candidate if hard_no_count > 0
max_attendance mode: candidate eligible if available_count >= minimum_attendance
fast mode: eligible candidates are sorted by earliest starts_at after minimum_attendance
```

Tie breaker:

1. exclude되지 않은 후보 우선
2. 전원 참석 가능 후보 우선
3. total score 높은 후보. 이 score에는 `어려워요`를 더하지 않음
4. `선호` 수 높은 후보
5. `선호 + 가능` 수 높은 후보
6. `조정 가능해요` 수가 적은 후보
7. 더 빠른 날짜
8. 방장이 입력한 후보 순서

Confidence:

- `high`: 응답률 80% 이상, hard no 0명, 1위와 2위 score gap 충분.
- `medium`: 응답률 60% 이상, 추천 가능하지만 일부 caveat 있음.
- `low`: 기준은 넘었지만 동점/근소차/조정 필요.
- `none`: threshold 미달 또는 모든 후보 제외.

## AI / Copy 경계

AI/copy 경로는 hybrid 방식입니다.

- 추천 후보 ranking은 deterministic algorithm이 먼저 계산합니다.
- 기본 공유 문구는 template으로 항상 생성합니다.
- AI 일정 조율은 `recompute-recommendation` backend function 안에서만 집계 응답 matrix와 deterministic 후보를 받아 조율 설명/근거를 정리합니다.
- AI copy는 `generate-share-copy` backend function 안에서만 template 문구를 부드럽게 다듬는 선택 기능입니다.
- 기본값은 local/dev 문서 기준 `AI_COPY_ENABLED=false`, `AI_COORDINATION_ENABLED=false`입니다. 원격 runtime에서는 DeepSeek 연결 검증을 위해 server-only secret으로 켤 수 있습니다.
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

1. final delivery home/asset 기준을 `docs/index.html`과 `docs/release/index.html`에 반영합니다.
2. recommendation v2를 pure function으로 먼저 고정하고, `docs/*`와 `supabase/functions/_shared/hammoyo/recommendation.ts`를 같은 계약으로 맞춥니다.
3. 완료: Supabase migration을 추가해 `deleted_at`, anonymous participant fields, final room status, candidate ownership constraints를 보강했습니다. `negotiation/event` tables는 P1 scope로 남깁니다.
4. 부분 완료: `lookup-room`, `delete-room`, anonymous `join-room`, candidate ownership `submit-response`를 구현했습니다. `update-room`은 P1 host dashboard server-backed 전환에 포함합니다.
5. 로컬 서버 코드 완료: 공유 링크를 `invite_slug` 중심으로 처리할 수 있는 `lookup-room`을 구현했고, deleted/expired/closed 상태를 서버 기준으로 검증합니다. 정적 GitHub Pages preview는 fallback snapshot을 유지합니다.
6. `negotiating`/`ready_to_confirm` UI와 Edge Function skeleton을 붙이거나, 이번 release scope에서 제외한다는 결정을 문서화합니다.
7. Apps in Toss sandbox/test app에서 login, anonymous participant path, deep link, safe area, share link를 검증합니다.

## 테스트 계획

- Unit/static: recommendation v2 weight, threshold 60%, hard-no eligibility, mode별 후보 제외, tie-breaker, confidence.
- Unit/static: room state transition과 closed/expired write rejection.
- Unit: i18n key coverage for ko/en.
- Integration: duplicate response upsert, anonymous response edit, candidate-slot room ownership, new response_round.
- Integration: Edge Function auth mapping and host/member permission.
- Integration: AI off/template fallback and AI failure fallback.
- Browser/UI: 360px, 390px, 430px, desktop QA 화면에서 text overflow 없음.
- Apps in Toss: appLogin, anonymous participant path, Toss share link, intoss deep link, safe area, back/close behavior.

## Open Items

- 실제 Apps in Toss app id/deep link prefix.
- Toss 로그인 server API credential/mTLS 처리 위치.
- 익명 참여자 key 발급/저장 방식.
- `negotiating`을 P1에서 실제 구현할지, P0 release에서는 skeleton만 둘지.
- DeepSeek V4 Pro 월 예산과 live 호출량 한도.
- 방장/참여자 live validation 모집 경로.

## Change Log

- 2026-06-24: Supabase, 권한, 응답, AI/copy 경계를 보정해 최초 작성.
- 2026-06-24: `docs/release/index.html`에 localStorage 기반 방 생성, 참여자 응답, deterministic 추천, 공유 문구 복사, 약속 확정 흐름을 구현하고 상태를 `static-functional-release-implemented`로 갱신.
- 2026-06-24: platform adapter contract, Apps in Toss auth/share skeleton, preview adapters, Supabase `hammoyo_` migration, release readiness 문서, contact/delete placeholder, `verify:platform` 검증을 추가하고 상태를 `platform-connection-scaffold-implemented`로 갱신.
- 2026-06-25: `SupabaseBackendAdapter`, `supabase/functions/*` runtime connection code, AI provider proxy, AI copy policy, `verify:backend-ai` 검증을 추가하고 상태를 `backend-ai-runtime-connection-code-implemented`로 갱신.
- 2026-06-25: server-only AI provider proxy의 기본 provider/model을 `deepseek` / `deepseek-v4-pro`로 고정하고 `verify:backend-ai`가 deprecated `deepseek-chat` fallback을 거부하도록 갱신.
- 2026-06-25: shared Supabase multi-app 전제를 반영해 app table/helper/policy prefix를 `hm_`에서 `hammoyo_`로 교체하고 검증기가 `hm_` 재도입을 실패 처리하도록 갱신.
- 2026-06-25: 원격 shared Supabase에 `hammoyo_` schema/grants를 적용하고, Edge Functions를 `verify_jwt=false` + Hammoyo signed session 경계로 배포. CORS/OPTIONS, 삭제 후 세션 차단, submit-response membership requirement, deterministic top 고정 AI coordination, DeepSeek JSON/non-thinking mode를 보강. `npm run build`, `npm run smoke:remote`, live AI coordination smoke(`method=ai`, audit row 1) 통과.
- 2026-06-26: 사용자 화면을 앱 흐름 기준으로 갱신하고, 날짜/시간 picker, 후보 추가/삭제, 일반 공유 링크, 내가 만든 모임 상태판, 로컬 host room 목록을 구현. 일반 링크는 공개 후보 snapshot으로 참여 화면을 열며, 원격 상태 동기화는 Toss login/account flow 이후 BackendAdapter 경로로 전환한다.
- 2026-06-26: 홈 메인 동물 캐릭터 이미지와 개별 캐릭터 asset을 추가하고, 언어 전환/앱 준비 pill을 사용자 화면에서 제거. 날짜/시간 선택은 iPhone식 dropdown shell로 보강하고, 후보 카드 grid overflow를 막도록 입력 wrapper와 grid width 기준을 수정했다.
- 2026-06-26: 동물 배경 이미지와 3D 버튼/카드 depth를 추가. 공유는 `navigator.share` 우선, clipboard fallback으로 변경. 초대 링크는 홈 초대 카드로 진입하고, 내가 만든 모임에서 삭제하면 같은 브라우저의 기존 링크를 revoked 처리한다.
- 2026-06-27: `HAMMOYEO_FINAL_DELIVERY`를 다음 구현 기준으로 채택하고, P0/P1/P2 실행 순서, recommendation v2, server invite/status lookup, anonymous participant, negotiation scope를 중심으로 구현 순서를 재정렬했다.
- 2026-06-27: 원본 `HAMMOYEO_FINAL_DELIVERY/`는 local archive로 유지하고, canonical docs/tokens/reference/runtime asset subset을 `docs/final-delivery/`, `docs/assets/final/`, `docs/release/assets/final/`로 선별 편입했다.
- 2026-06-28: `lookup-room`, `delete-room`, anonymous participant key 기반 `join-room`/`submit-response`, candidate-slot ownership validation, `deleted` canonical status, DB trigger hardening, expanded remote smoke contract를 구현했다. 신규 migration과 Edge Function을 원격 shared Supabase에 적용/배포했고, `npm run build`와 `npm run smoke:remote`가 통과했다. Apps in Toss sandbox smoke와 P1 `negotiating`/`ready_to_confirm` 범위 결정은 남긴다.
- 2026-06-28: 브라우저 native date/time picker를 release chip/slot UI로 교체하고, 옛 docs 경로를 `docs/release`로 승격했다. `verify:release`/`npm run build`가 날짜/시간 native picker, legacy storage key, 작은 검증 표현 재도입을 차단한다.
- 2026-06-28: 상단 중복 홈/설정 버튼, 홈 중복 CTA, 내 모임 중복 CTA를 제거했다. 응답 탭과 공유 링크 CTA는 받은 초대 리스트를 먼저 거치며, `response` query route로 inbox/detail back-stack을 분리했다. 기본 브라우저 confirm을 제거하고 `ConfirmDialog`로 작성 중 이동/삭제/뒤로가기를 처리하며, 하단 탭 중복 click handler 회귀를 기능 검증에 반영했다.
