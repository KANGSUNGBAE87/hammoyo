# 함모여 01_DECISIONS

Updated: 2026-06-24

## 2026-06-22 — 기본 프로젝트 루트 확정

Owner 지시로 `hammoyo` 폴더를 `함모여` 최종 작업물/기본 프로젝트 루트로 사용합니다.

- Project root: `/Users/kangsungbae/Documents/hammoyo`
- 기본 GitHub remote: `origin` → `https://github.com/KANGSUNGBAE87/hammoyo.git`
- GitHub web URL: `https://github.com/KANGSUNGBAE87/hammoyo`
- 앞으로 함모여 관련 작업은 이 폴더에서 시작합니다.
- Planning Lab 공식 원본은 `/Users/kangsungbae/Documents/지식저장소/planning-lab`에 계속 보존합니다.
- Planning Lab P1/P2 등 기존 결과물은 이 프로젝트 루트로 사본 이관했습니다.

## 2026-06-22 — P2 완료 상태

- Run ID: `PL-P2-HAMMOYEO-2026-06-22-t_bc2fbb9a`
- Task ID: `t_bc2fbb9a`
- Stage: `P2_CONCEPT_VALIDATION`
- Result: `AI_GRADE_B` / `AI_RECOMMEND_PROMOTE`
- Owner approved P3 at 2026-06-22 19:38 KST.

## 2026-06-22 — P3 완료 상태

- Run ID: `PL-P3-HAMMOYEO-2026-06-22-t_3d1486ff`
- Task ID: `t_3d1486ff`
- Stage: `P3_INCUBATION`
- Result: `AI_GRADE_B` / `AI_RECOMMEND_PRE_P4_VALIDATION`
- Recommended next action: P4 직행이 아니라 pre-P4 validation. 검증 대상은 방장 추천안 신뢰/공유, 참여자 10~30초 입력, fallback 추천의 확정률 개선, 카카오톡/캘모아/언제볼까 대비 전환 의향, 반복 사용/WTP.

## 2026-06-23 — pre-P4 validation 완료 상태

- Run ID: `PL-PRE-P4-HAMMOYEO-2026-06-23-t_a499bbf7`
- Task ID: `t_a499bbf7`
- Stage: `PRE_P4_VALIDATION`
- Owner approval: fresh pre-P4 validation restart approval at 2026-06-23 01:38 KST.
- Result: `AI_GRADE_B`, but conservatively close to `B_MINUS`.
- Recommendation: `AI_RECOMMEND_NARROWER_PRE_P4_VALIDATION`.
- P4 decision: `P4_HOLD`.
- Meaning: 함모여의 차별화 가설은 아직 살아 있으나, desk/scenario validation만으로 full P4 final package를 정당화할 증거는 부족합니다.
- Next recommended validation: 방장 8~12명 추천안 신뢰/카카오톡 공유 문구 테스트 + 참여자 10~30초 입력 테스트 + 기존 도구 대비 fallback 전환 이유 확인.

## 2026-06-23 — 좁은 live pre-P4 validation + 쟁점 재논의 승인/routing

- Owner decision: pre-P4 결과 보고의 선택지 1(좁은 live pre-P4 validation)과 5(특정 쟁점 재논의)를 병행 승인, 2026-06-23 01:54 KST.
- Routed task: `planning-lab` board task `t_1093f4ab`, assignee `planning-chair`, workspace `/Users/kangsungbae/Documents/hammoyo`.
- Scope: 방장 8~12명 추천안 신뢰/카카오톡 공유 문구 테스트, 참여자 10~30초 입력 테스트, fallback 관계 안전성, 외부 링크 전환, WTP·반복 세그먼트 재논의.
- Boundary: P4 final package, 디자인 기획문/샘플, 구현, production Studio 전달은 여전히 승인되지 않았습니다.


## 2026-06-23 — 좁은 live pre-P4 validation + 쟁점 재논의 결과/blocker

- Run ID: `PL-LIVE-PRE-P4-HAMMOYEO-2026-06-23-t_1093f4ab`
- Task ID: `t_1093f4ab`
- Stage: `LIVE_PRE_P4_VALIDATION + ISSUE_REDISCUSSION`
- Result: live validation `BLOCKED_RECRUITMENT_NEEDED`; issue re-discussion completed from existing P2/P3/pre-P4 evidence.
- AI grade: `AI_GRADE_B`, but conservatively close to `B_MINUS` because no live behavior data exists.
- Recommendation: `AI_RECOMMEND_OBTAIN_LIVE_RESPONDENTS_BEFORE_P4`.
- P4 decision: `P4_HOLD`.
- Meaning: 방장/총무/운영진 8~12명 또는 참여자 입력 테스트 대상에게 연락할 모집 채널/명단/동의된 테스트 경로가 없어 실제 응답을 수집하지 못했습니다. 응답자 수·수용률·completion·WTP는 조작/추정하지 않았습니다.
- Issue conclusion: fallback 추천은 관계 안전 문구와 결합할 때만 조건부로 안전하며, 외부 링크 전환은 generic scheduling이 아니라 no-unanimous/conflict 상황에서만 방어 가능합니다. WTP보다 반복 방장 세그먼트 존재 확인이 먼저입니다.
- Required next action: Owner가 모집 채널, 대상 조건, 또는 연락 가능한 방장/총무/운영진 8~12명을 제공해야 live validation을 재개할 수 있습니다.
- Official artifacts: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-LIVE-PRE-P4-HAMMOYEO-2026-06-23-t_1093f4ab/`

## 아직 승인되지 않은 것

- P4 최종 기획 패키지, 디자인 기획문, 샘플, 구현/Production Studio 전달은 아직 승인되지 않았습니다.

## 2026-06-23 — 조건부 P2/P3/P4 산출물 패키지 생성

- Run ID: `PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9`
- Task ID: `t_5fd833b9`
- Context: parent task `t_961aed7c` completed with no files; corrective scope produced actual artifacts.
- Result: `PACKAGE_COMPLETE / EVIDENCE_UNVALIDATED / IMPLEMENTATION_CONDITIONAL / OWNER_UNREVIEWED`.
- Official package: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`
- P4 hard gates: product plan, design plan, real design samples, acceptance criteria, traceability matrix, verifier report are present and P4 structural validator passed.
- Caveat: live external validation responses remain 0 due to missing recruitment/contact path. No WTP/respondent quotes/completion rates are invented.
- Boundary: `FINAL_APPROVED`, implementation, and Production Studio handoff remain unapproved.

## 2026-06-24 — 구현 전 보정 기획 및 디자인 샘플 추가

- Owner request: Supabase/권한/응답 정책, AI/copy 경계가 비어 있으므로 보정하고, Apps in Toss login을 기준으로 Supabase와 AI 연결 위치를 준비한다. 디자인 기획을 보강하고 디자인 샘플 MVP를 현재 프로젝트에 생성한다.
- Login decision: Apps in Toss `appLogin()` 기준.
- Backend decision: Supabase 기본, `BackendAdapter`/Edge Function/server boundary 뒤에 둔다.
- Auth decision: host 권한은 URL token이 아니라 Toss login 기반 `host_user_id`로 판단한다.
- Response decision: 한 사용자당 한 response round에 한 active response만 허용하고, close/expired 이후 write/recompute를 금지한다.
- AI decision: recommendation ranking은 deterministic, AI는 공유 문구 polish에만 optional로 사용한다.
- Design decision: 기존 P4 디자인을 보강해 화면 ID, 상태, AI 라벨, 이미지 생성 방향을 정규화한다.
- Local P4 copy: `/Users/kangsungbae/Documents/hammoyo/planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/`
- New artifacts:
  - `ai/plans/implementation-plan.md`
  - `ai/plans/design-plan.md`
  - `docs/design/image-generation-brief.md`
  - `docs/mvp/index.html`
  - `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`
- Hermes rule: 앞으로 Planning Lab P1/P2/P3/P4 산출물은 공식 원본뿐 아니라 해당 프로젝트 루트의 `planning-lab/<run-id>/`에도 사본을 둔다.
