---
version: 2
status: correction-planning-ready
updated: 2026-06-24
canonical: true
---

# 함모여 제품기획 상태 문서

Status: `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL_WITH_PROJECT_CORRECTION`
Updated: 2026-06-24

> 이 파일은 프로젝트 루트의 derived status입니다. 공식 P4 제품기획 원본은 `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO/02_PRODUCT_PLAN.md`입니다.

## 제품 포지셔닝

- Category: 단체 모임 조율 / 모임 확정 자동화
- Product frame: 경량 모임 합의 엔진
- Core promise: 가능 시간 표를 보여주는 데서 끝나지 않고, 방장이 공유 가능한 약속안 1~2개와 관계적으로 안전한 확정 문구를 얻는다.
- 핵심 문장: “다들 언제 돼?”에서 끝나는 앱이 아니라, “전원 가능 시간이 없어도 이 안으로 보자”까지 도달하게 하는 앱.

## 핵심 흐름 후보

1. 방장이 모임 이름, 대략적 기간, 선호 시간대, 예상 참여자 또는 인원을 입력합니다.
2. 함모여가 후보 날짜/시간을 자동 생성하고, 방장이 필요 시 수정합니다.
3. 방장이 초대 링크를 단체 채팅방에 공유합니다.
4. 참여자는 로그인 부담 없이 각 시간대에 대해 선호 강도와 가능 여부를 입력합니다.
5. 장소·활동·식사는 지역 범위, 카테고리, 피해야 할 조건 정도만 선택적으로 입력합니다.
6. 함모여가 응답률, 선호 강도, 조정 가능성, 강한 불가를 반영해 fallback 약속안 1~2개를 랭킹합니다.
7. 전원 가능 시간이 없으면 가장 손실이 적은 차선안과 이유를 보여주되, 특정 참여자를 공개적으로 지목하지 않는 관계 안전 문구를 생성합니다.
8. 방장이 추천안 중 하나를 확정하고, 카카오톡 단체방에 붙여넣을 최종 문구를 사용합니다.

## 차별점 가설

1. 가능 시간 표가 아니라 확정 가능한 fallback 추천안을 제시합니다.
2. 전원 가능 시간이 없어도 중단하지 않고 현실적인 차선안을 냅니다.
3. 방장의 해석 부담을 줄이는 추천 이유와 순위를 제공합니다.
4. 단순 가능/불가능이 아니라 선호 강도와 조정 가능성을 반영합니다.
5. 특정 참여자 배제처럼 보이지 않는 관계 안전 공유 문구를 제공합니다.
6. 참여자 입력을 10~30초 안에 끝내는 낮은 마찰 구조를 우선합니다.

## 핵심 리스크

- 카카오톡 다중 투표가 일정·장소·메뉴 투표를 내부 채널에서 덮습니다.
- 캘모아/언제볼까가 링크 기반 일정 조율과 겹치는 시간 확인을 직접 덮습니다.
- 추천안을 방장이 신뢰하지 않으면 함모여는 다시 단순 결과표가 됩니다.
- 특정 참여자 배제/조정 대상으로 보이면 관계 비용이 큽니다.
- 참여자 입력이 30초를 넘거나 장소/음식/활동 입력이 늘면 이탈 위험이 큽니다.
- 반복 사용/WTP는 아직 검증되지 않았습니다.

## 최신 pre-P4 결론

Pre-P4 validation 결과는 `AI_GRADE_B` 유지이나, `AI_RECOMMEND_NARROWER_PRE_P4_VALIDATION`입니다. P4 직행은 `P4_HOLD`입니다.

가장 강한 차별화 가설:

- 단순 가능 시간 수집이 아니라, 전원 가능 시간이 없거나 선호가 갈릴 때 방장이 납득 가능한 fallback 추천안 1~2개를 얻습니다.
- 방장이 카카오톡 단체방에 바로 붙여넣을 수 있는 관계적으로 안전한 확정 문구를 얻습니다.
- 장소·활동·식사는 정확한 장소 추천이 아니라 지역 범위, 카테고리, 피해야 할 조건 등 최소 입력만 받습니다.

핵심 대체재 압력:

- 카카오톡 멀티투표/톡캘린더
- BAND 일정/투표
- 캘모아
- 언제볼까
- Doodle / When2meet
- Partiful

## 다음 작업 전제

Owner가 P1 생략 및 P2→P3→P4 산출물 생산을 승인한 뒤, 보정 task `t_5fd833b9`에서 조건부 P4 패키지가 생성되었습니다. 공식 제품기획/디자인/샘플은 `/Users/kangsungbae/Documents/지식저장소/planning-lab/20_RUNS/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/P4_HAMMOYEO/`에 있습니다. 다만 실제 방장/참여자 모집·연락 경로 부재로 live 응답은 0건이므로, 다음 의미 있는 액션은 방장/총무/운영진 8~12명 또는 연락 가능한 모집 채널 확보 후 live validation 재개입니다. 구현/Production Studio 전달/FINAL_APPROVED는 아직 승인되지 않았습니다.

2026-06-24 보정으로 구현자가 임의 해석해야 했던 정책은 아래 문서로 닫았습니다.

- Supabase/권한/응답/AI 구현 기준: `ai/plans/implementation-plan.md`
- 디자인 보강 기준: `ai/plans/design-plan.md`
- 이미지 생성문/이미지 기획: `docs/design/image-generation-brief.md`
- 샘플 MVP: `docs/mvp/index.html`
- 조건부 P4 전체 사본: `planning-lab/PL-P2-P3-P4-HAMMOYEO-2026-06-23-t_5fd833b9/`

구현 착수 시 기본 전제는 Apps in Toss login, Supabase backend, deterministic recommendation, template-first copy, optional AI copy polish입니다.

## Change Log

- 2026-06-22: P2 결과를 기반으로 `P3_DERIVED_DRAFT_NOT_P4_FINAL` working draft 생성.
- 2026-06-23: pre-P4 desk/scenario validation 반영. 상태를 `PRE_P4_VALIDATED_NOT_P4_READY`로 갱신하고, P4 직행 대신 더 좁은 live micro-validation 권고로 수정.
- 2026-06-23 01:54 KST: Owner가 좁은 live pre-P4 validation + 특정 쟁점 재논의 병행을 승인. 상태를 `LIVE_PRE_P4_VALIDATION_ROUTED`로 갱신하고 `planning-lab` task `t_1093f4ab`를 최신 실행으로 기록.
- 2026-06-23 02:19 KST: task `t_1093f4ab`에서 실제 모집/연락 경로 부재로 live validation을 blocked 처리. 쟁점 재논의와 `live_validation_protocol.md`는 작성 완료. 상태를 `LIVE_PRE_P4_VALIDATION_BLOCKED_RECRUITMENT_NEEDED`로 갱신.
- 2026-06-23 12:20 KST: corrective task `t_5fd833b9`에서 실제 P2/P3/P4 artifact package를 생성. 상태를 `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL`로 갱신. Package complete이나 evidence unvalidated, owner unreviewed.
- 2026-06-24: Supabase/권한/응답/AI/copy와 디자인/이미지/샘플 MVP 보정 기획을 현재 프로젝트에 추가. 상태를 `P4_FINAL_PACKAGE_COMPLETE_CONDITIONAL_WITH_PROJECT_CORRECTION`으로 갱신.
