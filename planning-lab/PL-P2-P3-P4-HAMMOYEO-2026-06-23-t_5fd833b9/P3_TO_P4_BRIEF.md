# P3 to P4 Brief

## 확정된 제품 방향

[INFERENCE] conflict/no-unanimous 상황에서 방장이 fallback 추천과 관계 안전 확정 문구를 얻는 host decision aid.

## 확정된 타깃

[INFERENCE] 4~12명 반복/준반복 모임을 조율하는 방장/총무/운영진.

## 확정된 핵심 흐름

[INFERENCE] 방장 방 생성 → 후보 공유 → 참여자 선호 입력 → 추천 후보/이유 확인 → 관계 안전 문구 복사.

## 확정된 MVP

[INFERENCE] 약속방, 후보 시간, 4단계 선호 입력, fallback 랭킹, 집계형 이유, 카카오톡 공유 문구.

## 제외 기능

[FACT] 예약/결제/정산/정밀 장소 추천/교통 API/캘린더 양방향 연동/AI 자연어 core는 제외합니다.

## P4에서 만들 디자인 샘플

- [INFERENCE] SCR-01 방장 약속방 생성/후보 설정.
- [INFERENCE] SCR-02 참여자 10~30초 선호 입력.
- [INFERENCE] SCR-03 추천 결과와 공유 문구.
- [INFERENCE] SCR-04 응답 부족/후보 재설정 empty-error state.

## 남아 있는 Owner 결정

- [FACT] `FINAL_APPROVED`는 아직 없습니다.
- [UNKNOWN] Owner가 evidence-unvalidated package를 production Studio에 넘길지 여부.
- [UNKNOWN] live validation 모집 경로 제공 여부.

## 조건부 가정

- [HYPOTHESIS] 방장 pain은 실제로 반복됩니다.
- [HYPOTHESIS] fallback 추천과 관계 안전 문구가 별도 링크 전환을 정당화합니다.
- [HYPOTHESIS] 참여자는 10~30초 입력을 받아들입니다.
