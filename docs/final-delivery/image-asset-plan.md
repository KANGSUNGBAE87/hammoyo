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
