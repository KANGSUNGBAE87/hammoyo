# hammoyo / 함모여

Status: `ACTIVE_PROJECT_ROOT`
Created/standardized: 2026-06-22 19:09 KST
Updated: 2026-06-25

이 폴더가 앞으로 `함모여(hammoyo)`의 기본 프로젝트 루트입니다.

## 현재 진행상황

- Planning Lab stage: `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL`
- Latest Kanban task: `t_5fd833b9` — 보정: 실제 P2/P3/P4 산출물 패키지 생성
- AI grade: `AI_GRADE_B` 유지, 단 보수적으로 `B_MINUS`에 가까움
- AI recommendation: `AI_RECOMMEND_OBTAIN_LIVE_RESPONDENTS_BEFORE_P4`
- P4 package axes: `PACKAGE_COMPLETE / EVIDENCE_UNVALIDATED / IMPLEMENTATION_CONDITIONAL / OWNER_UNREVIEWED`
- Owner state: `OWNER_UNREVIEWED_AFTER_CONDITIONAL_P4_PACKAGE`
- 2026-06-24 보정: Supabase/권한/응답/AI/copy 정책, 디자인 보강 기획, 이미지 생성문, 정적 앱 샘플, ko/en 전환, localStorage 경계가 현재 프로젝트에 추가되었습니다.
- 2026-06-25 구현: `SupabaseBackendAdapter`, Supabase Edge Function runtime connection code, DeepSeek V4 Pro AI provider proxy, AI copy policy, `verify:backend-ai` 검증을 추가했습니다. 이후 원격 shared Supabase DB `hammoyo_` schema 적용, Edge Function 8개 배포, remote smoke, DeepSeek AI coordination smoke까지 통과했습니다.
- 2026-06-25 DB prefix 결정: shared Supabase 한 프로젝트에 여러 앱이 붙는 전제로, 함모여 app table/helper/policy prefix를 짧은 `hm_`가 아니라 명시적인 `hammoyo_`로 고정했습니다.
- 2026-06-26 구현: 정적 화면을 앱 흐름으로 올리고, 날짜/시간 picker, 후보 추가/삭제, 일반 공유 링크, 내가 만든 모임 상태판, 로컬 host room 목록을 추가했습니다.
- 다음 필요 실행: Toss login/account 동기화 UI, Apps in Toss sandbox evidence, 공개 contact/privacy/delete URL 확정, 또는 방장/총무/운영진 8~12명 모집 경로 확보 후 live validation 재개. 조건부 P4 패키지는 생성됐지만 실제 응답은 0건이며 `FINAL_APPROVED`는 아닙니다.

## 현재 제품 정의

`함모여`는 단순 일정 투표 앱이 아니라, 방장이 단체 모임을 실제로 확정하도록 돕는 **경량 모임 합의 엔진 / 모임 확정 자동화 앱**으로 잡습니다.

단, pre-P4 validation 이후 제품 가설은 더 좁아졌습니다.

1. 약속방 생성 및 일반 공유 링크 확인
2. 후보 날짜/시간 빠른 설정 또는 자동 생성
3. 참여자의 10~30초 내 가능 시간/선호 강도 입력
4. 전원 가능 시간이 없을 때도 멈추지 않는 fallback 타협안 추천
5. 추천 이유와 카카오톡 공유용 관계 안전 확정 문구 생성
6. 장소·활동·식사는 정교한 추천이 아니라 최소 조건/카테고리 수준 보조

## 주요 파일

- `00_PROJECT_BRIEF.md` — 현재 프로젝트 브리프
- `01_DECISIONS.md` — Owner/Planning Lab 결정 기록
- `ai/plans/product-plan.md` — P2/P3/pre-P4 기반 제품기획 상태 문서, P4 최종 기획 아님
- `ai/plans/design-plan.md` — 2026-06-24 디자인 보강 기획
- `ai/plans/implementation-plan.md` — 2026-06-24 Supabase/권한/응답/AI 구현 준비 기획
- `ai/plans/planning-status.md` — 현재 진행상황 및 다음 단계
- `planning-lab/PL-P2-HAMMOYEO-2026-06-22-t_bc2fbb9a/` — Planning Lab P2 원본 산출물 사본
- `planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/` — 조건부 P2/P3/P4 전체 산출물 사본
- `docs/mvp/index.html` — 디자인 패키지 기반 정적 앱 화면. 날짜/시간 선택, 후보 추가/삭제, 일반 공유 링크, 로컬 상태 확인이 동작합니다. 원격 Supabase/AI는 Edge Function 경계와 smoke 검증이 있으며, GitHub Pages 화면은 Toss login/account 동기화 전까지 브라우저 저장을 우선합니다.
- `src/platform/` — Apps in Toss/Supabase 연결을 위한 platform adapter contract, preview/Toss adapter skeleton, Supabase backend adapter, AI copy policy
- `supabase/migrations/20260624_hammoyo_backend.sql` — `hammoyo_` prefixed Supabase/RLS schema 기준. 2026-06-25 기준 shared Supabase 원격 DB에 적용됨.
- `supabase/functions/` — Edge Function runtime connection code. `exchange-toss-auth`, `create-room`, `join-room`, `submit-response`, `recompute-recommendation`, `generate-share-copy`, `close-room`, `request-data-deletion`이 Supabase DB와 server-only DeepSeek V4 Pro AI provider 경계를 호출함.
- `docs/release/platform-readiness.md` — Apps in Toss / Google Play / Supabase 출시 연결 readiness 문서
- `docs/design/image-generation-brief.md` — 이미지 생성문 및 이미지 기획

## GitHub

기본 GitHub 저장소는 아래로 고정합니다.

- remote name: `origin`
- remote URL: `https://github.com/KANGSUNGBAE87/hammoyo.git`
- web URL: `https://github.com/KANGSUNGBAE87/hammoyo`

## 원본 보존 위치

공식 Planning Lab 원본은 계속 아래 위치에 보존됩니다.

- P2: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-HAMMOYEO-2026-06-22-t_bc2fbb9a/`
- P3: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P3-HAMMOYEO-2026-06-22-t_3d1486ff/`
- pre-P4 validation: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-PRE-P4-HAMMOYEO-2026-06-23-t_a499bbf7/`
- live pre-P4 blocker/protocol: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-LIVE-PRE-P4-HAMMOYEO-2026-06-23-t_1093f4ab/`
- conditional P2/P3/P4 package: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/`

이 폴더는 앞으로 작업을 시작하는 프로젝트 루트이며, Planning Lab 원본은 감사/출처용 canonical archive입니다.

## 2026-06-24 구현 준비 기준

- Login: Apps in Toss `appLogin()` 기준.
- Backend: Supabase, `BackendAdapter`/Edge Function/server boundary 뒤에 둠.
- Response policy: 한 사용자당 한 round에 한 active response, close/expired 이후 write/recompute 금지.
- AI/copy: deterministic recommendation + template-first copy + optional backend AI polish.
- App screen sample: `docs/mvp/index.html`을 브라우저로 열어 화면 상태를 확인합니다. `?lang=en`으로 영어 화면을 열 수 있습니다.
- Platform scaffold: `npm run verify:platform`으로 adapter/SQL/release gate 산출물을 검증합니다.
- Backend/AI connection code: `npm run verify:backend-ai`로 SupabaseBackendAdapter, Edge Function DB/AI 연결 코드, DeepSeek V4 Pro model pinning, AI payload allowlist, template fallback을 검증합니다.
