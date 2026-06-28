---
status: ready-for-generation
updated: 2026-06-24
---

# 함모여 이미지 생성문 및 이미지 기획

## 목적

함모여의 이미지는 장식용 배경이 아니라 제품 상태를 설명하는 asset입니다. 앱이 약속방 결과를 단순 표가 아니라 "공유 가능한 추천안"으로 바꿔준다는 점을 보여줘야 합니다.

## Primary Image Prompt

Use this prompt for a generated bitmap image:

```text
A clean mobile product hero image for a Korean mini app called Hammoyo, showing a realistic smartphone screen with a meeting coordination result card. The screen displays abstract schedule slots, aggregate availability chips, a calm recommendation card, and a share-ready message preview. Visual mood is warm, trustworthy, practical, and relationship-safe. Use a light neutral app background, crisp white surfaces, deep ink text, blue primary accents, green success accents, and small amber caution accents. No real app logos, no Toss logo, no KakaoTalk logo, no personal names, no phone numbers, no real calendar data. Do not show human faces. The image should look like a polished product screenshot illustration, not stock photography, not a marketing landing page, not a dark blurred background.
```

Recommended generation settings:

- Aspect ratio: `4:3` for design docs and app store planning.
- Alternate aspect ratio: `1:1` for compact share preview.
- Resolution target: at least `1600x1200`.
- Style: product screenshot illustration, not character illustration.
- Text in image: avoid readable long text; use abstract Korean-like UI blocks or very short safe labels only if the image model handles text well.

## Negative Prompt

```text
No stock photo, no party photo, no restaurant photo, no crowd, no real chat app UI, no KakaoTalk interface, no Toss logo, no bank UI, no personal data, no phone numbers, no identifiable faces, no dark neon style, no purple-blue gradient blobs, no bokeh or decorative orbs, no oversized hero typography, no confusing AI robot imagery.
```

## 이미지 기획 수정

기존 P4 방향은 fallback 추천과 관계 안전 문구를 텍스트 중심으로 설명했습니다. 이미지 기획은 아래처럼 수정합니다.

1. 첫 화면/문서 대표 이미지는 모임 사진이 아니라 `추천 결과 카드가 있는 휴대폰 화면`을 사용합니다.
2. 이미지가 전달해야 할 핵심은 "함모여가 결론을 만들어준다"입니다. 사람들의 즐거운 모임 장면을 보여주면 제품 차별점이 흐려집니다.
3. AI를 상징하는 로봇/마법 이미지는 쓰지 않습니다. AI는 core ranking이 아니라 공유 문구 polish에만 제한되기 때문입니다.
4. 강한 불가/갈등 이미지를 경고색으로 과장하지 않습니다. 집계 chip과 조용한 caveat로 표현합니다.
5. 생성 이미지는 앱 내부 필수 UX가 아니라 onboarding, docs, store asset, OG/share preview 후보로만 씁니다.

## 사용 위치

- `docs/release/index.html`: "이미지 방향" preview panel에서 prompt 요약을 보여줍니다.
- 향후 앱 구현: onboarding 상단 또는 빈 상태에 1개만 사용합니다.
- 공유 문구 자체에는 생성 이미지를 자동 첨부하지 않습니다. 공유는 텍스트/링크 우선입니다.

## 검수 기준

- 제품 UI와 추천 카드가 첫눈에 보여야 합니다.
- 실제 Toss/Kakao/개인정보처럼 보이는 요소가 없어야 합니다.
- 이미지 없이도 앱 흐름이 성립해야 합니다.
- 색상은 `ai/plans/design-plan.md` palette와 충돌하지 않아야 합니다.
