# Product Plan

## 제품 한 줄 정의

[INFERENCE] 함모여는 전원 가능 시간이 없거나 선호가 갈린 모임에서 방장이 가장 무리가 적은 약속안을 확정하도록 돕는 fallback 합의 엔진입니다.

## 제품 목적

[INFERENCE] 방장의 결과 해석·절충안 도출·관계 안전 공지 부담을 줄여 실제 모임 확정까지 도달하게 합니다.

## Primary User

[FACT] 방장/주최자/총무/운영진.

## Secondary User

[FACT] 초대 링크를 받아 가능 시간과 선호 강도를 빠르게 입력하는 참여자.

## 핵심 사용 상황

[INFERENCE] 4~12명 모임에서 전원 가능한 시간이 없거나 가능/애매/선호가 갈려 방장이 결정을 미루는 상황.

## 문제 정의

[FACT] prior project brief states the host bears response collection, reminder, interpretation, compromise, and final announcement.

## 기존 대체재와 한계

- [FACT] 카카오톡 다중 투표/톡캘린더, 캘모아, 언제볼까는 generic scheduling and overlap discovery를 강하게 덮습니다.
- [INFERENCE] 한계는 conflict/no-unanimous 상황에서 방장이 어떤 안을 왜 선택할지와 단톡방에 어떻게 말할지입니다.

## 가치 제안

[HYPOTHESIS] 함모여는 방장에게 fallback recommendation, reason, and copy를 제공해 확정까지 걸리는 사회적 부담을 낮춥니다.

## 포지셔닝

[INFERENCE] “일정 투표 앱”이 아니라 “결론 없는 투표 결과를 약속안으로 바꾸는 도구”입니다.

## MVP 기능

| ID | 기능 | 설명 |
|---|---|---|
| REQ-PROD-001 | 약속방 생성 | 방장이 모임명, 인원 범위, 후보 날짜/시간을 설정 |
| REQ-PROD-002 | 참여자 입력 | 비로그인 링크에서 4단계 선호 입력 |
| REQ-LOGIC-001 | fallback scoring | 선호/가능/조정 가능/강한 불가를 집계해 후보 1~2개 추천 |
| REQ-COPY-001 | 관계 안전 문구 | 특정인 배제 없이 집계형 추천 이유와 공유 문구 생성 |
| REQ-UX-001 | 응답 부족/후보 재설정 | 충분한 응답이 없거나 후보가 모두 나쁠 때 다음 행동 제시 |

## 제외 기능

[FACT] 예약, 결제, 지도/교통 최적화, 캘린더 양방향 연동, 자연어/AI core input, 정산, 출석, 복잡 권한 관리.

## 핵심 사용자 흐름

[INFERENCE] Host create → share link → participant input → system recommends fallback → host copies safe message → group confirms.

## 주요 비즈니스 규칙

- [INFERENCE] 강한 불가가 있는 후보는 “확정”이 아니라 “후보/가장 무리가 적은 안”으로 표현합니다.
- [INFERENCE] 특정 참여자 이름과 불가 사유는 공유 문구에 노출하지 않습니다.
- [INFERENCE] 응답 수가 부족하면 추천 확신도를 낮추고 추가 응답 요청을 우선합니다.

## 반복 사용 구조

[HYPOTHESIS] 반복 모임 방장은 이전 방의 후보 패턴과 문구를 복제할 수 있습니다. [UNKNOWN] 실제 반복 사용은 미검증입니다.

## 유통 전략

[HYPOTHESIS] KakaoTalk 공유 링크, 동호회/스터디 운영진 콘텐츠, “전원 안 되는 시간 정하는 법” micro-content.

## 수익화 전략

[UNKNOWN] WTP 없음. [HYPOTHESIS] validated 이후 반복 운영진용 saved templates/history/export 기능이 premium 후보가 될 수 있습니다.

## 성공 지표

- [UNKNOWN] 추천안 선택률.
- [UNKNOWN] 공유 문구 무수정/소폭수정 사용률.
- [UNKNOWN] 참여자 입력 completion time.
- [UNKNOWN] 재사용 의향.

## 실패 기준

- [INFERENCE] 사용자가 “카톡 투표/언제볼까면 충분”하다고 판단.
- [INFERENCE] 방장이 추천안을 신뢰하지 않음.
- [INFERENCE] 문구가 관계적으로 위험하다고 느껴짐.

## 알려진 리스크

[FACT] live external validation responses = 0. [INFERENCE] direct substitutes, link friction, recommendation trust, social safety are the central risks.

## 조건부 가정

[HYPOTHESIS] no-unanimous/conflict 상황의 host pain은 충분히 반복되고, fallback/copy가 전환 이유가 됩니다.
