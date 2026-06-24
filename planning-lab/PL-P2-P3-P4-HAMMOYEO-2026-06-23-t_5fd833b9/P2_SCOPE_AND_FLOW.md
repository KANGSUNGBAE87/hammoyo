# P2 Scope and Flow

## Primary Flow

1. [INFERENCE] 방장이 약속방을 만들고 모임 유형/후보 날짜·시간을 빠르게 설정합니다.
2. [INFERENCE] 카카오톡 단톡방에 입력 링크를 공유합니다.
3. [INFERENCE] 참여자는 로그인 없이 각 후보에 대해 선호/가능/조정 가능/강한 불가를 10~30초 안에 입력합니다.
4. [INFERENCE] 함모여가 전원 가능 여부, 선호 강도, 조정 가능, 강한 불가 수를 집계합니다.
5. [INFERENCE] 전원 가능 시간이 없거나 선호가 갈리면 fallback 후보 1~2개와 추천 이유를 제시합니다.
6. [INFERENCE] 방장은 관계 안전 공유 문구를 복사해 단톡방에 붙여넣습니다.

## MVP Must Include

- [INFERENCE] 방장용 약속방 생성.
- [INFERENCE] 후보 날짜/시간 빠른 설정.
- [INFERENCE] 참여자 비로그인 응답.
- [INFERENCE] 4단계 선호 입력: 선호 / 가능 / 조정 가능 / 강한 불가.
- [INFERENCE] 전원 가능 시간이 없을 때 fallback 추천.
- [INFERENCE] 추천 이유: 가능/선호/조정 가능/강한 불가를 집계형으로 표시.
- [INFERENCE] 카카오톡 공유용 관계 안전 문구.

## MVP Should Defer

- [FACT] 프로젝트 브리프는 정확한 식당·카페·장소 추천, 예약/결제, 지도 경로 최적화, 캘린더 양방향 연동, 자연어/AI 입력 core, 취향 기반 추천, 정산/출석/복잡 권한을 미루도록 정리했습니다.

## Explicit Non-goals

- [INFERENCE] generic calendar replacement.
- [INFERENCE] Doodle/When2meet형 broad scheduling clone.
- [INFERENCE] KakaoTalk internal feature replacement.
- [INFERENCE] production implementation or Studio handoff in this run.

## 정상 경로

[INFERENCE] 방장 생성 → 링크 공유 → 참여자 응답 → 추천 후보 확인 → 공유 문구 복사 → 단톡방 확정.

## 핵심 실패 경로

- [INFERENCE] 참여자가 입력하지 않음: 응답률 부족 상태와 재공유 문구를 제공하되 압박 문구는 피합니다.
- [INFERENCE] 모든 후보에 강한 불가가 많음: 후보 재설정 안내로 전환합니다.
- [INFERENCE] 특정 참여자 배제처럼 보임: 개별 이름 노출 없이 집계형 이유만 보여줍니다.

## 재방문 또는 반복 흐름

[HYPOTHESIS] 반복 모임 방장은 이전 모임 조건/참여자 목록을 복제해 다음 약속방을 빠르게 만들 수 있습니다. 단, 반복 사용 의향은 아직 live proof가 없습니다.
