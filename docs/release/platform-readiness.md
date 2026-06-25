# 함모여 플랫폼 연결 준비

Updated: 2026-06-26
Status: `backend-ai-remote-smoke-plus-app-share-flow`

## 범위

함모여는 이제 디자인 샘플이 아니라 앱 흐름으로 다룹니다. `docs/mvp/index.html`과 `docs/index.html`은 날짜/시간 선택, 후보 추가/삭제, 일반 공유 링크, 내가 만든 모임 상태판을 제공하고, 원격 실서비스 연결은 아래 경계 파일과 검증 계약으로 관리합니다.

- `AuthAdapter`: Apps in Toss `appLogin()` 결과를 서버 교환으로 넘기는 경계
- `BackendAdapter`: Supabase/Edge Function/server API만 호출하는 경계
- `ShareAdapter`: 일반 HTTPS 공유 링크와 Apps in Toss `intoss://...` deep link share 생성을 분리하는 경계
- `supabase/migrations/20260624_hammoyo_backend.sql`: 원격 shared Supabase에 적용된 `hammoyo_` schema/RLS 기준
- `scripts/verify-platform-readiness.mjs`: 플랫폼 준비 계약 검증

## 원격 Supabase 적용 상태

2026-06-25 follow-up에서 성배님 지시 범위 안에서 shared Supabase 원격 적용과 Edge Function 배포가 진행됐습니다.

- 원격 DB에는 `hammoyo_` prefix table과 service role grants가 적용됐습니다.
- 8개 Hammoyo Edge Function은 `verify_jwt=false` + Hammoyo signed session 검증 경계로 배포됐습니다.
- `npm run smoke:remote`는 create-room, submit-response, recompute, deletion-revokes-session을 검증합니다.
- DeepSeek V4 Pro 일정 조율 smoke는 `hammoyo_ai_coordination_runs` audit row 생성 후 정리까지 검증했습니다.

계속 금지:

- `supabase db push`
- service-role key, DB password, JWT secret, mTLS secret 출력 또는 파일 저장
- browser/public env에 server secret 추가

## Apps in Toss 경계

- 앱 클라이언트는 `appLogin()`으로 authorization code만 받습니다.
- authorization code, Toss access token, refresh token은 localStorage에 저장하지 않습니다.
- 서버 또는 Supabase Edge Function/secure worker가 Toss 교환을 수행하고 `core_users`와 `authmap_user_identities`에 매핑합니다.
- `ShareAdapter`는 `getTossShareLink()` 같은 Apps in Toss share API를 주입받아 사용합니다. 제품 로직은 Toss SDK를 직접 import하지 않습니다.
- Apps in Toss share target은 일반 `https://` URL이 아니라 `intoss://<앱이름>/...` 내부 딥링크여야 합니다.
- 출시 전 테스트 스킴은 공식 테스트 scheme/deploymentId 기준으로 별도 검증해야 합니다.
- GitHub Pages 앱 화면은 일반 HTTPS 공유 링크를 만들고, Apps in Toss 빌드에서는 Toss share adapter가 `intoss://...` target을 SDK에 넘기는 구조를 유지합니다.

## Google Play 경계

Google Play 출시는 아직 요청되지 않았습니다. 현재 준비 범위는 공통 adapter와 privacy/data-safety 기반만 남깁니다.

- Google login, Billing, AdMob은 구현하지 않습니다.
- 추후 Google Play를 켜면 Credential Manager/AdMob/Billing은 별도 Google adapter에서만 연결합니다.
- Google Play Data safety 입력 전에는 공개 개인정보처리방침 URL, 공개 문의 이메일, 데이터 삭제 요청 URL을 확정해야 합니다.

## Supabase / BackendAdapter

기본 shared project는 `dr.kang-mini-project`이며 schema는 `public`, app prefix는 `hammoyo_`입니다.

Migration 기준:

- app table은 `hammoyo_` prefix만 사용합니다.
- shared identity는 `core_users`, `authmap_user_identities`를 사용합니다.
- raw Toss identifier는 저장하지 않고 HMAC 처리된 값을 `provider_subject`에 저장합니다.
- 모든 table은 RLS를 켭니다.
- `hammoyo_rooms.status`는 `draft`, `collecting`, `low_confidence`, `recommended`, `closed`, `expired`를 저장할 수 있어야 합니다.
- 방장과 참여자 읽기 권한은 `hammoyo_can_read_room(room_id)` host-or-member helper로 통일합니다.
- public-open 정책인 `using (true)` / `with check (true)`는 쓰지 않습니다.
- 클라이언트 직접 write는 GitHub Pages 앱 화면에서 열지 않고 Edge Function/server API를 통합니다.

BackendAdapter 후보 메서드:

- `exchangeTossAuth({ authorizationCode })`
- `createRoom(payload)`
- `joinRoom({ inviteSlug })`
- `submitResponse(payload)`
- `recomputeRecommendation({ roomId })`
- `generateShareCopy(payload)`
- `createShareLink(payload)`
- `closeRoom({ roomId })`
- `requestDataDeletion(payload)`

현재 repo에는 `SupabaseBackendAdapter`가 추가되어 있으며, 앱은 이 adapter를 통해
`exchange-toss-auth`, `create-room`, `join-room`, `submit-response`,
`recompute-recommendation`, `generate-share-copy`, `close-room`,
`request-data-deletion` Edge Function을 호출합니다. 각 Function은 Supabase admin
client, signed Hammoyo session token, `hammoyo_` tables, server-only DeepSeek V4 Pro
AI provider proxy를 사용하도록 구현되어 있습니다. admin client는 CLI가 직접 주입할 수
있는 server-only `HAMMOYEO_DB_ADMIN_KEY`를 우선 사용하고, Supabase 런타임 기본값인
`SUPABASE_SERVICE_ROLE_KEY`를 fallback으로 허용합니다. 현재 shared mini-project에서는
기존 PairTune Function secret인 `PAIRTUNE_SUPABASE_SECRET_KEY`도 같은 shared-project
server key fallback으로 허용합니다.

## AI copy / generate-share-copy

`recompute-recommendation`은 deterministic ranking을 먼저 계산한 뒤, 선택적으로
DeepSeek V4 Pro에 집계값만 전달해 일정 조율 설명과 fallback 선택 근거를 정리합니다.
AI가 제외 후보를 고르거나 존재하지 않는 후보를 만들면 deterministic fallback으로
되돌립니다. `generate-share-copy`는 확정된 추천/조율 결과를 바탕으로 공유 문구를
부드럽게 다듬는 선택 기능입니다.

- 기본값은 `AI_COPY_ENABLED=false`이며 template fallback을 반환합니다.
- 일정 조율 AI는 `AI_COORDINATION_ENABLED`가 `true`일 때만 호출합니다.
- AI copy payload는 `locale`, `tone`, `confidence`, `topCandidateLabel`,
  `topCandidateTime`, `aggregateCounts`, `caveatCode`만 허용합니다.
- AI coordination payload는 후보 id/label/time/점수/집계 count, threshold,
  confidence, deterministic top candidate id만 허용합니다.
- 이름, 별명, 원문 자유 텍스트, 외부 식별자, 로그인 token, hard-no 사유는 AI로
  보내지 않습니다.
- DeepSeek API 호출은 OpenAI ChatCompletions 호환 endpoint
  `https://api.deepseek.com/chat/completions`를 사용하며, 기본 모델은
  `deepseek-v4-pro`입니다. deprecated `deepseek-chat` fallback은 허용하지 않습니다.
- AI provider secret은 server-only env에서만 읽어야 하며 앱/public env로 노출하지
  않습니다.
- AI 실패, timeout, privacy reject, provider 미설정 시 template fallback으로
  돌아갑니다.

## 개인정보 / 제출 전 blocker

현재 `docs/mvp/privacy.html`은 브라우저 저장 앱 화면 정책입니다. 제출 전 아래 값을 확정해야 합니다.

- 공개 개인정보처리방침 URL
- 공개 문의 이메일
- 데이터 삭제 요청 URL
- 운영 주체명
- Apps in Toss sandbox/test evidence
- Google Play Data safety 입력값

이 값들은 `.env.example`의 public placeholder와 문서에는 이름만 둡니다. 실제 운영값은 배포 설정 또는 공개 페이지에서 관리합니다.

## 검증

```bash
npm run verify:platform
npm run build
```

검증기는 다음을 확인합니다.

- adapter contract 파일 존재
- preview adapter가 real share/backend success를 주장하지 않음
- Apps in Toss adapter가 injected SDK/backend function만 사용
- Supabase migration의 `hammoyo_` prefix, RLS, authmap, forbidden policy/token 부재
- `.env.example`의 public/server env boundary
- privacy/contact/delete release blocker 문서화
