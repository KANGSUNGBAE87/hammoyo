---
version: 6
status: app-flow-plus-share-delete-background-implemented
updated: 2026-06-26
canonical: true
---

# 함모여 디자인 보강 기획

## 디자인 목표

함모여의 앱 화면은 "투표 결과표"가 아니라 "방장이 지금 단톡방에 올릴 수 있는 결정 카드"를 중심으로 설계합니다. 참여자는 10~30초 안에 응답을 끝내고, 방장은 전원 가능 시간이 없어도 관계적으로 안전한 추천안과 공유 문구를 얻어야 합니다.

이번 보강은 기존 P4 디자인 기획의 방향을 유지하되, `HAMMOYEO_DESIGN_PACKAGE`를 앞으로의 디자인 source of truth로 승격합니다. 구현자는 이 파일만 보지 말고 아래 패키지 파일을 함께 읽어야 합니다.

- `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_CODEX_DESIGN_BRIEF.md`
- `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_DESIGN_TOKENS.json`
- `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_CODEX_TASK_PROMPT.md`
- `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_MVP_IMAGE_PROMPT.md`

## 디자인 원칙

- 모바일 360px 폭에서 먼저 맞춥니다.
- Apps in Toss 내부에서 주요 흐름이 끝나야 합니다.
- 추천 결과는 "정답"처럼 보이지 않게, 응답 기준과 confidence를 함께 보여줍니다.
- `HARD_NO`가 있는 후보는 사람을 지목하지 않고 집계 caveat로만 표현합니다. 사용자 화면 문구는 `어려워요`를 사용합니다.
- AI가 만든 문구는 반드시 라벨로 구분합니다.
- 화면은 조용하고 실무적이어야 합니다. 과한 일러스트, 영웅형 랜딩, 장식용 그래픽을 쓰지 않습니다.

## Palette

Design preflight에서 `colors.io` exact service는 확인 가능한 일반 palette source로 잡히지 않아 Coolors를 fallback source로 삼았습니다. 앱 palette는 Coolors식 5색 조합을 제품 의미에 맞게 수동 조정했습니다.

| Role | Hex | 용도 |
| --- | --- | --- |
| Background | `#F5F7FB` | 앱 전체 배경 |
| Surface | `#FFFFFF` | 주요 패널 |
| Text primary | `#111827` | 본문/제목 |
| Text secondary | `#667085` | 보조 설명 |
| Brand | `#5B5FF5` | 주요 CTA, 추천 1순위, 선택 상태 |
| Brand soft | `#EEF0FF` | 추천 카드 배경, 정보 영역 |
| Success | `#20B87A` | 전원 가능, 응답 완료 |
| Warning | `#F2A62B` | 조정 가능, 응답 부족 |
| Danger | `#EB5757` | 어려움, 만료·오류 보조 표시 |
| Border | `#E7EAF0` | 구분선 |

Contrast checks:

- `#111827` on white: high contrast for primary text
- `#667085` on white: AA-oriented secondary text
- `#5B5FF5` with white text: primary CTA token selected for AA-oriented usage

## 화면 목록

| Screen ID | 이름 | 목적 |
| --- | --- | --- |
| `SCR-00-entry` | 직접 진입 홈 | 5초 안에 가치를 이해하고 새 모임 시작 |
| `SCR-01-host-room` | 방장 방 만들기 | 모임명, 후보 시간, 초대 링크 준비 |
| `SCR-02-participant-input` | 참여자 응답 | 4단계 선호 입력, 저장 |
| `SCR-02B-response-complete` | 응답 완료 | 저장 성공, 응답 현황, 수정/재공유 |
| `SCR-03-result-recommendation` | 추천 결과 | fallback 추천 1~2개, 근거, 공유 문구 |
| `SCR-04-insufficient-response` | 응답 부족 | 아직 추천하지 않고 기다릴 이유 표시 |
| `SCR-05-link-expired` | 만료 링크 | 읽기/쓰기 제한 안내 |
| `SCR-06-room-closed` | 확정 완료 | 재계산 금지, 확정 문구 고정 |

기존 패키지의 `SCR-04-copy-builder`는 별도 화면이 아니라 `SCR-03-result-recommendation`의 하위 영역으로 합칩니다.

## 정보 구조

Host result screen hierarchy:

1. 현재 방 상태: 응답 수, 최소 추천 기준, room state.
2. 추천 카드: 시간, confidence, 추천 이유.
3. caveat: `어려워요` 집계, 동점/근소차, 응답 부족.
4. 공유 문구: template 또는 AI-polished label.
5. action: 복사, 링크 공유, 방 닫기.

Participant input hierarchy:

1. 모임명과 예상 소요 시간.
2. 후보 시간 목록.
3. 각 후보의 4단계 선택.
4. 저장 CTA와 수정 가능 안내.
5. 저장 후 "응답 수정 가능" 상태.

## Copy Policy

기본 tone은 Apps in Toss UX writing에 맞춰 해요체를 사용합니다.

좋은 문구:

> 현재 응답 기준으로는 토요일 저녁이 가장 부담이 적어 보여요. 크게 조정할 내용이 없다면 이 시간으로 정리해볼게요.

피해야 할 문구:

> 특별히 어려운 분이 없으면 토요일로 할게요.

이유: 개인에게 압박을 주거나 불참자를 드러내는 느낌이 있습니다.

## AI Label UI

- Template only: `기본 문구`
- AI polished: `AI로 문장을 다듬었어요`
- Fallback: `기본 문구로 만들었어요`

라벨은 공유 문구 영역 상단에 작게 붙입니다. 모달이나 약관식 긴 설명으로 흐름을 막지 않습니다. 최초 AI 사용 시에는 결과 근처에 "AI가 집계 정보만 보고 문장을 다듬어요"를 함께 표시합니다.

## Image Direction

이미지는 앱의 핵심 상태를 설명하는 보조 asset으로만 씁니다. 인물 사진, 회식 사진, 추상 배경보다 "함모여의 추천 결과 카드가 실제로 어떻게 보이는지"를 보여주는 제품 이미지가 우선입니다.

Image generation prompt와 사용 계획은 `docs/design/image-generation-brief.md`에 둡니다. 생성 이미지에는 실명, 전화번호, Toss 로고, 실제 브랜드 로고, 실제 카카오톡 UI를 넣지 않습니다.

## App Sample

현재 프로젝트에 정적 앱 화면을 추가했습니다.

- HTML sample: `docs/mvp/index.html`
- 목적: 앱 화면 상태와 문구 흐름을 확인하는 design sample.
- 범위: GitHub Pages 화면은 브라우저 저장과 OS/브라우저 공유 화면 우선 공유를 사용합니다. 원격 Supabase/DeepSeek 경계는 `src/platform/*`와 `supabase/functions/*`에 연결되어 있으며, Toss login/account 동기화 UI는 아직 별도 단계입니다.
- 직접 진입: `docs/mvp/index.html?screen=scr-03-result-recommendation`
- 기본 상태: `AI_COPY_ENABLED=false`, 즉 AI 라벨은 표시하지 않습니다. GitHub Pages 화면은 AI-polished fixture를 제공하지 않으므로 `?ai=on`도 사용자에게 AI 라벨을 노출하지 않습니다.
- 첫 Apps in Toss 화면은 한국어 단일 UI로 둡니다. 사용자 화면에는 언어 전환 버튼을 두지 않고, 추후 다국어가 필요할 때 locale resource를 다시 여는 방식으로 확장합니다.
- 2026-06-26부터 초대 문구는 친구 공유 링크를 포함합니다. GitHub Pages/브라우저 경로에서는 공개 후보 정보가 담긴 HTTPS 링크로 참여 화면을 열고, Apps in Toss 빌드에서는 ShareAdapter가 `intoss://...` 딥링크 공유로 전환합니다.
- 홈 메인 asset은 `docs/assets/hammoyo-hero-animals.png`를 사용합니다. 화면 배경은 `docs/assets/hammoyo-animal-background.png`를 낮은 대비로 깔고, 같은 생성 이미지에서 잘라낸 개별 캐릭터는 `docs/assets/characters/`에 보관하며, 출처와 생성 기록은 `docs/design/asset-provenance.md`에 남깁니다.
- 모바일 폭에서는 샘플용 화면 선택/토큰 패널을 숨기고 제품 화면만 표시합니다. 데스크톱 폭에서는 QA용 패널을 유지합니다.

## React Bits 결정

현재 프로젝트는 React 앱이 아니며 정적 앱 화면과 platform/backend 경계가 함께 있는 상태입니다. React Bits는 설치하지 않습니다. 향후 React/Vite로 구현할 때도 추천/응답 흐름이 핵심이므로 무거운 애니메이션보다 작은 transition과 reduced-motion 대응만 사용합니다.

## 디자인 QA 기준

- 360px 폭에서 CTA와 긴 한국어 문구가 넘치지 않아야 합니다.
- 결과/응답 부족/만료/closed 상태가 서로 다른 색과 문구로 구분되어야 합니다.
- 추천 근거는 집계값으로만 노출하고 개인을 지목하지 않아야 합니다.
- AI copy 라벨은 실제 AI 결과가 연결된 뒤에만 공유 문구와 같은 시야에 있어야 합니다. template-only 화면에서는 AI 라벨이 없어야 합니다.
- primary action은 하단 thumb zone에 가까워야 합니다.
- `docs/mvp/index.html`은 package token, 9개 화면, query parameter route, sticky CTA, reduced-motion, 한국어 단일 UI, 초대 홈 진입, native share 우선 공유, host dashboard/edit/delete 흐름을 포함해야 합니다.
- 구조 검증은 `npm run build`로 실행합니다.

## Change Log

- 2026-06-24: Supabase/AI 경계 보정과 함께 디자인 계획, 화면 ID, 이미지 계획, 샘플 MVP 위치를 정리.
- 2026-06-24: `HAMMOYEO_DESIGN_PACKAGE`를 디자인 source of truth로 승격하고, 샘플 MVP를 패키지 토큰/8개 화면/AI 조건부 라벨 기준으로 개편.
- 2026-06-24: 샘플 MVP 구현과 Chrome/Playwright 360/390/420 QA 통과 결과를 반영해 상태를 `design-mvp-implemented`로 갱신.
- 2026-06-26: Owner 지시에 따라 MVP 표기를 사용자 화면에서 낮추고, 날짜/시간 picker, 후보 추가/삭제, 일반 공유 링크, 내가 만든 모임 상태판을 디자인 계약에 반영.
- 2026-06-26: 현재 상태를 `app-flow-implemented`로 갱신하고, GitHub Pages 앱 화면과 원격 Supabase/DeepSeek 경계의 역할을 분리해 문서화.
- 2026-06-26: 홈 메인 동물 캐릭터 이미지와 개별 캐릭터 asset을 추가하고, 사용자 화면에서 언어 전환/앱 준비 pill을 제거. 날짜/시간 입력 overflow를 막기 위해 iPhone식 dropdown shell과 `minmax(0, 1fr)` grid 기준을 계약에 반영.
- 2026-06-26: 동물 배경 이미지, 3D 버튼/카드 depth, 초대 홈 진입 카드, native share 우선 공유, 내가 만든 모임 삭제와 로컬 revoked 링크 상태를 반영.
