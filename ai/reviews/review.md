---
version: 13
status: release-picker-redesign-verified
updated: 2026-06-28
canonical: true
---

# 함모여 P4 패키지 리뷰

## 결론

공식 P4 패키지는 조건부 산출물로는 구조가 갖춰져 있지만, 원본만 기준으로 구현에 바로 넘기기에는 부족했습니다. 2026-06-24 보정으로 구현 전 필수 정책과 디자인 샘플은 현재 프로젝트 문서에 추가되었습니다.

- 최신 판정: `FINAL_DELIVERY_REORDER_READY`
- 최신 구현 상태: `APP_FLOW_BASE_BUILT_BUT_FINAL_DELIVERY_P0_PENDING`
- 원 리뷰 판정: `BLOCK_FOR_IMPLEMENTATION`
- 패키지 품질: `CONDITIONAL_P4_PACKAGE_OK`
- 추가 기획 필요 여부: 2026-06-24 보정 완료. P2/P3/P4 재논의는 필요하지 않습니다.
- 디자인 판정: 방향은 유지하고, 화면 ID/상태/AI 라벨/출시 화면을 보강했습니다.
- 기능 판정: 정적 HTML 최종출시제품 안에서 방 생성, 응답 저장, deterministic 추천, 공유 문구 복사, 확정 흐름이 동작합니다.
- 배포 전 보완 판정: 모바일 홈/개인정보/삭제 경로, 복사 CTA 정합성, template-only AI 고지, expired/closed 상태 가드, demo storage 격리, ko/en 결과/copy payload 전환, preview-only 초대 문구, bilingual privacy summary, 320/390 CTA 가시성을 보강했습니다.

## 2026-06-27 Final Delivery 재정렬 리뷰

검토 대상:

- `HAMMOYEO_FINAL_DELIVERY/README.md`
- `HAMMOYEO_FINAL_DELIVERY/docs/01_FINAL_PRODUCT_PLAN.md`
- `HAMMOYEO_FINAL_DELIVERY/docs/02_FINAL_IMPLEMENTATION_PLAN.md`
- `HAMMOYEO_FINAL_DELIVERY/docs/03_FINAL_DESIGN_PLAN.md`
- `HAMMOYEO_FINAL_DELIVERY/docs/04_FINAL_IMAGE_ASSET_PLAN.md`
- `HAMMOYEO_FINAL_DELIVERY/tokens/hammoyo_design_tokens_final_v12.json`
- 현재 `docs/index.html`, `docs/release/index.html`, `supabase/functions/*`, `supabase/migrations/20260624_hammoyo_backend.sql`

사용한 검토 축:

- Antigravity/Gemini 3.1 Pro High: UX/platform/design feasibility.
- Codex native `reviewer`: correctness, auth, recommendation, data-boundary feasibility.
- Claude Opus route: `auth status`는 정상이었으나 non-interactive execution에서 `401 Invalid authentication credentials`가 발생해 이번 결론에는 반영하지 않음.

최종 판단:

- `HAMMOYEO_FINAL_DELIVERY` 지시대로 구현은 가능하다.
- 그러나 현재 배포본에 asset만 바꾸면 완료되는 상태는 아니다.
- final/store-ready로 부르려면 P0에서 auth, recommendation, server link status, state machine 계약을 먼저 맞춰야 한다.

Findings:

1. 기본 debug/토큰/화면 점검 패널은 이미 `?debug=1`로 격리되는 구조가 있다. 이 방향은 final delivery와 맞다.
2. final delivery는 `어려워요`를 점수가 아닌 eligibility constraint로 요구하지만, 현재 프론트와 백엔드는 `hardNo = -5`를 score에 포함한다.
3. final delivery는 최소 응답 기준을 `max(3, ceil(expected_count * 0.6))`로 요구하지만, 현재 구현은 `min(4, max(3, ceil(expected_count * 0.5)))`다.
4. final delivery는 deleted/expired/closed 링크를 서버 상태로 검증하라고 요구하지만, 현재 GitHub Pages 공유는 base64 snapshot과 localStorage revoked room id에 의존한다.
5. final delivery는 참여자 로그인 없는 응답을 요구하지만, 현재 `join-room`과 `submit-response`는 Hammoyo signed session을 요구한다.
6. final delivery의 `negotiating`, `ready_to_confirm`, negotiation request 모델이 현재 DB/Edge Function/UI에 없다.
7. `submit-response`는 candidate slot이 같은 room에 속하는지 서버에서 검증해야 한다.
8. final delivery split assets는 구현 가능한 상태지만, 현재 배포본은 그 asset 체계를 아직 본격 적용하지 않았다.

Reordered next steps:

1. `docs/final-delivery/`, `docs/assets/final/`, `docs/release/assets/final/`에 승격한 source/asset을 다음 구현 기준으로 사용한다.
2. final delivery home/asset 기준을 적용하되, 동시에 recommendation/auth/link-state 계약을 손본다.
3. recommendation v2를 프론트/백엔드/검증기에서 통일한다.
4. Supabase migration/Edge Function을 server invite status lookup, deleted state, anonymous participant, candidate ownership 기준으로 확장한다.
5. `negotiating`/`ready_to_confirm`은 실제 구현 또는 explicit scope cut 중 하나를 결정한다.
6. Apps in Toss sandbox와 privacy/contact/delete 공개 URL을 닫는다.

### 2026-06-28 P0 서버 하드닝 업데이트

아래 항목은 로컬 코드 기준으로 구현되었습니다.

- `hardNo` eligibility constraint와 60% 최소 응답 기준.
- `lookup-room` Edge Function을 통한 invite_slug 기반 canonical status lookup.
- `deleted` room status, `deleted_at`, `deleted_by_core_user_id`, soft-delete `delete-room`.
- anonymous participant key 생성/해시 저장/재진입/응답 수정 경로. signed session이 함께 와도 요청에 anonymous participant key가 있으면 같은 익명 응답 row를 재사용합니다.
- `submit-response`의 candidate slot room ownership 및 active slot 검증.
- DB trigger `hammoyo_validate_response_preference_room`으로 함수 밖 write에도 후보 소유권 방어.
- `smoke-remote-functions.mjs`의 host/anonymous participant 분리 경로와 delete 후 lookup/write 차단 경로.

원격 적용/검증:

- 신규 migration은 원격 shared Supabase에 적용했습니다.
- `lookup-room`, `delete-room`, `join-room`, `submit-response`, `close-room`, `recompute-recommendation` Edge Function을 재배포했습니다.
- `npm run smoke:remote` 통과: host 생성, lookup, 익명 join, 익명 응답 수정, signed anonymous reuse, candidate ownership rejection, recompute, delete-room, 삭제 후 lookup/write 차단, 삭제 요청 후 세션 차단.

남은 release-gate 항목:

- Apps in Toss sandbox에서 Toss login, anonymous participant path, intoss deep link, native share, safe-area/back behavior 검증.
- `negotiating`/`ready_to_confirm`은 P1 구현 또는 명시적 scope cut 결정.

검토 대상:

- `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`

## 사용한 서브에이전트

- `planner`: 구현 handoff readiness와 추가 기획 필요성 검토.
- `market-ux-researcher`: UX, 디자인 샘플, 포지셔닝, 카피 검토.
- `toss-compliance-auditor`: Apps in Toss, Supabase, privacy, i18n, AI 고지/플랫폼 경계 검토.
- `reviewer`: acceptance criteria, 추천 로직, 데이터/AI/backend 경계, 테스트 가능성 검토.

## 좋은 점

- 패키지 상태가 솔직합니다. `EVIDENCE_UNVALIDATED`, `IMPLEMENTATION_CONDITIONAL`, `OWNER_UNREVIEWED`를 숨기지 않았습니다.
- 제품 포지셔닝은 좁고 일관됩니다. generic scheduling이 아니라 no-unanimous/conflict 상황의 fallback 추천과 관계 안전 문구로 좁힌 점은 좋습니다.
- 산출물 세트는 형식적으로 갖춰져 있습니다. 제품기획, 디자인기획, 샘플, acceptance criteria, traceability, verifier report가 존재합니다.
- 사회적 안전성 원칙이 반복적으로 반영되어 있습니다. 특정 참여자 탓으로 보이지 않게 하려는 방향은 맞습니다.

## Must Fix

1. 추천 로직과 상태 전이가 비결정적입니다.
   - `hard_no` 가중치가 `-5`와 `-4`로 다르게 정의되어 있습니다.
   - 추천 가능 최소 응답 수가 `응답 2명 이상`, `threshold`, `최소 4명`으로 엇갈립니다.
   - `low_confidence`, `all-hard-no`, `insufficient responses`, `recommended`의 경계가 수치로 고정되어 있지 않습니다.

2. 데이터/권한/백엔드 계약이 부족합니다.
   - `host token`, `anonymous participant label or nickname`, `duplicate response edit path`가 언급되지만 정책이 없습니다.
   - 한 사람 1응답인지, 수정 허용인지, 만료 링크의 읽기/쓰기 범위, closed 이후 재계산 가능 여부가 미정입니다.
   - Supabase table/RLS/Edge Function/auth mapping/retention/deletion 설계가 없습니다.

3. AI와 copy 생성 경계가 비어 있습니다.
   - 공유 문구가 템플릿인지, LLM 생성인지, 둘의 혼합인지 정해져 있지 않습니다.
   - LLM을 쓰면 어떤 데이터가 외부 모델로 나가는지, 실패 fallback, 고지/라벨, 테스트 방식이 필요합니다.

4. 최종출시제품 범위가 새고 있습니다.
   - 장소/활동/식사 optional constraint가 제품, 디자인, handoff에 나오지만 실제 역할이 없습니다.
   - 추천 점수에 반영하는지, 필터인지, copy context인지, 단순 메모인지 결정해야 합니다.

5. 디자인 샘플 인벤토리가 어긋납니다.
   - 공식 표는 `SCR-01~04`인데 실제 샘플에는 `SCR-01-entry`, `SCR-03-fallback-result`, `SCR-04-copy-builder`, `SCR-05-error-state`가 추가로 존재합니다.
   - `SCR-04`가 응답 부족 상태와 문구 만들기 상태를 동시에 가리키는 혼선이 있습니다.
   - `SCR-03-result-recommendation.png`는 실제 화면 캡처라기보다 placeholder 수준입니다.

6. Apps in Toss 개발 전 게이트가 아직 통과되지 않았습니다.
   - project `CLAUDE.md`와 `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`가 없습니다.
   - Apps in Toss/Google Play matrix, i18n, privacy, backend, auth, release-risk 기록이 필요합니다.
   - 공유 링크가 토스앱 내부 진입으로 닫히는지, 외부 링크 의존인지 확인해야 합니다.

## Should Fix

- `REQ-UI-001`, `REQ-EVID-001`, `REQ-GOV-001`을 제품 요구사항 표에 정규화합니다.
- `확신도/caveat 표시`를 acceptance criteria에 명시합니다.
- `관계 안전`, `압박 없음`, `hard-no 과다`, `44px 이상` 같은 수동 판단 표현을 테스트 가능한 규칙으로 바꿉니다.
- 만료 링크, 이미 응답함, 중복 제출, 네트워크 저장 실패, closed room, 공유 후 확정/보류/재조정 상태를 화면/AC에 추가합니다.
- `ko/en` i18n 구조와 공유 문구/오류/빈 상태의 영문 기준을 잡습니다.

## 필요한 추가 산출물

아래 산출물은 2026-06-24에 생성되었습니다.

1. `ai/plans/implementation-plan.md`
   - 추천 로직 수치, threshold, tie-breaker
   - 상태 전이표
   - 데이터 모델/API 초안
   - 참여자 식별/수정/중복 정책
   - Supabase/RLS/Edge Function 경계
   - AI provider/copy 생성 방식
   - 테스트 계획

2. `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`
   - Apps in Toss/Google Play platform matrix
   - auth, ads, IAP, storage, backend, analytics, i18n, release risk
   - Supabase 사용 범위와 secret/public env 분리

3. 프로젝트 P4 package 보정
   - `planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO/09_CORRECTION_PLAN.md`
   - `ai/plans/design-plan.md`
   - `docs/design/image-generation-brief.md`
   - `docs/release/index.html`

## 최종 권고

정책/디자인 해석이 비어 있어서 바로 구현하면 위험했던 상태는 해소됐습니다.

다음 순서는 정적 최종출시제품 샘플을 기준으로 live 연결/배포 착수 여부를 결정하는 것입니다. 실제 원격 연결은 Supabase SQL 적용, Edge Function 배포, Toss app id/deep link, Toss server credential/mTLS 위치, DeepSeek V4 Pro 호출 예산을 정한 뒤 시작해야 합니다.

## 2026-06-24 디자인 패키지 구현 QA

`HAMMOYEO_DESIGN_PACKAGE`를 현재 디자인 source of truth로 승격하고 정적 최종출시제품 샘플을 전체 개편했습니다.

반영 내용:

- `docs/release/index.html`을 Converging Orbit 톤의 모바일 우선 화면으로 재구성.
- `SCR-00`부터 `SCR-06`까지 직접 query route로 열 수 있게 정리.
- 추천 결과, 응답 부족, 링크 만료, 방 확정 상태별 CTA와 AI 라벨 노출 조건을 분리.
- 디자인 토큰, 상태 라벨, 44px 이상 터치 타깃, reduced motion, Apps in Toss 기준 모바일 폭을 반영.
- 모바일 폭에서는 샘플용 디자인/토큰 패널을 숨겨 실제 제품 화면만 보이게 조정.
- `package.json`과 `scripts/verify-release-design.mjs`를 추가해 이후 구현이 패키지 화면/토큰 계약에서 벗어나면 `npm run build`로 잡히게 함.

검증 결과:

- `npm run build` 통과.
- 시스템 Chrome + Playwright로 `360`, `390`, `420` 폭에서 전체 화면 route QA 통과.
- QA 확인 항목: 가로 overflow 없음, visible internal term 없음, 버튼 터치 영역 44px 이상, template-only 상태에서 AI 라벨 미노출, 응답 부족 상태에서 AI CTA 없음, 만료/확정 상태에서 금지 CTA 없음.
- 대표 스크린샷: `/tmp/hammoyo-release-screens/result-390.png`.

## 2026-06-24 정적 기능 최종출시제품 구현 QA

디자인 최종출시제품을 localStorage 기반 기능 최종출시제품로 확장했습니다. 실제 Apps in Toss SDK, Supabase, AI provider는 연결하지 않았고, P4 조건부 범위에 맞춰 mock/browser-only adapter 상태로 유지했습니다.

반영 내용:

- `docs/release/index.html`에 방 생성 form, 후보 시간 입력, 참여자 별명, 4단계 선호 선택, 응답 저장 흐름을 구현.
- `minimum_responses = min(4, max(3, ceil(expected_count * 0.5)))`, hard-no 제외 규칙, tie-breaker, confidence 계산을 deterministic 함수로 구현.
- `scr-03` 추천 결과는 실제 응답 집계에서 계산한 1순위와 차선 후보를 표시.
- 공유 문구는 template-first로 생성하고, 복사 실패 시 DOM fallback을 사용.
- `closed` 상태에서 확정 결과를 고정하고, 이후 응답 입력 CTA는 비활성화 경계를 유지.
- `scripts/verify-release-functional.mjs`를 추가하고 `npm run build`가 디자인/기능 계약을 모두 검증하도록 갱신.

검증 결과:

- `npm run build` 통과.
- Playwright 기능 검증 통과: 방 생성, 응답 저장, 샘플 응답 추가, 추천 카드 표시, 공유 문구 복사 상태, closed persistence.
- 브라우저 QA 통과: 390px 모바일과 1280px 데스크톱에서 가로 overflow 0, console error 없음. 모바일에서는 샘플 화면 선택 패널이 의도대로 숨겨지고, 데스크톱에서는 표시됨.

## 2026-06-24 배포 전 기능 보완 QA

정적 기능 최종출시제품을 Apps in Toss / Google Play 출시 전 기준에 가깝게 보강했습니다. 실제 Toss login, Supabase, AI provider, ShareAdapter, 광고, IAP는 여전히 연결하지 않았고, 현재 범위는 browser-only 최종출시제품입니다.

반영 내용:

- 모바일 상단바에 `홈`과 `개인정보` 진입 버튼을 추가했습니다.
- `SCR-07 개인정보` 화면을 추가해 localStorage 저장 범위, 서버 전송 없음, 로컬 데이터 삭제 경로를 설명했습니다.
- `로컬 데이터 지우기`가 `hammoyo:release:v1` localStorage 값을 실제 삭제하도록 구현했습니다.
- 공유/초대/확정 CTA를 실제 클립보드 복사 동작에 맞춰 `공유 문구 복사하기`, `초대 문구 복사하기`, `확정 문구 복사하기`로 낮췄습니다.
- template-only 최종출시제품에서는 `?ai=on`이 있어도 `AI로 문장을 다듬었어요` 라벨이 노출되지 않게 했습니다.
- 응답 완료/응답 부족 화면의 `샘플 응답으로 결과 보기`는 기본 사용자 경로에서 숨기고 `?demo=1`에서만 노출되게 격리했습니다.
- 만료/확정 deep link 진입 시 `expired`/`closed` 상태를 저장하고, 이후 직접 응답 화면으로 우회해도 입력/제출이 닫히도록 했습니다.
- 응답은 충분하지만 모든 후보가 hard-no로 제외된 경우를 `새 후보 필요` 상태로 분리했습니다.
- 모바일에서 하단 CTA가 첫 뷰포트에 보이도록 fixed bottom CTA와 safe-area padding을 적용했습니다.
- 기본 진입 상태는 실제 사용자처럼 빈 방으로 시작하고, 이전 4명 샘플 응답은 `?demo=1`에서만 주입되도록 분리했습니다.
- 초대/추천/확정 복사 payload를 분리했습니다. 초대 문구는 ShareAdapter/Supabase 연결 전까지 실제 참여 URL을 만들지 않고 `preview 전용` 문구로 낮추며, 확정 문구에는 선택된 시간이 `확정됐어요` 톤으로 고정되고 추천용 `가장 현실적인 약속안` 문구가 섞이지 않습니다.
- `SCR-06` 직접 진입은 `?demo=1`이 아니면 closed 상태를 만들지 않도록 바꿔 URL만으로 확정 화면을 위조하는 경로를 막았습니다.
- `SCR-05` 직접 진입도 read-only preview로 바꿔 URL만으로 persisted room이 `expired`가 되는 경로를 막았습니다.
- `SCR-02B` 직접 진입은 실제 제출 기록이나 `?demo=1`이 없으면 성공 화면을 보여주지 않도록 막았습니다.
- 복사 API와 fallback이 모두 실패하면 `복사하지 못했어요` 상태를 보여주도록 바꿨습니다.
- `locale-ko`/`locale-en` resource와 상단 언어 전환 버튼을 추가했습니다.
- `docs/release/privacy.html`을 추가하고 개인정보 화면에서 정적 정책 문서, 보관/삭제/문의 기준으로 이동할 수 있게 했습니다.
- `docs/release/privacy.html`은 정적 preview 전용임을 명시하고, 공개 문의 이메일/외부 privacy URL/데이터 삭제 요청 URL은 제출 전 placeholder로 남겼습니다.
- `demo=1` 상호작용은 일반 저장소 `hammoyo:release:v1` 대신 `hammoyo:release:demo:v1`에만 저장되도록 격리했습니다.
- `demo=1`의 `reset=1`과 개인정보 화면 삭제도 demo 저장소만 정리하도록 제한해 일반 저장소 삭제 오염을 막았습니다.
- 추천/초대/확정 copy payload와 demo fixture를 locale template로 이동해 `lang=en` 결과 화면과 copy payload가 영어로 나오고, 데모 모임명/요일/장소에도 한글이 섞이지 않도록 했습니다.
- `docs/release/privacy.html`에 English summary와 data-deletion URL 제출 전 caveat를 추가했습니다.
- `docs/release/privacy.html`의 모바일 overflow를 CSS와 자동 검증으로 막았습니다.
- `privacy.html`에도 data favicon link를 추가해 최종 live QA에서 보인 favicon 404를 제거했습니다.
- 데스크톱 1024x768에서도 결과 화면의 주요 CTA가 첫 뷰포트 안에 들어오도록 phone preview를 내부 스크롤/sticky 컨테이너로 조정했습니다.

검증 결과:

- `npm run build` 통과.
- Playwright 기능 검증 통과: 모바일 홈/개인정보/삭제, 개인정보 정책 링크, preview-only 초대 copy, 추천/확정 copy payload 분기, AI 라벨 비노출, demo storage 쓰기/삭제 미오염, `SCR-05`/`SCR-06` 직접 진입 가드, `SCR-02B` 성공 화면 우회 차단, 복사 실패 상태, ko/en 결과/copy payload/fixture 전환, bilingual privacy caveat, privacy 문서 320/390px overflow 0, 320px/390px/1024px CTA 가시성, favicon suppress link.
- 추가 브라우저 점검 통과: 390px 결과 화면에서 `공유 문구 복사하기`와 `약속 확정하기`가 첫 화면 내 노출, 320px 홈에서 `새 모임 만들기`와 `참여 중인 모임 보기`가 첫 화면 내 노출, 1024x768 데스크톱 결과 화면에서 CTA가 뷰포트 안에 노출, console error 없음.

잔여 리스크:

- 실제 Apps in Toss shell의 back/close/safe-area 동작은 아직 실기기/토스앱에서 검증하지 않았습니다.
- 실제 공유 링크, Toss login, Supabase/RLS, Google Play build, AI 문구 생성은 아직 미구현입니다. 현재 초대 문구는 의도적으로 preview-only입니다.
- 현재 `docs/release/privacy.html`은 preview용 정적 정책입니다. Google Play/Apps in Toss 제출 전에는 실제 공개 URL, 운영자 연락처, 계정/데이터 삭제 접수 경로를 확정해야 합니다.
- 언어 전환은 핵심 screen copy, 결과/metric/copy 상태, 주요 privacy 안내 중심입니다. 다음 production app 전환에서는 남은 세부 form label과 demo fixture/date label도 locale resource로 이동해야 합니다.

## Change Log

- 2026-06-24: Codex + 4개 서브에이전트 리뷰 결과를 통합해 최초 작성.
- 2026-06-24: Supabase/권한/응답/AI/copy, 디자인 보강, 이미지 생성문, 정적 최종출시제품 샘플 보정 반영. 상태를 `corrected-planning-ready`로 갱신.
- 2026-06-24: `HAMMOYEO_DESIGN_PACKAGE` 기준으로 정적 최종출시제품 전체 화면을 재구성하고 Chrome/Playwright QA 증거를 추가. 상태를 `design-release-implemented`로 갱신.
- 2026-06-24: 정적 최종출시제품에 localStorage 기능 흐름과 자동 기능 검증을 추가. 상태를 `static-functional-release-implemented`로 갱신.
- 2026-06-24: 배포 전 기능 보완으로 모바일 홈/개인정보/삭제, CTA 정합성, AI 라벨, expired/closed 가드, 데모 시드 격리, 모바일 CTA 가시성을 보강. 상태를 `predeploy-release-hardened`로 갱신.
- 2026-06-24: 서브에이전트 사후 리뷰 지적에 따라 기본 빈 상태, 초대/추천/확정 copy payload 분기, 개인정보 정책 문서, `SCR-06` 직접 진입 가드, 데스크톱 CTA 가시성을 추가 보강.
- 2026-06-24: 2개 리뷰 페어 지적을 반영해 truly empty 기본 상태, preview-only 초대 문구, `SCR-05`/`SCR-02B` direct-route guard, 복사 실패 상태, ko/en 언어 전환, privacy preview/release 경계를 보강. 상태를 `predeploy-release-duo-review-remediated`로 갱신.
- 2026-06-24: 사후 리뷰에서 누락된 demo storage 쓰기/삭제 오염 방지, English result/copy payload/fixture, bilingual privacy summary와 privacy 모바일 overflow 검증을 추가하고 상태를 `predeploy-release-final-review-remediated`로 갱신.
- 2026-06-25: SupabaseBackendAdapter, Edge Function scaffold, AI copy policy, `verify:backend-ai`를 추가하고 상태를 `backend-ai-connection-scaffold-reviewed`로 갱신.
- 2026-06-25: Owner 지적 후 Edge Function placeholder를 Supabase DB write/read와 server-only AI provider proxy 코드로 교체하고 상태를 `backend-ai-runtime-connection-code-reviewed`로 갱신.

## 2026-06-24 플랫폼 연결 스캐폴드 QA

정적 최종출시제품을 production runtime으로 승격하지 않고, 실서비스 연결을 시작할 수 있는 adapter/SQL/release artifact를 추가했습니다. 원격 Supabase 적용, 실제 Toss credential 연결, GitHub Pages 재배포, 실제 공개 URL 확정은 수행하지 않았습니다.

반영 내용:

- `src/platform/contracts.mjs`, `src/platform/preview-adapters.mjs`, `src/platform/toss-adapters.mjs`를 추가했습니다.
- preview backend/share adapter는 실제 연결 성공을 주장하지 않고 `BACKEND_NOT_CONNECTED` 또는 preview-only copy를 반환합니다.
- Toss auth adapter는 `appLogin()` 결과의 `authorizationCode`를 `BackendAdapter.exchangeTossAuth()`로 넘기는 구조로만 둡니다.
- Toss share adapter는 공식 기준에 맞춰 `intoss://...` deep link만 `getTossShareLink()`로 넘깁니다.
- `supabase/migrations/20260624_hammoyo_backend.sql`에 `hammoyo_` prefix app tables, `core_users`, `authmap_user_identities`, RLS ON, membership select policy를 추가했습니다.
- RLS 하위 조회는 host/member 모두를 허용하는 `hammoyo_can_read_room(room_id)` helper를 통해 닫았습니다.
- `hammoyo_rooms.status`에는 canonical state machine의 `draft` 상태를 포함했습니다.
- `docs/release/platform-readiness.md`, `docs/release/contact.html`, `docs/release/delete-data.html`을 추가했습니다.
- `.env.example`에 public privacy/contact/delete placeholder, `AI_COPY_ENABLED=false`, `APPS_IN_TOSS_CONSOLE_API_KEY=`를 추가했습니다. server secret public prefix는 추가하지 않았습니다.
- `scripts/verify-platform-readiness.mjs`와 `npm run verify:platform`을 추가하고 `npm run build`에 포함했습니다. 이 검증은 adapter/SQL/env/release 문서뿐 아니라 privacy/contact/delete placeholder도 직접 확인합니다.

검증 결과:

- `npm run verify:platform` 통과.
- `npm run build` 통과: 디자인, 기능, 플랫폼 준비 검증 모두 통과.

잔여 리스크:

- Toss auth token exchange runtime은 Supabase Edge Function 단독으로 갈지, mTLS 가능한 별도 secure worker가 필요한지 공식 문서 기준으로 재확인해야 합니다.
- 실제 Apps in Toss app name/deep link prefix, public privacy URL, contact email, data deletion URL은 아직 placeholder입니다.
- Supabase SQL은 파일로만 작성했고 원격 DB에는 적용하지 않았습니다.

## 2026-06-25 백엔드/AI 연결 스캐폴드 QA

Supabase와 AI 활용방안을 설명 단계에서 repo 구현 단계로 옮겼습니다. 원격 DB
적용, 실제 Toss server credential 연결, 실제 AI provider 호출, 공개 privacy/contact/delete
URL 확정은 수행하지 않았습니다.

반영 내용:

- `src/platform/supabase-backend-adapter.mjs`를 추가했습니다.
- adapter는 `exchange-toss-auth`, `create-room`, `join-room`, `submit-response`,
  `recompute-recommendation`, `generate-share-copy`, `close-room`,
  `request-data-deletion` Edge Function 경계를 호출합니다.
- `src/platform/ai-copy-policy.mjs`를 추가했습니다.
- AI copy는 기본 `AI_COPY_ENABLED=false`이며, template fallback을 우선합니다.
- AI payload allowlist는 locale, tone, confidence, top candidate label/time,
  aggregate counts, caveat code로 제한했습니다.
- room title, 이름/별명, phone/email, note/free text, provider hash, hard-no 사유,
  login token이 AI payload에 들어가지 않도록 `verify:backend-ai`가 검증합니다.
- `supabase/functions/*` scaffold를 추가했습니다. 현재 함수들은 원격 DB에 쓰지 않고,
  연결 전 상태와 필요한 table/function 경계를 명시적으로 반환합니다.
- `supabase/functions/generate-share-copy/index.ts`는 shared AI copy helper를 사용해
  template copy와 server-only AI payload shape를 고정합니다.
- `.env.example`에 `AI_PROVIDER=deepseek`, `AI_MODEL_COPY=deepseek-v4-pro`,
  `AI_MODEL_SAFETY=deepseek-v4-pro` 기본값을 추가했습니다. 실제 provider key는
  server-only shared env에서만 다룹니다.
- `scripts/verify-backend-ai.mjs`와 `npm run verify:backend-ai`를 추가하고
  `npm run build`에 포함했습니다.

서브에이전트 반영:

- planner agent는 최소 구현 단위를 adapter + Edge Function scaffold + AI policy로
  보았고, 현재 구현은 그 범위를 따릅니다.
- compliance agent는 AI payload forbidden key와 auth/token persistence 검증 강화를
  요구했고, `verify:backend-ai`에 반영했습니다.

잔여 리스크:

- 실제 Supabase SQL 적용은 아직 수동 검토 전입니다.
- Edge Function repository write, Toss token exchange, mTLS runtime, AI provider 호출은
  아직 연결 전입니다.
- Apps in Toss 로그인 eligibility, sandbox evidence, Google Play Data Safety 답변,
  공개 privacy/contact/delete URL은 계속 release blocker입니다.

## 2026-06-25 백엔드/AI 런타임 연결 코드 보정

성배님 지적에 따라 `*_NOT_CONNECTED` placeholder 응답을 제거하고, Edge Function이
실제 Supabase DB와 server-only AI provider proxy를 호출하는 코드로 바꿨습니다.

반영 내용:

- `_shared/hammoyo/backend.ts`를 추가해 `SUPABASE_URL`과
  `SUPABASE_SERVICE_ROLE_KEY` 우선, `SUPABASE_SECRET_KEY` fallback 기반
  Supabase admin client를 생성합니다.
- `_shared/hammoyo/security.ts`를 추가해 Hammoyo signed session token 검증,
  provider subject hashing, session token 발급을 담당합니다.
- `exchange-toss-auth`는 `TOSS_AUTH_EXCHANGE_URL` secure worker와 통신하고,
  `core_users`/`authmap_user_identities`를 실제 upsert한 뒤 session token을 반환합니다.
- `create-room`, `join-room`, `submit-response`, `recompute-recommendation`,
  `generate-share-copy`, `close-room`, `request-data-deletion`은 각각 `hammoyo_` table에
  실제 insert/update/select를 수행합니다.
- `generate-share-copy`는 추천 snapshot을 읽고, `AI_COPY_ENABLED=true`와
  `DEEPSEEK_API_KEY`가 server-only env에 있을 때 DeepSeek V4 Pro
  (`deepseek-v4-pro`) chat completion endpoint를 호출합니다. 실패/미설정이면
  template fallback입니다.
- HMAC 처리된 `provider_subject`와 내부 AI payload는 클라이언트 응답에 싣지 않습니다.
- `verify:backend-ai`는 더 이상 `*_NOT_CONNECTED` placeholder를 허용하지 않습니다.

검증 결과:

- `npm run verify:backend-ai` 통과.

남은 release/live blocker:

- Supabase SQL은 `hammoyo_` prefix로 원격 DB에 적용했습니다.
- Supabase Functions 배포와 live invocation 검증은 이어서 진행합니다.
- `HAMMOYEO_SESSION_SECRET`, `HAMMOYEO_PROVIDER_HASH_SECRET`, `DEEPSEEK_API_KEY`,
  AI runtime flag는 원격 Function secret으로 주입했습니다. `TOSS_AUTH_EXCHANGE_URL`은
  실제 Toss secure worker URL 확정 전입니다.
- Toss secure worker/mTLS 실제 경로, Apps in Toss sandbox evidence, Google Play Data
  Safety 답변, 공개 privacy/contact/delete URL은 아직 확정 전입니다.

## 2026-06-25 DeepSeek V4 Pro 모델 고정

성배님 지시에 따라 DeepSeek 활용 모델을 Pro v4로 확정했습니다.

반영 내용:

- `supabase/functions/_shared/hammoyo/ai-provider.ts`에
  `DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-pro"`와 `resolveDeepSeekModel()`을 추가했습니다.
- `generate-share-copy`는 AI 생성 snapshot의 `model` 필드에
  `resolveDeepSeekModel()` 결과를 저장합니다.
- `.env.example`은 `AI_PROVIDER=deepseek`, `AI_MODEL_COPY=deepseek-v4-pro`,
  `AI_MODEL_SAFETY=deepseek-v4-pro`를 기본값으로 둡니다.
- `scripts/verify-backend-ai.mjs`는 `deepseek-chat` fallback을 실패로 처리합니다.

검증 결과:

- `npm run verify:backend-ai` 통과.

## 2026-06-25 Supabase DB prefix 보정

성배님 지시에 따라 shared Supabase 한 프로젝트에 여러 앱이 붙는 전제를 반영해
함모여 DB prefix를 `hammoyo_`로 고정했습니다.

반영 내용:

- `supabase/migrations/20260624_hammoyo_backend.sql`의 app table, helper, policy prefix를
  `hammoyo_`로 교체했습니다.
- Edge Function table 참조를 `hammoyo_rooms`, `hammoyo_room_members`,
  `hammoyo_candidate_slots`, `hammoyo_responses`,
  `hammoyo_response_preferences`, `hammoyo_recommendation_runs`,
  `hammoyo_share_messages`로 교체했습니다.
- `verify:platform`은 migration 안의 `hm_` prefix를 실패 처리합니다.
- `verify:backend-ai`는 Edge Function 안의 `hm_` table/helper prefix를 실패 처리합니다.

검증 결과:

- `npm run verify:platform` 통과.
- `npm run verify:backend-ai` 통과.

## 2026-06-25 원격 Supabase / Edge Function / AI 조율 연결

성배님 지시대로 shared Supabase 한 프로젝트에 `hammoyo_` prefix로 실제 DB를 만들고,
Edge Function과 DeepSeek V4 Pro schedule coordination까지 live 연결했습니다.

반영 내용:

- 원격 `dr.kang-mini-project` public schema에 `hammoyo_rooms`,
  `hammoyo_room_members`, `hammoyo_candidate_slots`, `hammoyo_responses`,
  `hammoyo_response_preferences`, `hammoyo_recommendation_runs`,
  `hammoyo_ai_coordination_runs`, `hammoyo_share_messages`,
  `hammoyo_analytics_events`를 적용했습니다.
- `service_role` grants를 migration에 추가하고 원격에도 적용했습니다.
- Edge Functions 8개를 배포했고, Supabase gateway JWT 검증은 끄는 대신 Hammoyo
  signed session token과 `core_users.deleted_at` active check를 함수 내부에서 수행합니다.
- CORS/OPTIONS 응답을 공통 response helper에 추가했습니다.
- `submit-response`는 더 이상 `roomId`만으로 membership을 만들지 않고, 먼저
  `join-room`/host membership이 있어야 응답을 저장합니다.
- `request-data-deletion`은 `core_users.deleted_at`과 `authmap_user_identities.unlinked_at`
  을 기록하고, 이후 기존 Hammoyo session token은 `SESSION_REVOKED`로 차단됩니다.
- DeepSeek V4 Pro coordination은 deterministic top candidate를 바꾸지 못하고,
  사용자 입력 후보 label을 AI payload에 보내지 않습니다. `thinking: disabled`와
  `response_format: json_object`를 사용합니다.
- `createEdgeFunctionInvoker`는 `getSessionToken`으로 최신 Hammoyo session token을
  동적으로 `Authorization` header에 붙입니다.

검증 결과:

- `npm run build` 통과.
- `npm run smoke:remote` 통과: create-room, submit-response, recompute deterministic,
  request-data-deletion, deletion-revokes-session.
- live AI coordination smoke 통과: threshold 충족 응답 3건에서 `method=ai`,
  `hammoyo_ai_coordination_runs` audit row 1건 기록.
- 원격 Functions: `close-room`, `create-room`, `exchange-toss-auth`,
  `generate-share-copy`, `join-room`, `recompute-recommendation`,
  `request-data-deletion`, `submit-response` 모두 `ACTIVE`, `verify_jwt=false`.

남은 release/live blocker:

- `TOSS_AUTH_EXCHANGE_URL` 실제 secure worker/mTLS 경로는 아직 미확정입니다.
- Apps in Toss sandbox, Toss app 테스트, public privacy/contact/delete URL,
  Google Play Data Safety 답변은 아직 제출 전 gate입니다.
