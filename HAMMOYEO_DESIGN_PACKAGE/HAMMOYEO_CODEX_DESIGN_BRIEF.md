---
version: 1.0
status: ready-for-codex-design-implementation
updated: 2026-06-24
canonical_candidate: true
product: 함모여
---

# 함모여 MVP 디자인 기획서 — Codex Implementation Brief

## 0. 문서 목적

이 문서는 현재의 조건부 P4 패키지와 구현 준비 보정 기획을 바탕으로, Codex가 `함모여`의 정적 디자인 MVP를 React/Vite 또는 Apps in Toss WebView runtime으로 재구성할 때 따라야 할 단일 디자인 기준이다.

참조 이미지 `HAMMOYEO_MVP_CONCEPT_BOARD.png`는 분위기와 공간감만 참고한다. 이미지 안의 문구, 숫자, 컴포넌트 세부 형태는 생성형 이미지 특성상 오류가 있을 수 있으므로 이 문서와 token 파일을 source of truth로 사용한다.

## 1. 제품을 한 문장으로 정의하기

**함모여는 가능 시간 표를 보여주는 앱이 아니라, 전원 가능 시간이 없을 때도 방장이 납득할 수 있는 차선안과 공유 문구를 얻도록 돕는 경량 모임 합의 엔진이다.**

### 핵심 사용자 감정

- 입력 전: “또 단톡방 의견을 정리해야 하네.”
- 추천 확인 시: “이 정도면 이 안으로 정해도 되겠다.”
- 공유 후: “이제 다시 설명하지 않아도 된다.”

### 디자인 목표

1. **결론 우선:** 결과표보다 추천안을 먼저 보여준다.
2. **관계 안전:** 특정 참여자를 공개적으로 배제하거나 압박하는 인상을 만들지 않는다.
3. **가벼운 참여:** 참여자는 10~30초 안에 응답을 끝낸다.
4. **설명 가능한 추천:** 추천 이유를 집계 chip과 한 문장으로 설명한다.
5. **모이고 싶은 분위기:** 차갑고 업무적인 표가 아니라, 사람들이 한 지점으로 부드럽게 모이는 인상을 준다.

## 2. 비주얼 콘셉트

### 콘셉트명

**Converging Orbit — 모임 자석**

여러 개의 둥근 토큰이 하나의 캘린더·체크 포인트로 모이는 장면을 핵심 모티프로 사용한다. 사람 얼굴을 사실적으로 표현하지 않고, 머리와 몸을 단순화한 둥근 오브젝트 또는 색이 다른 구체를 사용한다.

### 최신 트렌드 적용 방식

- `Soft spatial UI`: 레이어, 높이, 겹침을 이용해 무엇이 중요한지 보여준다.
- `Restrained 3D`: 3D는 진입·빈 상태·완료 상태에만 사용하고 입력 화면에서는 제거한다.
- `Tactile controls`: 상태 선택 chip은 눌림과 선택이 물리적으로 느껴지도록 얕은 elevation을 사용한다.
- `Calm personalization`: 참여 인원과 응답 상태에 따라 추천 카드의 메시지가 달라지되 레이아웃은 예측 가능하게 유지한다.

### 앱인토스 프로덕션 제약

- 생성 이미지는 **콘셉트 참고용**이다.
- 출시 화면의 standalone 3D 일러스트는 앱인토스가 허용하는 리소스나 승인된 그래픽 생성 절차로 교체한다.
- 일반 UI의 depth는 border, elevation, shadow로 구현할 수 있지만, 과한 파티클·배경 그라데이션·장식 효과는 사용하지 않는다.
- 한 화면에 핵심 그래픽은 하나만 사용한다.
- MVP는 light mode만 설계한다.

## 3. 브랜드 시스템

### 브랜드 문장

- 서비스명: `함모여`
- 설명: `다 같이 모일 수 있는 시간을 찾아요.`
- 핵심 CTA: `새 모임 만들기`
- 결과 CTA: `이 안으로 공유하기`

### 색상 원칙

| 역할 | 값 | 사용처 |
| --- | --- | --- |
| Brand | `#5B5FF5` | 주요 CTA, 추천 1순위, 선택 상태 |
| Brand soft | `#EEF0FF` | 추천 카드 배경, 선택 전 정보 영역 |
| Success | `#20B87A` | 전원 가능, 응답 완료 |
| Warning | `#F2A62B` | 조정하면 가능, 응답 부족 |
| Danger | `#EB5757` | 어려움, 만료·오류 보조 표시 |
| Background | `#F5F7FB` | 전체 화면 배경 |
| Surface | `#FFFFFF` | 카드와 입력 영역 |
| Text primary | `#111827` | 제목과 주요 정보 |
| Text secondary | `#667085` | 설명과 메타 정보 |
| Border | `#E7EAF0` | 카드와 비선택 상태 경계 |

`#5B5FF5` 위의 흰색 텍스트는 일반 크기 기준 AA 대비를 충족하는 방향으로 선택했다. 실제 구현에서는 TDS color token과 검수 결과를 우선한다.

### 사용자-facing 응답 라벨

내부 데이터 코드와 화면 문구를 분리한다.

| 내부 값 | 사용자 문구 | 의미 |
| --- | --- | --- |
| `PREFER` | `가장 좋아요` | 가장 선호하는 시간 |
| `AVAILABLE` | `가능해요` | 무리 없이 참석 가능 |
| `ADJUSTABLE` | `조정하면 가능해요` | 일정 조정 또는 일부 지각/조기 이동으로 가능 |
| `HARD_NO` | `어려워요` | 참석이 사실상 불가능 |

`강한 불가`는 내부 정책 용어로만 사용하고 화면에는 노출하지 않는다.

### 타이포그래피

- 실행 환경에서는 TDS 기본 typography를 사용한다.
- 외부 폰트를 runtime에서 내려받지 않는다.
- 숫자·날짜·시간은 tabular number가 가능하면 적용한다.
- 큰 제목 28/36, 화면 제목 22/30, 카드 제목 18/26, 본문 16/24, 보조 문구 13/18을 기준으로 한다.

### 간격과 모서리

- 기준 화면: `390 × 740` logical canvas
- 대응 폭: `360~420px`
- 페이지 좌우 여백: 20px
- 카드 내부 여백: 16px
- 섹션 간격: 32px
- 카드 radius: 18px
- 주요 recommendation card radius: 24px
- 최소 터치 영역: 44×44px
- 하단 CTA 높이: 56px

## 4. 3D 그래픽 가이드

### 시그니처 오브젝트

`Gather Cluster`는 4~6개의 둥근 사람 토큰이 중앙의 작은 캘린더 타일 또는 체크 포인트로 모이는 장면이다.

- 재질: matte silicone 또는 soft clay
- 광원: 좌상단 단일 soft key light
- 그림자: 낮은 opacity의 넓은 shadow
- 형태: 둥근 bevel, 복잡한 표정 없음
- 색감: indigo, mint, warm peach, sky blue의 중간 명도
- 배경: 투명 또는 단색
- 금지: 입자, 반짝이, 네온, 손그림 texture, 사실적인 얼굴

### 상태별 그래픽

| 상태 | 그래픽 | 의미 |
| --- | --- | --- |
| 진입 | Gather Cluster + calendar | 사람들이 한 결론으로 모임 |
| 응답 부족 | 간격이 남은 3D 구체 군집 | 조금 더 모이면 결론 가능 |
| 만료 | 단순 hourglass 또는 닫힌 링크 | 입력 기간 종료 |
| 확정 | 캘린더 tile + check + 모인 토큰 | 약속 확정 |

입력·결과 데이터가 많은 화면에서는 3D를 사용하지 않거나 64~80px 보조 asset으로 제한한다.

## 5. 정보 구조와 화면

### SCR-00-entry — 직접 진입 홈

**목표:** 앱을 직접 연 사용자가 5초 안에 가치를 이해하고 모임을 만든다. 초대 링크 진입자는 이 화면을 건너뛴다.

- 상단: Apps in Toss 비게임 내비게이션
- hero: Gather Cluster 160~190px
- 제목: `다들 되는 시간을 정리해드려요`
- 설명: `가능한 시간을 모으면, 가장 현실적인 약속안을 추천해요.`
- primary CTA: `새 모임 만들기`
- secondary text action: `참여 중인 모임 보기`

로그인·약관·권한 요청을 이 화면에서 자동으로 띄우지 않는다.

### SCR-01-host-room — 방장 방 만들기

**목표:** 방장이 60초 안에 공유 가능한 방을 만든다.

필드 순서:
1. 모임 이름
2. 대략적인 날짜 범위
3. 후보 시간대
4. 예상 인원 3~12명
5. 응답 마감

후보 시간은 시스템이 생성하고 방장이 수정한다. 음식·장소·활동은 MVP ranking 입력에서 제외한다. 필요하면 `모임 성격` 단일 chip(식사/회식/스터디/친구모임)만 copy tone에 사용한다.

- 하단 CTA: `후보 시간 만들기`
- 후보 생성 후 CTA: `초대 링크 만들기`
- 로그인은 사용자가 가치를 확인한 뒤 `초대 링크 만들기` 시점에 요청한다.

### SCR-02-participant-input — 참여자 응답

**목표:** 로그인 약관 화면 없이 10~30초 안에 응답을 제출한다.

- 모임 제목과 응답 마감
- 완료 진행 표시: `1/5 선택`처럼 남은 개수를 알려준다.
- 후보 시간 카드마다 네 상태 중 하나를 선택한다.
- 상태는 color + icon + label로 구분한다.
- 첫 번째 `조정하면 가능해요` 선택 시 짧은 inline 설명을 한 번만 보여준다.
- 하단 CTA: `응답 보내기`

화면에는 다른 참여자의 이름이나 상세 응답을 노출하지 않는다.

### SCR-02B-response-complete — 응답 완료/대기

**목표:** 제출 성공을 명확히 알리고 재응답과 자연스러운 공유를 제공한다.

- success icon 또는 작은 gather graphic
- 제목: `응답을 보냈어요`
- 메타: `현재 7명 중 5명이 답했어요`
- CTA: `내 응답 수정하기`
- secondary: `아직 답하지 않은 친구에게 공유하기`

### SCR-03-result-recommendation — 추천 결과

**목표:** 방장이 15초 안에 공유할 약속안을 선택한다.

상단 순서:
1. confidence badge
2. `추천 1순위`
3. 날짜·시간
4. 추천 이유 한 문장
5. 집계 chip: 응답 수, 가장 좋아요 수, 조정 필요 수
6. CTA: `이 안으로 공유하기`
7. secondary: `다른 후보 보기`

Recommendation card는 화면에서 가장 높은 elevation을 가진다. 원시 점수는 기본 화면에 노출하지 않는다.

추천 문구 예시:

- Consensus: `응답한 모두가 가능하고, 가장 좋아요가 가장 많은 시간이에요.`
- Adjustment: `모두 참석할 수 있고, 일부만 조금 조정하면 되는 시간이에요.`
- Attendance fallback: `가장 많은 사람이 참석할 수 있는 차선안이에요.`

마지막 문구는 host-only이며, 그룹 공유 전 방장이 명시적으로 선택해야 한다.

### SCR-04-insufficient-response — 응답 부족

**목표:** 추천할 수 없는 이유와 다음 행동을 알려준다.

- graphic: 아직 완전히 모이지 않은 cluster
- 제목: `조금만 더 모이면 추천할 수 있어요`
- 설명: `7명 중 3명이 답했어요. 2명만 더 답하면 추천을 시작해요.`
- CTA: `다시 공유하기`
- secondary: `현재 응답 보기`

이 상태에서는 추천 CTA와 AI copy CTA를 표시하지 않는다.

### SCR-05-link-expired — 만료 링크

- 제목: `응답 기간이 끝났어요`
- 설명: `방장에게 새 링크를 받아주세요.`
- CTA: `홈으로 돌아가기`
- write action 없음

### SCR-06-room-closed — 확정 완료

- 제목: `약속을 확정했어요`
- 확정 카드: 날짜, 시간, 모임명, 참여 인원
- CTA: `확정 내용 공유하기`
- secondary: `같은 멤버로 새 모임 만들기`
- 응답 수정과 추천 재계산 없음

### AI 문구 라벨

별도 화면으로 만들지 않는다. `AI_COPY_ENABLED=true`이고 AI 결과가 실제로 사용된 경우 공유 문구 box 안에만 `AI로 문장을 다듬었어요`를 작은 badge로 표시한다. template fallback에서는 표시하지 않는다.

## 6. 주요 컴포넌트

| 컴포넌트 | 역할 | 필수 상태 |
| --- | --- | --- |
| `CandidateSlotCard` | 후보 시간 표시와 선택 | idle, selected, disabled |
| `PreferenceSelector` | 4단계 응답 | prefer, available, adjustable, hardNo |
| `RecommendationHeroCard` | 추천 1순위 표시 | consensus, adjustment, fallback |
| `ReasonChip` | 추천 근거 | success, neutral, warning |
| `ResponseCoverage` | 응답률과 threshold | collecting, enough, low |
| `ParticipantAvatarStack` | 인원 집계용 추상 avatar | 0~8 + overflow |
| `ShareCopyBox` | template/AI 공유 문구 | template, ai, error fallback |
| `StateGraphic` | 진입·부족·만료·확정 상태 이미지 | asset slot + alt text |
| `StickyBottomCTA` | 화면 핵심 행동 | enabled, disabled, loading |

## 7. 모션 원칙

- 일반 transition: 200ms
- press feedback: 140ms
- state enter: 240~280ms
- easing: `cubic-bezier(0.2, 0, 0, 1)`
- 추천 카드 등장: opacity + 8px translate-up 한 번
- gather graphic: 토큰이 8~12px 안쪽으로 모이는 단발 motion
- 반복 loop, bounce, confetti 없음
- `prefers-reduced-motion`에서는 translation과 scale을 제거하고 opacity만 사용한다.

## 8. 접근성·검수 기준

- 본문 텍스트 대비 4.5:1 이상을 목표로 한다.
- 모든 touch target은 44×44px 이상이다.
- 상태를 색만으로 표현하지 않는다.
- 중요 숫자와 추천 이유는 screen reader 순서가 자연스럽게 이어져야 한다.
- 그래픽에는 의미 기반 alt text를 제공한다.
- skeleton은 2초 이상 지속되면 오류 또는 재시도 행동을 제공한다.
- horizontal scroll 금지.
- first entry에 자동 modal/bottom sheet 금지.
- CTA는 다음 행동을 구체적으로 설명한다.
- MVP는 light theme만 제공한다.

## 9. 구현 구조 권고

```text
src/
  app/
    routes.tsx
    AppShell.tsx
  core/
    recommendation/
    room-state/
    copy-policy/
  features/
    entry/
    host-room/
    participant-response/
    result/
  ui/
    tokens/
    components/
    graphics/
  platform/
    AuthAdapter.ts
    IdentityAdapter.ts
    BackendAdapter.ts
    ShareAdapter.ts
    LocaleAdapter.ts
  mocks/
    fixtures.ts
    mockAdapters.ts
  locales/
    ko.ts
    en.ts
```

### Codex 구현 규칙

- 생성 이미지를 screenshot background로 사용하지 않는다.
- 모든 화면을 실제 DOM/TDS component로 재구성한다.
- raw hex, spacing 숫자, copy를 component에 직접 넣지 않는다.
- screen fixture를 query parameter 또는 dev-only route로 열 수 있게 한다.
- standalone 3D asset은 `StateGraphic` slot으로 격리한다.
- Supabase, appLogin, AI provider는 연결하지 않고 adapter mock만 만든다.

## 10. 기획 보정안

### 보정 1. Host와 participant의 식별 흐름을 분리한다

현재 문서의 `모든 사용자가 appLogin()` 전제는 참여 마찰과 충돌한다.

권장안:

- Host: `초대 링크 만들기` 시점에 `appLogin()`을 요청한다. host ownership과 복구에 사용한다.
- Participant: SDK 2.4.5+의 `getAnonymousKey()`와 room alias로 응답한다. 별도 약관 화면 없이 참여한다.
- SDK 미지원 시 participant에게 appLogin fallback을 제공한다.
- `app_users`에 `identity_provider = toss_login | toss_anonymous`를 추가한다.
- participant가 이후 host가 되면 identity merge를 지원한다.

이 구조가 `방장 권한은 서버에서 보장`과 `참여자는 로그인 부담 없이 응답`을 동시에 만족시킨다.

### 보정 2. HARD_NO는 점수가 아니라 제약으로 분리한다

현재 `강한 불가 -5`는 인원이 많을 때 다른 선호 점수로 상쇄될 수 있다. 사용자 신뢰를 위해 다음 bucket으로 분리한다.

```text
CONSENSUS: hard_no = 0, adjustable = 0
ADJUSTMENT: hard_no = 0, adjustable > 0
ATTENDANCE_FALLBACK: hard_no = 1, host가 일부 불참 고려를 명시적으로 선택
EXCLUDED: hard_no >= 2 또는 hard_no_ratio >= 0.34
```

`ATTENDANCE_FALLBACK`은 그룹에 자동 추천하지 않고 방장에게만 차선안으로 보여준다.

### 보정 3. 최소 응답 수 공식을 수정한다

현재 공식은 큰 모임에서도 4명 응답만으로 추천할 수 있어 신뢰가 낮다.

```text
expected_count 범위: 3~12
minimum_responses = min(expected_count, max(3, ceil(expected_count * 0.60)))
```

confidence에는 score gap뿐 아니라 response coverage를 포함한다.

### 보정 4. 추천 점수와 confidence를 분리한다

추천 순위는 다음 순서로 결정한다.

1. bucket 우선순위: CONSENSUS > ADJUSTMENT > ATTENDANCE_FALLBACK
2. 선호 점수: prefer×3 + available×2 + adjustable×1
3. adjustable 인원 적은 후보
4. prefer 인원 많은 후보
5. host 후보 순서

confidence 예시:

- high: coverage ≥ 0.8, hard_no 0, 1·2위 gap ≥ 2
- medium: coverage ≥ 0.6, excluded 아님
- low: threshold는 충족했지만 동점, 근소차 또는 attendance fallback
- none: threshold 미달 또는 모든 후보 excluded

### 보정 5. AI copy는 사실을 수정할 수 없게 한다

- 추천안 선택 후에만 AI copy를 호출한다.
- 날짜, 시간, 집계 숫자, confidence, caveat는 immutable placeholder로 고정한다.
- AI는 문장 어순과 tone만 바꾼다.
- 결과는 placeholder 보존 validator를 통과해야 한다.
- 실패하면 template으로 즉시 fallback한다.
- low confidence와 insufficient response에서는 호출하지 않는다.

### 보정 6. Invite link와 result link를 분리한다

- `invite_slug`: 응답 수집용. close 시 무효화 또는 rotate.
- `result_slug`: aggregate 확정 결과만 보여주는 read-only link.
- 결과 공유 화면에는 참여자 이름과 개인별 응답을 포함하지 않는다.

### 보정 7. MVP 범위를 일정 합의에 고정한다

장소·활동·식사 ranking은 첫 출시에서 제외한다. 이 기능은 데이터·외부 API·입력 부담을 동시에 키우며 핵심 차별점 검증을 늦춘다.

MVP에서 허용할 수 있는 것은 `모임 성격` 단일 category뿐이며, 이는 후보 ranking이 아니라 기본 공유 문구 tone에만 사용한다.

### 보정 8. 자동 추천 snapshot 갱신을 정의한다

- `submit-response` 성공 후 backend가 deterministic recommendation을 재계산하거나 stale flag를 세운다.
- threshold 전에는 low-confidence 집계만 저장한다.
- threshold 이후 host가 결과를 열면 최신 snapshot을 보장한다.
- candidate slot 수정 시 새 response round를 열고 기존 snapshot을 invalid 처리한다.

### 보정 9. 데이터 공개 범위를 명확히 한다

- Participant: 자신의 응답과 aggregate 응답 수만 본다.
- Host: 사람별 응답을 볼 수 있으나 group share copy에는 이름을 넣지 않는다.
- Public result link: 확정 결과와 aggregate 정보만 본다.
- analytics: raw name, raw Toss id, free text를 저장하지 않는다.

### 보정 10. 구현 전 최소 live validation을 추가한다

정적 prototype으로 아래를 먼저 검증한다.

- Host 5명 이상이 추천 이유를 15초 안에 이해하는가
- Participant 10명 이상이 30초 안에 응답을 완료하는가
- `조정하면 가능해요`의 의미를 80% 이상 정확히 이해하는가
- Host가 recommendation을 표보다 더 유용하다고 평가하는가
- 한 명이 참석하기 어려운 fallback 표현이 관계적으로 불편하지 않은가

## 11. 완료 수용 기준

### 화면

- SCR-00, 01, 02, 02B, 03, 04, 05, 06을 직접 열 수 있다.
- 360, 390, 420px 폭에서 horizontal overflow가 없다.
- Sticky CTA가 safe area와 겹치지 않는다.
- 3D asset이 없어도 서비스 의미가 이해된다.

### 정책

- expired/closed에서 write CTA가 없다.
- insufficient response에서 추천·AI CTA가 없다.
- AI disabled에서 AI label이 없다.
- hard-no가 있는 후보를 전원 가능으로 표현하지 않는다.
- 공개 공유 문구에 이름이 없다.

### 코드

- `npm run build` 통과
- console error 0개
- token과 locale 중앙 관리
- component 내부 raw hex 0개
- `prefers-reduced-motion` 대응
- mock adapter로 상태가 재현됨

## 12. 이미지 생성문

별도 파일 `HAMMOYEO_MVP_IMAGE_PROMPT.md`를 사용한다.

## 13. 공식 검수 참고 링크

- Apps in Toss UI/UX guide: https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.html
- Apps in Toss resolution guide: https://developers-apps-in-toss.toss.im/design/resolution.html
- Apps in Toss non-game checklist: https://developers-apps-in-toss.toss.im/checklist/app-nongame.html
- Apps in Toss anonymous key: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EB%B9%84%EA%B2%8C%EC%9E%84/getAnonymousKey.html
- Apps in Toss login: https://developers-apps-in-toss.toss.im/login/develop.html

## 14. 최종 디자인 방향

**함모여는 귀여운 일정 투표 앱이 아니라, 사람들이 한 지점으로 모여 결론에 도달하는 장면을 차분한 3D와 설명 가능한 추천 카드로 표현하는 제품이다.**

3D는 첫인상과 상태 이해를 돕고, 실제 결정은 명확한 정보 구조와 deterministic recommendation이 만든다.
