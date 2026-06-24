# Design Plan

## 디자인 목표

[INFERENCE] 방장이 “복잡한 표를 해석한다”가 아니라 “가장 무리가 적은 안과 공유 문구를 확인한다”고 느끼게 합니다.

## 핵심 디자인 원칙

- [INFERENCE] 참여자 입력은 10~30초 목표로 최소화합니다.
- [INFERENCE] 추천 이유는 집계형으로만 표시합니다.
- [INFERENCE] 특정인을 탓하지 않는 copy를 기본값으로 둡니다.
- [INFERENCE] 모든 추천에는 확신도와 caveat를 표시합니다.

## 정보 구조

[INFERENCE] Host setup / Participant input / Result recommendation / Empty-error states 네 축으로 구성합니다.

## 화면 목록

| Screen ID | 이름 | Sample |
|---|---|---|
| SCR-01 | 방장 약속방 생성 | `SCR-01-host-room.html` |
| SCR-02 | 참여자 선호 입력 | `SCR-02-participant-input.html` |
| SCR-03 | 추천 결과와 공유 문구 | `SCR-03-result-recommendation.html`, `SCR-03-result-recommendation.png` |
| SCR-04 | 응답 부족/후보 재설정 상태 | `SCR-04-empty-error-state.svg` |

## 화면별 목적

[INFERENCE] SCR-01은 빠른 후보 설정, SCR-02는 낮은 입력 마찰, SCR-03은 결정/공유, SCR-04는 부정 상태에서 다음 행동 안내를 담당합니다.

## 내비게이션 구조

[INFERENCE] Linear flow: create → share/input → result → copy/share. 참여자는 input 완료 후 confirmation만 봅니다.

## 핵심 상호작용

[INFERENCE] chip selection, one-tap preference marking, recommendation card selection, copy-to-clipboard, response reminder copy.

## 정보 위계

[INFERENCE] 1순위 추천안, 추천 이유, caveat, copy action, detailed table 순서입니다.

## 레이아웃 원칙

[INFERENCE] 모바일 우선 single-column, 결과 화면은 card + sticky primary action.

## 타이포그래피

[INFERENCE] system sans, 16px base, 28px hero title, 14px metadata, 12px caveat.

## 컬러 시스템

[INFERENCE] Navy #17233D, Green #2BB673, Amber #F4B740, Red #E35D5B, Background #F8FAFC.

## 간격 시스템

[INFERENCE] 4/8/12/16/24/32 px scale.

## 컴포넌트 규칙

[INFERENCE] Cards for candidates, chips for preference, banners for caveats, copy blocks for KakaoTalk message.

## 버튼 우선순위

[INFERENCE] Primary: create/share/copy. Secondary: edit candidates, request more responses. Destructive: reset candidate.

## 정상 상태

[INFERENCE] All essential inputs complete; recommendation shown with copy.

## 로딩 상태

[INFERENCE] While aggregating responses, show “응답을 모아 가장 무리가 적은 안을 계산 중입니다.”

## 빈 상태

[INFERENCE] No responses: ask host to resend invite, not show false recommendation.

## 오류 상태

[INFERENCE] Invalid/expired room link, all candidates hard-no, insufficient candidates.

## 완료 상태

[INFERENCE] Host has copied/shared message; participants see confirmed candidate.

## 비활성 상태

[INFERENCE] Copy button disabled until recommendation exists.

## 반응형 기준

[INFERENCE] Mobile 390px primary, tablet 768px two-column result, desktop 1200px centered content.

## 모바일 터치 기준

[INFERENCE] Touch targets ≥44px, preference chips stacked or 2-column max.

## 접근성 기준

[INFERENCE] WCAG AA contrast, no color-only state, visible focus, buttons with clear labels.

## 문구 및 톤앤매너

[INFERENCE] 부드럽고 책임을 전가하지 않는 말투: “가장 무리가 적어 보여요”, “특별히 어려운 분이 없으면”.

## 디자인 금지 사항

- [INFERENCE] 특정 참여자 이름을 “문제”로 강조하지 않습니다.
- [INFERENCE] “최적/정답”처럼 과단정하지 않습니다.
- [INFERENCE] 긴 설문처럼 보이지 않게 합니다.

## SCR-01 방장 약속방 생성

### 목적
[INFERENCE] 방장이 1분 안에 약속방과 후보 시간을 만들게 합니다.
### 진입 조건
[INFERENCE] 방장이 새 모임을 만들기로 선택.
### 주요 정보
모임명, 대략 인원, 후보 날짜/시간, 장소/활동 최소 조건.
### 구성요소
Text input, quick date chips, time range cards, share preview.
### Primary Action
`초대 링크 만들기`.
### Secondary Action
`후보 자동 채우기`.
### 화면 상태
normal, incomplete, loading.
### 오류 및 예외
후보 0개, 모임명 없음.
### 사용 문구
“후보는 나중에 수정할 수 있어요.”
### 연결되는 다음 화면
SCR-02 or share link.
### 관련 요구사항 ID
REQ-PROD-001, REQ-UI-001.

## SCR-02 참여자 선호 입력

### 목적
[INFERENCE] 참여자가 10~30초 안에 후보별 선호를 남깁니다.
### 진입 조건
초대 링크 접근.
### 주요 정보
모임명, 후보 시간, 4단계 선택.
### 구성요소
Candidate list, preference chips, optional constraint field.
### Primary Action
`응답 보내기`.
### Secondary Action
`나중에 다시 보기`.
### 화면 상태
normal, saved, validation error.
### 오류 및 예외
만료 링크, 이미 마감된 방.
### 사용 문구
“대략 느낌만 골라도 충분해요.”
### 연결되는 다음 화면
Confirmation.
### 관련 요구사항 ID
REQ-PROD-002, REQ-UX-001.

## SCR-03 추천 결과와 공유 문구

### 목적
[INFERENCE] 방장이 추천안을 이해하고 단톡방에 공유할 수 있게 합니다.
### 진입 조건
응답 2명 이상 또는 host가 결과 보기 선택.
### 주요 정보
추천 후보, 추천 이유, caveat, copy block.
### 구성요소
Recommendation card, evidence chips, message box, copy button, detail table.
### Primary Action
`문구 복사하기`.
### Secondary Action
`후보 다시 조정`.
### 화면 상태
normal, low-confidence, copied.
### 오류 및 예외
응답 부족, hard-no 과다.
### 사용 문구
“전원 가능한 시간은 없어서, 가능/선호 응답이 가장 고르게 모인 안을 우선 후보로 잡아봤어요.”
### 연결되는 다음 화면
Done / edit candidates.
### 관련 요구사항 ID
REQ-LOGIC-001, REQ-COPY-001.

## SCR-04 응답 부족/후보 재설정 상태

### 목적
[INFERENCE] 추천을 내면 안 되는 상황에서 false confidence를 피하고 다음 행동을 제시합니다.
### 진입 조건
응답 부족 또는 모든 후보의 강한 불가 과다.
### 주요 정보
왜 추천 불가인지, 다음 행동.
### 구성요소
Warning banner, resend copy, edit candidates button.
### Primary Action
`응답 요청 문구 복사`.
### Secondary Action
`후보 다시 정하기`.
### 화면 상태
empty, error.
### 오류 및 예외
none.
### 사용 문구
“아직 추천을 내기엔 응답이 부족해요.”
### 연결되는 다음 화면
SCR-01/SCR-03.
### 관련 요구사항 ID
REQ-UX-001.
