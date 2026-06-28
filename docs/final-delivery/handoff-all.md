# 함모여 최종 핸드오프 문서

---
version: 12
status: final-product-plan
updated: 2026-06-26
canonical: true
---

# 함모여 최종 기획문

## 1. 제품 정의

**함모여**는 여러 사람이 모임 시간을 정할 때, 가능한 시간표만 보여주는 서비스가 아니라 **겹치는 시간이 없어도 약속이 실제로 잡히도록 도와주는 경량 합의 엔진**이다.

핵심 문장은 다음과 같다.

> **겹치는 시간이 없어도, 약속은 잡히게.**

사용자는 “다들 언제 돼?”라고 묻고 답변을 모으는 데서 멈추지 않는다. 함모여는 응답을 모아 가장 현실적인 시간, 필요한 조정, 관계적으로 안전한 공유 문구까지 제공한다.

## 2. 제품 포지셔닝

- Category: 단체 모임 조율 / 모임 확정 자동화
- Frame: 일정 투표 앱이 아니라 **모임 합의 엔진**
- Core Promise: 방장은 후보 시간표 대신 **지금 공유 가능한 결정 카드**를 얻는다.
- Main Benefit: 전원 가능 시간이 없어도 “이 안으로 보자”까지 도달한다.

## 3. 해결할 문제

기존 단체 일정 조율은 세 단계에서 자주 실패한다.

1. 모두가 가능한 시간이 나오지 않는다.
2. 가능 시간은 있지만 방장이 어떤 안을 택해야 할지 부담스럽다.
3. 특정 참여자를 지목하거나 배제하는 것처럼 보일까 봐 단톡방에 말하기 어렵다.

함모여는 이 중 특히 **2번과 3번**을 깊게 해결한다. 단순히 표를 보여주는 것이 아니라, 방장이 말하기 편한 결론과 문장을 만들어준다.

## 4. 핵심 타깃

- 4~12명 친구 모임
- 동아리, 스터디, 프로젝트 팀
- 사내 소규모 회식 또는 번개 모임
- 여행 전 사전 모임
- 일정 조율을 매번 맡는 총무/방장

초기 최종출시제품은 2명 약속, 대규모 행사, 예약/결제/장소 추천까지 포함한 모임 운영 도구를 목표로 하지 않는다.

## 5. 핵심 가치 제안

### 방장에게

- 후보 시간을 자동으로 만들 수 있다.
- 참여자 응답을 직접 해석하지 않아도 된다.
- 전원 가능 시간이 없어도 가장 손실이 적은 안을 받는다.
- 누군가를 공개적으로 탓하지 않는 공유 문구를 얻는다.

### 참여자에게

- 로그인 없이 링크로 들어와 10~30초 안에 응답한다.
- `선호해요 / 가능해요 / 조정 가능해요 / 어려워요` 중 하나만 고르면 된다.
- `어려워요`는 점수로 상쇄되지 않고 제약으로 존중된다.
- 필요하면 응답을 수정할 수 있다.

## 6. 최종 핵심 흐름

1. 방장이 모임 이름, 기간, 시간대, 예상 인원을 입력한다.
2. 함모여가 후보 날짜/시간을 자동 생성한다.
3. 방장은 후보를 추가/삭제/수정하고 초대 링크를 공유한다.
4. 참여자는 링크로 들어와 후보별 상태를 선택한다.
5. 응답률이 최소 기준에 미달하면 추천하지 않고 추가 응답을 요청한다.
6. 기준을 넘으면 함모여가 후보를 평가하고 추천 결과를 만든다.
7. 전원 가능 시간이 없으면 비공개 조정 또는 fallback 추천을 제안한다.
8. 방장은 추천 결과를 확인하고 공유 문구를 복사하거나 결과를 공유한다.
9. 확정 후에는 결과 카드가 고정되고 재계산을 막는다.

## 7. 응답 옵션 정의

| 사용자 문구 | 내부 값 | 의미 |
| --- | --- | --- |
| 선호해요 | prefer | 가장 좋은 시간 |
| 가능해요 | available | 무리 없이 가능한 시간 |
| 조정 가능해요 | adjustable | 약간 조정하면 가능한 시간 |
| 어려워요 | hard_no | 참여가 어려운 시간 |

중요한 정책은 다음과 같다.

> `어려워요`는 -5점 같은 점수 항목이 아니라 후보 자격 판단에 쓰는 제약 조건이다.

즉, 사용자가 어려운 시간을 선택했는데 다른 사람의 선호 점수 때문에 강제로 추천되는 경험을 만들지 않는다.

## 8. 합의 모드

방 생성 시 또는 결과 평가 시 다음 모드를 둘 수 있다.

### 전원 참석 모드

한 명이라도 `어려워요`가 있으면 해당 후보는 전원 참석 후보에서 제외한다. 가족 모임, 중요한 프로젝트 킥오프, 여행 사전 모임에 적합하다.

### 최대 참석 모드

방장이 정한 최소 참석 인원을 만족하면 후보로 유지한다. 예: 8명 중 6명 이상이면 확정 가능.

### 빠른 확정 모드

최소 참석 인원을 충족하는 후보 중 가장 빠른 시간을 우선한다. 번개, 가벼운 식사, 스터디 보충 모임에 적합하다.

최종출시제품에서는 기본값을 **전원 참석 모드**로 두고, 결과 화면에서 “일부 참석으로 보기”를 선택적으로 제공한다.

## 9. 추천 상태

추천은 항상 결론과 신뢰도를 함께 제공한다.

| 상태 | 의미 | 사용자 문구 |
| --- | --- | --- |
| insufficient | 응답 부족 | 아직 추천을 만들 수 없어요 |
| tentative | 응답 기준 임시 추천 | 현재 응답 기준으로는 이 시간이 좋아요 |
| ready | 확정 가능 | 최선의 시간이 찾았어요 |
| negotiating | 조정 필요 | 한 명의 확인이 남았어요 |
| closed | 확정 완료 | 모임이 확정되었어요 |
| expired | 만료 | 링크가 만료되었어요 |

## 10. 최소 응답 기준

기존 기준보다 신뢰도를 높이기 위해 다음 기준을 권장한다.

```text
minimum_responses = max(3, ceil(expected_count * 0.6))
```

- 60% 미만: 추천 생성 금지
- 60~79%: 임시 추천
- 80~99%: 확정 가능 추천
- 100%: 전원 기준 추천

추천 부족 상태에서는 방장이 결과를 억지로 확정하지 않도록 “참여자 리마인드 보내기”를 우선 CTA로 둔다.

## 11. 비공개 조정 기능

함모여의 특화 기능은 **합의가 깨졌을 때 관계를 보호하며 조정하는 것**이다.

예시:

> 7월 4일 오후 6시는 대부분 가능하지만 한 명의 확인이 필요해요. 30분 조정하면 전원 참석 가능성이 높아져요.

방장 화면에는 개인 이름을 노출하지 않는다. 참여자에게는 개별적으로 다음 선택지를 보여준다.

- 이 시간도 가능해요
- 30분 늦게 가능해요
- 먼저 나가야 해요
- 어려워요

이 기능은 단순 일정 투표 앱과 함모여를 나누는 가장 중요한 차별점이다.

## 12. AI 사용 원칙

AI는 결정을 대신하지 않는다.

- 추천 순위와 후보 제외는 deterministic algorithm이 담당한다.
- AI는 결과 설명과 공유 문구를 부드럽게 다듬는 보조 역할만 한다.
- AI에는 이름, 연락처, raw id, 자유 텍스트, hard-no 사유를 보내지 않는다.
- AI 실패 시 항상 template copy로 fallback한다.

최종출시제품에서는 AI 문구가 없어도 제품이 작동해야 한다.

## 13. 최종출시제품 범위

### 반드시 포함

- 홈/엔트리
- 새 모임 만들기
- 후보 시간 자동 생성
- 후보 추가/삭제
- 초대 링크 공유
- 참여자 응답
- 응답 수정
- 응답 부족 상태
- 추천 결과
- 결과 공유 문구
- 확정 완료
- 만료 링크
- 내가 만든 모임 목록
- 모임 수정/삭제

### 후순위

- 실제 장소 추천
- 음식/활동 추천
- 캘린더 연동
- 결제/예약
- 채팅
- 사진 앨범
- 커뮤니티
- 복잡한 멤버 관리

## 14. 현재 구현 상태에서 보완할 점

현재 구현은 앱 흐름으로 상당 부분 진입했지만, 제품 완성 기준에서는 다음이 부족하다.

1. **홈이 아직 제품 홈이 아니라 점검 페이지처럼 보임**  
   기본 홈에서 디자인 패키지, 토큰 요약, 화면 점검 문구를 제거하고, `?debug=1`에서만 노출해야 한다.

2. **현재 공유/삭제 검증이 브라우저 localStorage에 의존**  
   다른 기기에서 열린 기존 링크까지 무효화하려면 Supabase invite lookup에서 `deleted/expired` 상태를 검사해야 한다.

3. **참여자 로그인 마찰 가능성**  
   방장은 Apps in Toss 로그인, 참여자는 익명 식별 기반으로 진입하는 구조를 우선해야 한다.

4. **추천 알고리즘의 hard_no 처리 보정 필요**  
   `어려워요`는 점수 상쇄 대상이 아니라 제약 조건이다.

5. **비공개 조정 상태가 제품적으로 더 드러나야 함**  
   `recommended` 하나로는 함모여의 차별점이 약하다. `negotiating`, `ready_to_confirm` 상태를 명확히 둔다.

6. **디자인 자산의 일관된 사용 규칙 부족**  
   귀여운 3D 동물은 홈과 상태 화면에 집중하고, 기능 화면은 카드/칩 중심으로 깔끔하게 유지한다.

## 15. 최종 한 줄

> **함모여는 일정 투표 앱이 아니라, 겹치는 시간이 없을 때도 관계를 해치지 않고 약속을 확정하게 만드는 모임 합의 엔진이다.**


---

---
version: 12
status: final-implementation-plan
updated: 2026-06-26
canonical: true
---

# 함모여 최종 구현기획문

## 1. 구현 목표

현재 함모여는 정적 샘플을 넘어 앱 흐름을 갖췄다. 그러나 최종 구현 목표는 단순 UI 정리가 아니라 **제품 홈, 합의 엔진, 공유 링크, 추천 신뢰도, 안전한 데이터 경계**를 하나의 동작 제품으로 맞추는 것이다.

최종 구현 기준은 다음이다.

- 기본 URL은 사용자용 제품 홈이어야 한다.
- QA/토큰/화면 점검 패널은 `?debug=1`에서만 보인다.
- 참여자는 로그인 없이 초대 링크로 응답할 수 있어야 한다.
- 방장은 로그인/세션 기반으로 방을 관리한다.
- 추천은 deterministic algorithm으로 동작한다.
- AI는 선택적 문구 보정만 담당한다.
- 삭제/만료/확정 상태는 로컬이 아니라 서버 상태로 검증한다.

## 2. 현재 구현 상태 요약

현재 구현된 것으로 간주하는 범위는 다음이다.

- `docs/release/index.html`, `docs/index.html` 기반 정적 HTML/CSS/JS 앱 화면
- iPhone식 날짜/시간 picker
- 후보 추가/삭제
- OS/브라우저 native share 우선 공유
- 초대 홈 진입
- 내가 만든 모임 상태판
- 브라우저 localStorage 기반 방 생성/응답/추천/확정
- Supabase/Edge Function/DeepSeek 경계 코드
- 원격 shared Supabase DB의 `hammoyo_` schema 적용
- 8개 Edge Function 배포 및 remote smoke 통과

단, Apps in Toss sandbox evidence, Toss secure worker/mTLS 실제 경로, 공개 privacy/contact/delete URL은 아직 출시 전 blocker다.

## 3. 현재 부족한 부분 체크리스트

| 영역 | 부족한 점 | 처리 방향 |
| --- | --- | --- |
| 홈 | 기본 화면이 내부 점검판처럼 보임 | 제품 홈을 기본값으로, debug는 쿼리 뒤로 이동 |
| 디자인 | 귀여운 이미지와 기능 UI가 섞여 어수선함 | 홈/상태 화면은 3D, 입력/결과 화면은 카드 중심 |
| 추천 | hard_no가 점수로 처리될 가능성 | hard_no는 후보 제외/제약 조건으로 분리 |
| 상태 | recommended 중심이라 합의 과정이 약함 | negotiating, ready_to_confirm 추가 |
| 공유 | GitHub Pages는 공개 후보 snapshot 중심 | Apps in Toss는 intoss deep link + server invite lookup |
| 삭제 | 같은 브라우저 revoked 기준 | 서버 room status/deleted_at 기준으로 무효화 |
| 로그인 | 참여자 로그인 요구 시 이탈 위험 | 방장 로그인, 참여자 익명 key/임시 member 우선 |
| AI | 제품 차별점으로 과대 포장 위험 | AI는 copy polish와 설명 보조에 한정 |
| 검증 | live validation 부족 | 방장/총무 8~12명 테스트 필요 |

## 4. 권장 기술 구조

```text
src/
  core/
    recommendation/
      score.ts
      eligibility.ts
      confidence.ts
      explain.ts
    room-state/
      state-machine.ts
      permissions.ts
    copy-policy/
      templates.ko.ts
      ai-copy-policy.ts
  features/
    entry/
    host-room/
    participant-response/
    negotiation/
    result/
    my-rooms/
  platform/
    AuthAdapter.ts
    BackendAdapter.ts
    ShareAdapter.ts
    AnalyticsAdapter.ts
  platform/toss/
    tossAuthAdapter.ts
    tossShareAdapter.ts
  platform/preview/
    previewAuthAdapter.ts
    previewBackendAdapter.ts
    previewShareAdapter.ts
supabase/
  migrations/
  functions/
docs/
  release/
  assets/
```

제품 로직은 Toss SDK, Supabase SDK, DeepSeek SDK를 직접 import하지 않는다. 모든 외부 연결은 adapter 뒤에 둔다.

## 5. 라우팅 구조

| Route / Query | 화면 | 목적 |
| --- | --- | --- |
| `/` | 제품 홈 | 새 모임 생성/초대 링크 참여 |
| `/?room=<invite_slug>` | 초대 홈 | 공개 후보 snapshot 확인 후 참여 |
| `/?screen=scr-01-host-room&debug=1` | QA 직접 진입 | 내부 테스트 전용 |
| `/my` 또는 `?screen=my-rooms` | 내가 만든 모임 | 방장 관리 |
| `/result/<room_id>` | 결과 | 방장/참여자 결과 확인 |
| `/closed/<room_id>` | 확정 카드 | 확정 후 공유 화면 |
| `/expired` | 만료 링크 | write 불가 안내 |

현재처럼 query parameter 직접 진입은 유지하되, 사용자 기본 경험에서 내부 테스트 문구가 보이지 않게 한다.

## 6. 상태 머신 v2

```text
draft -> collecting -> insufficient -> evaluating -> recommended -> ready_to_confirm -> closed
                                      -> negotiating -> ready_to_confirm
collecting -> expired
insufficient -> expired
recommended -> expired
negotiating -> expired
closed -> archived
```

### 상태 정의

- `draft`: 방장이 방을 만들고 있음
- `collecting`: 응답 수집 중
- `insufficient`: 최소 응답 기준 미달
- `evaluating`: 응답 기준으로 계산 중
- `recommended`: 추천 후보 생성됨
- `negotiating`: 일부 조건 조정 확인 중
- `ready_to_confirm`: 방장이 확정할 수 있음
- `closed`: 확정 완료, 재계산 금지
- `expired`: 만료, 응답 저장 금지
- `archived`: 보관/삭제 대기

## 7. 추천 알고리즘 v2

### 7.1 응답 점수

| 응답 | 점수 | 설명 |
| --- | ---: | --- |
| 선호해요 | 3 | 가장 좋은 시간 |
| 가능해요 | 2 | 무리 없는 시간 |
| 조정 가능해요 | 1 | 조정하면 가능한 시간 |
| 어려워요 | eligibility flag | 점수 아님 |

### 7.2 최소 응답 기준

```ts
minimumResponses = Math.max(3, Math.ceil(expectedCount * 0.6));
```

### 7.3 후보 자격 판단

```ts
function isEligible(slot, mode) {
  if (mode === 'all') return slot.hardNoCount === 0;
  if (mode === 'max_attendance') return slot.availableCount >= minimumAttendance;
  if (mode === 'fast') return slot.availableCount >= minimumAttendance;
}
```

### 7.4 정렬 기준

1. 후보 자격 통과 여부
2. 전원 참석 가능 여부
3. 총 선호 점수
4. `선호해요` 수
5. `선호해요 + 가능해요` 수
6. `조정 가능해요` 수가 적은 후보
7. 더 빠른 날짜
8. 방장 후보 순서

### 7.5 Confidence

| confidence | 기준 |
| --- | --- |
| high | 응답률 80% 이상, hard_no 0, 1위-2위 차이 충분 |
| medium | 응답률 60% 이상, 추천 가능하지만 일부 caveat 있음 |
| low | 기준은 넘었으나 동점/근소차/조정 필요 |
| none | 응답 부족 또는 모든 후보 제외 |

## 8. BackendAdapter 메서드

```ts
interface BackendAdapter {
  exchangeTossAuth(payload): Promise<AppSession>;
  createRoom(payload): Promise<Room>;
  updateRoom(payload): Promise<Room>;
  deleteRoom(payload): Promise<void>;
  joinRoom(payload): Promise<RoomMember>;
  submitResponse(payload): Promise<ResponseResult>;
  recomputeRecommendation(payload): Promise<RecommendationRun>;
  createNegotiationRequest(payload): Promise<NegotiationRequest>;
  submitNegotiationAnswer(payload): Promise<NegotiationResult>;
  generateShareCopy(payload): Promise<ShareMessage>;
  closeRoom(payload): Promise<ClosedRoom>;
  requestDataDeletion(payload): Promise<void>;
}
```

최종출시제품에서 `createNegotiationRequest`, `submitNegotiationAnswer`는 mock 또는 feature flag로 시작할 수 있지만, 데이터 모델에는 미리 자리를 둔다.

## 9. 데이터 모델 보강

기존 테이블에 다음을 추가 권장한다.

### `hammoyo_negotiation_requests`

| 필드 | 설명 |
| --- | --- |
| `id` | 요청 id |
| `room_id` | 방 id |
| `candidate_slot_id` | 조정 대상 후보 |
| `target_member_id` | 대상 참여자. UI에서는 익명 처리 |
| `request_type` | delay_30m, leave_early, confirm_adjustable 등 |
| `status` | pending, accepted, declined, expired |
| `created_at` | 생성 시각 |
| `expires_at` | 만료 시각 |

### `hammoyo_room_events`

추천/응답/확정/삭제 로그를 안전하게 추적한다. payload에는 이름, 연락처, raw id를 넣지 않는다.

## 10. Apps in Toss 연결

### 방장

1. `appLogin()` 호출
2. authorizationCode 서버 전달
3. secure worker 또는 Edge Function에서 Toss token exchange
4. core user mapping
5. Hammoyo signed session 발급

### 참여자

- 우선 원칙: 로그인 화면 없이 링크 진입
- 가능한 경우 Apps in Toss `getAnonymousKey()` 또는 앱 내부 익명 member 발급
- 응답 수정은 같은 anonymous key + room id 기준
- 방장 권한은 절대 invite slug로 부여하지 않음

## 11. 공유 링크 정책

### GitHub Pages / 웹 프리뷰

- `https://.../?room=<invite_slug>` 형태
- 공개 후보 snapshot으로 참여 화면 진입
- 삭제/만료 검증은 서버 연결 전까지 제한적

### Apps in Toss

- 공유 target은 `intoss://<app-name>/room/<invite_slug>`
- `getTossShareLink()`로 공유 링크 생성
- 진입 시 반드시 서버에서 room status 확인
- `deleted`, `expired`, `closed` 상태에 따라 화면 분기

## 12. AI 구현 정책

- `AI_COORDINATION_ENABLED=false` 기본
- `AI_COPY_ENABLED=false` 기본
- AI 연결 시 server-only 환경변수 사용
- provider: DeepSeek V4 Pro
- AI 입력은 집계값만 허용
- AI가 후보를 새로 만들거나 제외 기준을 바꾸면 reject
- timeout 2~3초 후 template fallback

## 13. 화면 구현 상세

### SCR-00 Home

- 기본 URL 화면
- 히어로 이미지: `hero_animals_calendar_full_square.png`
- 카피: `겹치는 시간이 없어도, 약속은 잡히게`
- CTA: `새 모임 만들기`, `초대 링크로 참여하기`
- 내부 QA 문구 숨김

### SCR-01 Host Room

- 모임 이름
- 기간
- 시간대 segment
- 예상 인원
- 후보 자동 생성
- 후보 추가/삭제
- 하단 sticky CTA

### SCR-02 Participant Response

- 4개 응답 chip
- 한 화면에 후보 하나 또는 카드 리스트
- 저장 후 응답 완료 화면으로 이동

### SCR-03 Negotiation

- 개인 지목 없이 `한 명의 확인이 남았어요`
- 대상 참여자에게만 조정 요청 표시
- 방장에게는 진행 상태만 표시

### SCR-04 Result

- 최상단 결론 카드
- confidence badge
- 추천 이유
- caveat
- 공유 문구 box
- 확정 CTA

### SCR-05 Insufficient

- 현재 응답률
- 필요한 응답 수
- 리마인드 공유 CTA

### SCR-06 Expired

- 만료 이유
- 새 링크 요청 CTA

### SCR-07 Closed

- 확정 카드
- 결과 공유
- 다음 모임 만들기

## 14. 테스트 계획

### Unit

- minimum response threshold
- hard_no eligibility
- mode별 후보 제외
- tie breaker
- confidence calculation
- room state transition
- share template

### Integration

- create room → join → submit → recompute → close
- duplicate response upsert
- expired room write reject
- deleted room invite reject
- closed room recompute reject
- AI failure fallback

### UI

- 360px / 390px / 430px overflow 없음
- bottom CTA safe area
- keyboard open 시 CTA 충돌 없음
- 긴 한국어 문구 줄바꿈
- reduced motion 대응

### Apps in Toss

- appLogin sandbox
- anonymous participant path
- intoss deep link 진입
- getTossShareLink 공유
- back/close behavior
- safe area

## 15. 구현 우선순위

### P0

- 기본 홈 제품화
- debug 패널 숨김
- hard_no 로직 보정
- minimum response 기준 보정
- 서버 room status 기반 링크 검증
- split asset 적용

### P1

- negotiating 상태 추가
- 비공개 조정 요청 skeleton
- 결과 카드/공유 문구 UX 개선
- Apps in Toss sandbox evidence 수집

### P2

- AI copy feature flag
- AI coordination audit UI 비노출 검증
- live validation dashboard
- data deletion request 정식화

## 16. 출시 전 Blocker

- Apps in Toss app id/deep link prefix 확정
- Toss secure worker/mTLS 실경로 확정
- 개인정보처리방침 공개 URL
- 문의 이메일
- 데이터 삭제 요청 URL
- 실제 사용자 8~12명 micro validation
- 생성형 이미지 사용 가능 여부와 앱인토스 디자인 검수 확인

## 17. 완료 정의

다음 조건을 만족하면 Final 최종출시제품 구현 완료로 본다.

- 기본 홈에서 제품 가치가 5초 안에 이해된다.
- 방 만들기부터 결과 공유까지 1개의 실제 방이 정상 완료된다.
- 참여자 응답은 30초 안에 끝난다.
- 응답 부족, 만료, 삭제, 확정 상태가 모두 분기된다.
- 추천 결과가 개인을 지목하지 않고 설명된다.
- 서버 상태 기준으로 삭제/만료 링크가 막힌다.
- QA/debug UI는 일반 사용자에게 노출되지 않는다.


---

---
version: 12
status: final-design-plan
updated: 2026-06-26
canonical: true
---

# 함모여 최종 디자인기획문

## 1. 디자인 방향

최종 디자인 방향은 다음이다.

> **첫 화면은 귀엽고 모이고 싶은 3D 감성, 기능 화면은 깔끔하고 신뢰감 있는 모바일 카드 UI.**

함모여는 약속 조율 도구이지만 차갑고 업무적인 툴처럼 보이면 안 된다. 사용자는 친구들과 모이기 위해 들어오므로 첫 화면에서는 따뜻함, 기대감, 귀여운 모임 분위기를 줘야 한다. 반면 실제 응답/추천 화면에서는 결정 근거를 정확하게 전달해야 하므로 과한 장식보다 정보 구조가 우선이다.

## 2. 참고 이미지 방향

이번 최종안은 사용자가 선호한 다음 느낌을 기준으로 한다.

- 하얀 배경
- 부드러운 보라색 브랜드 컬러
- 귀여운 3D 동물 캐릭터
- 캘린더와 시계 오브젝트
- 둥근 카드와 부드러운 그림자
- 화면 전체는 과하지 않고 깔끔함

즉, 홈 화면의 감성은 강하게 귀엽게 가고, 제품 화면은 같은 색감과 3D asset을 절제해서 사용한다.

## 3. 디자인 원칙

### 3.1 홈은 감성, 기능 화면은 명료함

- 홈: 캐릭터/히어로 이미지 중심
- 입력 화면: 폼과 CTA 중심
- 응답 화면: 상태 chip 중심
- 결과 화면: 추천 카드와 근거 중심
- 상태 화면: 1개 대표 캐릭터 asset 중심

### 3.2 화면당 3D asset은 1개만 강하게

한 화면에 여러 3D 일러스트를 넣으면 제품이 장난감처럼 보인다. 홈을 제외하고는 화면당 하나의 3D asset만 사용한다.

### 3.3 보라색은 브랜드와 결정 행동에만 사용

브랜드 보라색은 CTA, 선택 상태, 추천 1순위, confidence badge에 사용한다. 경고/불가/성공 상태는 각각 의미 색을 쓴다.

### 3.4 사람을 지목하지 않는 시각 언어

어려운 사람이 누구인지 보여주는 대신 집계와 상태만 보여준다. 아바타는 익명 캐릭터로 표현한다.

### 3.5 모바일 360px 우선

모든 화면은 360px 폭에서 먼저 완성한다. 카드 폭, 버튼 높이, 긴 한국어 문구 줄바꿈을 1차 기준으로 본다.

## 4. 브랜드 톤

- 따뜻함: 친구에게 공유해도 부담 없는 느낌
- 신뢰감: 추천 이유와 기준이 분명한 느낌
- 가벼움: 10~30초 안에 끝나는 느낌
- 귀여움: 동물 캐릭터와 3D 소프트 스타일
- 절제: 기능 화면은 장식보다 정보가 먼저

## 5. 컬러 시스템

| Role | Hex | 사용처 |
| --- | --- | --- |
| Brand | `#6B5CFF` | CTA, 선택 상태, 추천 카드 |
| Brand Strong | `#5A46F2` | CTA gradient 하단, active |
| Brand Soft | `#EDEBFF` | 라벨, 배경 강조 |
| Background | `#F7F8FC` | 앱 전체 배경 |
| Surface | `#FFFFFF` | 카드, 입력 영역 |
| Text Primary | `#0F172A` | 제목/본문 |
| Text Secondary | `#64748B` | 설명 |
| Success | `#22C55E` | 가능/완료 |
| Warning | `#F59E0B` | 조정 가능/응답 부족 |
| Danger | `#EF4444` | 어려움/만료 |
| Border | `#E5E8F1` | 카드 경계 |

## 6. 타이포그래피

- Font: Pretendard 우선, 시스템 sans-serif fallback
- H1: 28px / 36px / 800
- H2: 22px / 30px / 800
- H3: 18px / 26px / 700
- Body: 16px / 24px / 500
- Caption: 12px / 18px / 500

홈의 메인 카피는 2줄을 넘기지 않는다.

## 7. 레이아웃 시스템

- 기준 폭: 360px
- 좌우 padding: 20px
- 카드 padding: 18px
- 카드 radius: 20~28px
- 주요 CTA 높이: 56px
- bottom safe area: 16px 이상
- 카드 간격: 12~16px
- 섹션 간격: 24~32px

## 8. 주요 화면 디자인

### SCR-00 홈 / 엔트리

목표: 5초 안에 서비스 가치를 이해하고 새 모임을 만들게 한다.

구성:

1. 상단 로고
2. 3D 동물 히어로 이미지
3. 메인 카피: `모이는 시간, 가볍게 정해요`
4. 서브 카피: `여러 사람의 시간을 모아 최적의 시간을 찾아주는 일정 합의 앱`
5. CTA: `새 모임 만들기`
6. Secondary CTA: `초대 링크로 참여하기`
7. 하단 신뢰 문구: `로그인 없이 빠르게 시작해요 · 10~30초면 충분해요`

디자인 포인트:

- 사용자가 좋아한 두 번째 홈 이미지처럼 3D 동물 그룹을 상단 큰 카드 안에 배치한다.
- 배경에는 아주 옅은 패턴만 사용한다.
- QA/토큰/패키지 문구는 노출하지 않는다.

### SCR-01 방 만들기

목표: 방장이 복잡하게 생각하지 않고 후보를 만들게 한다.

구성:

- 모임 이름
- 모임 기간
- 시간 선호 segmented control
- 예상 인원 stepper
- 후보 시간 자동 생성 영역
- `다음` CTA

디자인 포인트:

- 폼 필드는 흰색 카드 안에 묶는다.
- 시간대 선택은 보라색 active pill을 사용한다.
- 3D asset은 작은 캘린더 추가 아이콘 1개까지만 허용한다.

### SCR-02 참여자 응답

목표: 10~30초 안에 응답을 완료한다.

구성:

- 모임 요약
- 후보 시간
- 4개 응답 chip
- 내 응답은 다른 참여자에게 공개되지 않는다는 안내
- 저장 CTA

상태 chip:

- 선호해요: 파란/보라 계열
- 가능해요: 초록
- 조정 가능해요: 앰버
- 어려워요: 빨강

### SCR-03 비공개 조정

목표: 합의가 깨졌을 때 관계를 보호하며 확인한다.

구성:

- `한 명의 확인이 남았어요`
- 조정 제안 카드
- 현재 집계
- 개인 지목 없는 안내
- 알림 받기 toggle

대표 asset: 잠금/실드 또는 누워 있는 캐릭터 1개.

### SCR-04 추천 결과

목표: 방장이 바로 공유 가능한 결론을 얻는다.

구성:

- 축하/완료 느낌의 confetti
- 추천 시간 카드
- 신뢰도 badge
- 추천 이유 bullet
- 참여 요약
- 공유 문구 box
- CTA: `결과 공유하기`, `확정하기`

디자인 포인트:

- 결과 카드는 보라색 gradient로 강조한다.
- 근거는 초록 체크 리스트로 보여준다.
- 불참/어려움은 개인 이름 없이 집계로만 보여준다.

### SCR-05 응답 부족

목표: 추천을 억지로 만들지 않고 추가 응답을 유도한다.

구성:

- 펭귄/생각 bubble asset
- 현재 응답률 progress
- 필요한 응답 수
- 리마인드 공유 버튼
- 응답 현황 보기

### SCR-06 만료 링크

목표: 사용자가 당황하지 않고 새 링크를 요청하게 한다.

구성:

- 모래시계 asset
- 만료된 모임 정보
- 새 링크 만들기/요청하기 CTA
- 모임 정보 보기

### SCR-07 확정 완료

목표: 결과를 다시 공유하고 다음 모임 생성으로 이어진다.

구성:

- 체크/축하 asset
- 확정 카드
- 참석 요약
- 결과 공유 CTA
- 다음 모임 만들기 CTA

## 9. 이미지/애셋 사용 정책

### 홈 전용

- `hero_animals_calendar_full_square.png`
- `app_icon_character_sample.png`
- `wordmark_hammoyo_sample.png`

### 상태 화면

- 응답 부족: `state_insufficient_response_object.png`
- 링크 만료: `state_expired_link_object.png`
- 비공개 조정: `state_private_negotiation_object.png`
- 확정 완료: `state_confirmed_object.png`

### 기능 아이콘

- 일정 추가: `icon_calendar_add_object.png`
- 일정 확정: `icon_calendar_confirm_object.png`
- 장소: `icon_place_object.png`
- 공유: `icon_share_object.png`
- 잠금: `icon_lock_object.png`
- 신뢰: `icon_trust_object.png`

### 배경

- 홈: sparse pattern을 8~12% opacity로 사용
- 기능 화면: 패턴 사용 금지 또는 상단 아주 약하게만 사용
- 결과/확정: confetti만 제한적으로 사용

## 10. 모션 원칙

- 버튼 press: scale 0.98
- 카드 등장: 180ms fade + 8px slide
- 화면 전환: 220ms fade
- 추천 결과 생성: progress skeleton 후 카드 reveal
- reduced motion 환경에서는 scale/slide 제거

## 11. 디자인 QA

- 360px 폭에서 모든 CTA가 잘림 없이 보여야 한다.
- 긴 한국어 문구가 2~3줄 이상 밀리지 않아야 한다.
- debug 패널은 기본 URL에 없어야 한다.
- 홈 이미지가 너무 커서 CTA가 첫 화면 아래로 밀리면 안 된다.
- 3D asset이 기능 정보보다 시선을 빼앗으면 안 된다.
- 결과 화면에는 추천 이유가 반드시 보여야 한다.
- `AI가 다듬은 문구` 라벨은 실제 AI 결과가 있을 때만 노출한다.

## 12. 최종 디자인 한 줄

> **함모여는 귀여운 3D 동물들이 약속을 함께 정하는 따뜻한 첫인상을 주되, 실제 결정 화면은 신뢰도 높은 카드 UI로 정리된 모바일 합의 앱이다.**


---

---
version: 12
status: final-image-asset-plan
updated: 2026-06-26
canonical: true
---

# 함모여 최종 이미지/애셋 기획문

## 1. 이미지 방향

함모여의 이미지는 단순 장식이 아니라 제품 상태를 설명하는 보조 언어다. 첫 화면에서는 “모이고 싶은 느낌”을 만들고, 상태 화면에서는 사용자가 현재 상황을 부드럽게 이해하게 한다.

핵심 스타일:

- 귀여운 동물 캐릭터
- 3D soft clay / soft toy 느낌
- 흰색 또는 아주 밝은 파스텔 배경
- 보라색 캘린더/시계/체크 오브젝트
- 동글동글한 형태와 부드러운 그림자
- 과한 파티클 금지, 작은 하트/별/점만 제한 사용

## 2. 애셋 세트

### 2.1 Hero

- `hero_animals_calendar_full_square.png`
- `hero_animals_calendar_1024.png`
- `hero_animals_calendar_tight.png`
- `reference_current_home_liked_crop.png`

용도: 홈 상단 대형 이미지, 앱 소개 이미지, OG 이미지 원본.

### 2.2 Character

- rabbit
- bear
- dog
- cat
- penguin

용도: 익명 아바타, 응답 현황 row, empty state 보조 이미지.

### 2.3 Feature Icons

- 일정 추가
- 일정 확정
- 시간
- 장소
- 사람
- 공유
- 메시지
- 알림
- 잠금
- 신뢰
- 설정
- 통계

용도: 홈 기능 설명, 설정, 내 모임, 알림, 결과 공유.

### 2.4 State Assets

- 응답 부족
- 링크 만료
- 비공개 조정
- 확정 완료

용도: 상태별 empty/result 화면.

### 2.5 Components

- response chips
- recommendation card
- share copy box
- participation progress
- confidence badge
- avatar row
- segmented control
- toggle switch

용도: Codex 구현 참고 및 시각 QA 기준.

### 2.6 Backgrounds

- hearts
- stars
- dots
- rounded blobs
- pills
- confetti
- sparse pattern

용도: 홈과 확정 화면에만 제한적으로 사용.

## 3. 생성/운영 정책

- 실제 인물 사진은 사용하지 않는다.
- 카카오톡/Toss 등 실제 브랜드 로고를 이미지 안에 넣지 않는다.
- 이미지 내 텍스트는 최소화한다. 텍스트는 앱 UI에서 HTML/CSS로 렌더링한다.
- 홈 hero는 이미지 그대로 쓰되, 버튼/카피는 코드로 구현한다.
- 기능 화면의 3D asset은 반드시 `alt` 텍스트 또는 decorative 처리 기준을 정한다.
- 이미지 용량은 홈 hero 250KB~600KB, 아이콘/상태 asset 50KB~200KB 목표로 최적화한다.

## 4. 구현 권장 경로

```text
public/assets/hammoyo/
  hero/
  characters/
  icons/
  states/
  components/
  backgrounds/
```

이미지 파일명은 영어 snake_case를 사용한다. 한국어 파일명은 reference board에만 허용한다.

## 5. 화면별 적용

| 화면 | 핵심 asset | 방식 |
| --- | --- | --- |
| Home | hero group | 큰 rounded image card |
| Host room | calendar add | 작은 보조 icon |
| Participant | status chips | CSS component + face icon |
| Negotiation | shield/lock | 상태 설명 card |
| Result | recommendation card + confetti | card 중심 |
| Insufficient | penguin mascot | empty state |
| Expired | hourglass | empty state |
| Closed | check/confetti | result state |

## 6. 최종 이미지 프롬프트

### 홈 히어로

Soft 3D clay-style cute animal friends, rabbit, bear, cat, dog and penguin, gathered around a small purple calendar and round clock, warm friendly mood, white pastel background, tiny hearts and stars, clean mobile app hero illustration, no real logos, no text, high detail, soft shadows, rounded toy-like characters, modern Korean mobile app style.

### 상태 asset

Cute soft 3D mascot illustration for a mobile scheduling app, one simple object representing the state, white background, pastel purple accent, gentle shadow, minimal decorative dots, no text, no logo, centered composition, app-ready asset.

### 기능 아이콘

Soft 3D minimal app icon, pastel purple main object, white rounded tile background, clean shadow, no text, no logo, centered, high readability at small size.

## 7. 최종 한 줄

> 이미지는 홈에서 감정을 만들고, 상태 화면에서 상황을 설명하며, 기능 화면에서는 절제된 보조 요소로만 사용한다.
