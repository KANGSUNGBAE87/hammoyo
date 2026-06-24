# Codex 작업 지시문 — 함모여 디자인 MVP

아래 문서를 먼저 읽고 디자인 구현을 시작해 주세요.

- `ai/plans/product-plan.md`
- `ai/plans/implementation-plan.md`
- `ai/plans/design-plan.md`
- 이 패키지의 `HAMMOYEO_CODEX_DESIGN_BRIEF.md`
- 이 패키지의 `HAMMOYEO_DESIGN_TOKENS.json`
- 참조 이미지 `HAMMOYEO_MVP_CONCEPT_BOARD.png`

## 목표

기존 `docs/mvp/index.html`의 정책과 상태를 유지하면서, React/Vite 또는 현재 Apps in Toss 권장 WebView runtime에서 재사용 가능한 정적 디자인 MVP를 구현해 주세요. 이번 작업은 Supabase, Toss login, AI provider를 연결하는 작업이 아닙니다. mock adapter와 fixture만 사용합니다.

## 절대 조건

1. 생성 이미지를 배경 스크린샷으로 사용하지 말고 UI를 코드로 재구성합니다.
2. 추천 알고리즘은 UI 안에서 임의로 바꾸지 않습니다. mock result만 표시합니다.
3. 색상, 간격, radius, motion은 token 파일에서만 가져옵니다.
4. TDS 컴포넌트를 우선 사용하고, 대체 구현은 thin wrapper로 격리합니다.
5. 모든 한국어 문구는 locale resource에 둡니다. component 안에 하드코딩하지 않습니다.
6. standalone 3D 이미지는 `StateGraphic` slot으로 격리합니다. 실제 출시 asset으로 확정하지 않습니다.
7. 모바일 기준 390×740, 360/390/420px 폭에서 깨짐이 없어야 합니다.
8. 모든 터치 영역은 최소 44×44px입니다.
9. 상태를 색만으로 구분하지 말고 아이콘과 라벨을 함께 사용합니다.
10. `prefers-reduced-motion`에서 이동·확대 모션을 제거합니다.
11. 첫 진입 시 자동 모달/바텀시트를 띄우지 않습니다.
12. CTA 문구만 보고 다음 행동을 예상할 수 있어야 합니다.

## 구현 순서

1. token, locale, fixture, route/state skeleton을 만듭니다.
2. 공통 컴포넌트를 구현합니다.
3. SCR-00부터 SCR-06까지 화면을 연결합니다.
4. 360/390/420px visual QA를 수행합니다.
5. accessibility와 reduced-motion을 점검합니다.
6. 마지막에 기존 정적 샘플과 정책 차이를 문서로 남깁니다.

## 완료 조건

- `npm run build` 통과
- 화면별 fixture route 또는 query parameter 제공
- console error 0개
- horizontal overflow 0개
- 모든 상태 화면이 직접 열림
- AI disabled 상태에서 AI 라벨 미노출
- low-confidence에서 추천 CTA와 AI copy 생성 CTA 미노출
- closed/expired state에서 응답 CTA 미노출
- 이미지 없이도 핵심 UX가 이해됨
