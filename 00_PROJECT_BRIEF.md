# 함모여 00_PROJECT_BRIEF

Status: `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL`
Updated: 2026-06-24
Source: Planning Lab `PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9`

## 한 줄 정의

함모여는 “다들 언제 돼?”에서 끝나는 일정 투표가 아니라, 전원 가능 시간이 없거나 선호가 갈릴 때 방장이 “그럼 이 안으로 보자”까지 갈 수 있게 만드는 **단체 모임 확정 자동화 / 경량 합의 엔진**입니다.

## 핵심 사용자

- Primary: 단체 모임을 만들고 마지막 결정을 떠안는 방장/주최자/총무/운영진
- Secondary: 초대 링크를 받아 가능 시간과 간단한 선호를 빠르게 입력하는 참여자

## 핵심 문제

- 방장이 응답 수집, 미응답자 재촉, 결과 해석, 절충안 도출, 최종 공지를 모두 떠안습니다.
- 전원 가능 시간이 없으면 논의가 중단되거나 다시 처음부터 시작됩니다.
- 투표 결과가 있어도 “누구를 배려하고 어떤 안으로 확정할지”가 방장에게 남습니다.
- 참여자는 복잡한 입력이나 반복 질문 때문에 응답을 미룹니다.

## 최종출시제품 가설에서 반드시 지켜야 할 것

1. 약속방 생성 및 초대 링크 공유
2. 후보 날짜/시간 자동 생성 또는 방장의 빠른 설정
3. 참여자의 10~30초 내 가용성 입력
4. 선호 강도 입력: 선호 / 가능 / 조정 가능 / 강한 불가
5. 전원 가능 시간이 없을 때의 fallback 타협안 추천
6. 추천안 이유 표시: 참석 가능 인원, 조정 가능 인원, 강한 불가 수, 선호 강도
7. 특정 참여자를 공개적으로 배제하지 않는 관계 안전 공유 문구
8. 장소·활동·식사는 상세 추천이 아니라 최소 조건 수집 / 카테고리 수준 제안

## 최종출시제품에서 미룰 것

- 정확한 식당·카페·장소 추천
- 예약, 결제, 지도 경로 최적화
- 교통 API 기반 정밀 이동시간 계산
- 캘린더 양방향 연동
- 자연어/AI 입력을 핵심 입력 방식으로 삼는 것
- 취향 기반 개인화 추천 엔진
- 정산, 출석, 복잡한 권한 관리

## 2026-06-24 보정된 구현 전제

- 로그인은 Apps in Toss `appLogin()` 기준입니다.
- Supabase는 기본 backend로 준비하지만 제품/domain 로직에 직접 연결하지 않고 `BackendAdapter`와 Edge Function/server boundary 뒤에 둡니다.
- 초대 링크는 `invite_slug` locator만 포함하고, host 권한은 Toss login 기반 `host_user_id`로 판단합니다.
- 참여자는 한 response round에 하나의 active response만 가집니다. 방이 닫히거나 만료되면 응답 수정과 재계산을 막습니다.
- 추천 ranking은 deterministic algorithm으로만 계산합니다.
- AI는 공유 문구 polish에만 선택적으로 붙이며, template fallback과 AI 라벨이 필수입니다.
- 정적 디자인 최종출시제품 샘플은 `docs/release/index.html`입니다.

## P3 결론

- Run ID: `PL-P3-HAMMOYEO-2026-06-22-t_3d1486ff`
- Task ID: `t_3d1486ff`
- Stage: `P3_INCUBATION`
- Result: `AI_GRADE_B` / `AI_RECOMMEND_PRE_P4_VALIDATION`
- 의미: P2의 “모임 확정 자동화/합의 엔진” 포지션은 유지하지만, 카카오톡 멀티투표·톡캘린더·캘모아·언제볼까가 단순 일정 수집을 강하게 덮고 있어 P4 직행은 비권고입니다.
- strongest salvage path: 전원 가능 시간이 없거나 선호가 갈릴 때, 방장이 납득 가능한 fallback 추천안과 카카오톡 공유용 확정 문구를 얻는 것.

## pre-P4 validation 결론

- Run ID: `PL-PRE-P4-HAMMOYEO-2026-06-23-t_a499bbf7`
- Task ID: `t_a499bbf7`
- Stage: `PRE_P4_VALIDATION`
- Result: `AI_GRADE_B` 유지, 단 보수적으로 `B_MINUS`에 가까움
- Recommendation: `AI_RECOMMEND_NARROWER_PRE_P4_VALIDATION`
- P4 decision: `P4_HOLD`
- 의미: desk/source/scenario validation 기준 함모여의 차별화 가설은 살아 있지만, P4 final package로 갈 만큼의 행동 증거는 부족합니다. 다음에는 실제 방장/참여자 대상으로 좁은 live micro-validation이 필요합니다.
- Owner follow-up: 2026-06-23 01:54 KST에 선택지 1(좁은 live pre-P4 validation) + 5(특정 쟁점 재논의)를 병행 승인했고, `planning-lab` task `t_1093f4ab`로 routed되었습니다.


## live pre-P4 + 쟁점 재논의 결과

- Run ID: `PL-LIVE-PRE-P4-HAMMOYEO-2026-06-23-t_1093f4ab`
- Task ID: `t_1093f4ab`
- Stage: `LIVE_PRE_P4_VALIDATION + ISSUE_REDISCUSSION`
- Result: live validation은 `BLOCKED_RECRUITMENT_NEEDED`; 쟁점 재논의와 protocol 작성은 완료.
- P4 decision: `P4_HOLD` 유지.
- 의미: 실제 방장/총무/운영진 8~12명 또는 참여자 입력 테스트 대상에게 연락할 모집 채널/명단/동의된 테스트 경로가 없어 live 응답을 수집하지 못했습니다. 따라서 추천안 신뢰율, 공유 문구 수용률, 10~30초 입력 completion, WTP/반복 사용 신호는 아직 행동 근거가 없습니다.
- 다음 필요 액션: Owner가 모집 경로 또는 대상자 조건을 제공해야 live validation을 재개할 수 있습니다.


## 조건부 P4 패키지 결과

- Run ID: `PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9`
- Task ID: `t_5fd833b9`
- Stage: `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL`
- Package axes: `PACKAGE_COMPLETE / EVIDENCE_UNVALIDATED / IMPLEMENTATION_CONDITIONAL / OWNER_UNREVIEWED`
- Official package: `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`
- Result: refreshed P2/P3 artifacts plus P4 product plan, design plan, real HTML/SVG/PNG design samples, acceptance criteria, implementation handoff, traceability matrix, evidence log, verifier report.
- Caveat: live external validation responses remain 0 because no recruitment/contact path existed. `FINAL_APPROVED` is not set.
- Project correction: 2026-06-24에 현재 프로젝트 사본과 보정 기획이 추가되었습니다. 핵심 기준은 `ai/plans/implementation-plan.md`, `ai/plans/design-plan.md`, `docs/design/image-generation-brief.md`, `docs/release/index.html`입니다.

## P4 전 확인할 질문

1. 방장이 추천안 1~2개 중 하나를 실제로 신뢰하고 공유합니까?
2. 참여자는 카카오톡 외부 링크에서 10~30초 안에 입력을 완료합니까?
3. 전원 가능 시간이 없을 때 fallback 추천이 실제 확정률이나 방장 부담을 개선합니까?
4. 카카오톡 멀티투표, 캘모아, 언제볼까 대비 전환 이유가 “fallback 추천 + 관계 안전 문구”에 귀속됩니까?
5. 반복 모임 방장/총무/운영진 세그먼트에서 재사용 의향이 있습니까?
6. 장소·활동·식사 보조는 최소 조건/카테고리 수준에서 입력 부담 없이 차별화에 기여합니까?

## 주의

이 문서는 프로젝트 루트 요약입니다. 공식 조건부 P4 제품기획서와 디자인 패키지는 `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO`에 있으며, 구현 승인/Production Studio handoff/FINAL_APPROVED 문서가 아닙니다.
