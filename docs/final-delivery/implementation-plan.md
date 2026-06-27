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

- `docs/mvp/index.html`, `docs/index.html` 기반 정적 HTML/CSS/JS 앱 화면
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
  mvp/
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

MVP에서 `createNegotiationRequest`, `submitNegotiationAnswer`는 mock 또는 feature flag로 시작할 수 있지만, 데이터 모델에는 미리 자리를 둔다.

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

다음 조건을 만족하면 Final MVP 구현 완료로 본다.

- 기본 홈에서 제품 가치가 5초 안에 이해된다.
- 방 만들기부터 결과 공유까지 1개의 실제 방이 정상 완료된다.
- 참여자 응답은 30초 안에 끝난다.
- 응답 부족, 만료, 삭제, 확정 상태가 모두 분기된다.
- 추천 결과가 개인을 지목하지 않고 설명된다.
- 서버 상태 기준으로 삭제/만료 링크가 막힌다.
- QA/debug UI는 일반 사용자에게 노출되지 않는다.
