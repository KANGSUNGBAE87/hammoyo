# 2026-06-24 Predeploy 최종출시제품 Hardening

Actor: codex

## User Request

현재 기능 최종출시제품을 배포 전 완성 단계에 가깝게 보완하고, 서브에이전트를 활용해 구현을 시작해 달라는 요청.

## Decisions Made

- 오른쪽 desktop sample selector는 계속 샘플/QA 패널로 유지하고, 실제 모바일 제품 경로에는 상단 `홈`과 `개인정보` 버튼을 추가했다.
- 실제 공유 링크/ShareAdapter가 없으므로 CTA를 `공유하기`가 아니라 `복사하기` 의미로 낮췄다.
- 실제 AI 생성이 없으므로 `?ai=on` query만으로 AI 라벨이 노출되지 않게 했다.
- 샘플 응답 주입은 기본 사용자 경로에서 숨기고 `?demo=1`에서만 노출되게 분리했다.
- `expired`/`closed` direct route는 기본 사용자 경로에서 persisted state를 오염시키지 않게 막고, demo 경로에서만 상태 가드 검증용으로 사용했다.
- localStorage-only 최종출시제품 범위와 삭제 경로를 `SCR-07 개인정보` 화면에 명시했다.

## Files Changed

- `docs/release/index.html`
  - 모바일 상단 홈/개인정보 경로 추가
  - `SCR-07 개인정보` 화면 및 `로컬 데이터 지우기` 추가
  - CTA 카피와 clipboard-copy 동작 정합성 보정
  - AI 라벨 query-param 노출 차단
  - demo seed CTA를 `?demo=1`로 격리
  - expired/closed route guard와 all-excluded 상태 보강
  - 모바일 fixed bottom CTA/safe-area 보정
- `scripts/verify-release-functional.mjs`
  - 모바일 nav/privacy/delete, AI label, demo seed, expired guard, CTA visibility 회귀 검증 추가
- `scripts/verify-release-design.mjs`
  - 최신 CTA 카피와 `SCR-07` 디자인 계약 반영
- `ai/reviews/review.md`
  - 최신 배포 전 기능 보완 QA와 잔여 리스크 추가

## Verification Run

- `npm run verify:functional`
  - 최초 RED: `topbar-home-button` 부재로 실패
  - 구현 후 통과
- `npm run verify:design`
  - 최초 RED: 이전 CTA `이 안으로 공유하기` 기대값으로 실패
  - 검증 계약 갱신 후 통과
- `npm run build`
  - `HAMMOYEO 최종출시제품 design verification passed.`
  - `[기능 계약 검증기] 통과`
- 추가 Playwright 점검
  - 390x740 result: 홈/개인정보/복사/확정 버튼 노출, AI 라벨 없음, overflow 0, console error 없음
  - 320x740 home/settings/delete: privacy 진입 및 localStorage 삭제 확인, overflow 0, console error 없음
  - 1024x768 desktop result: sample selector 유지, `SCR-07` 탭 포함

## Subagents

- `reviewer`: 사전 acceptance checklist와 회귀 위험 정리.
- `reviewer`: 사후 리뷰에서 기본 샘플 응답 노출, `SCR-06` 직접 진입 확정 상태 생성, 확정 copy 문구 불일치, dead AI label 경로를 blocker로 지적했다.
- `toss-compliance-auditor`: 초대 copy에 실제 URL 부재, 확정 copy가 추천 문구와 동일한 문제, 개인정보 정책/문의/보관 기준 부재를 blocker로 지적했다.
- `live-qa-runner`: 모바일 핵심 경로는 통과했지만 1024x768 데스크톱 결과 화면에서 CTA가 첫 뷰포트 아래로 밀리는 문제를 지적했다.

## Follow-up Fixes From Subagent Review

- 기본 진입은 빈 방 상태로 시작하고, 샘플 응답은 `?demo=1`에서만 주입되게 변경했다.
- 초대/추천/확정 copy payload를 분리했다. 초대 문구에는 실제 참여 URL을 넣지 않고 `preview 전용` 경계 문구를 넣으며, 확정 문구에는 `확정됐어요` 톤을 사용하고 추천용 `가장 현실적인 약속안` 문구를 섞지 않는다.
- `SCR-06` 직접 진입은 `?demo=1`이 아니면 closed 상태를 만들지 않도록 막았다.
- `docs/release/privacy.html`을 추가하고 `SCR-07 개인정보`에서 정책 문서, 보관/삭제/문의 기준을 확인할 수 있게 했다.
- 1024x768 데스크톱 결과 화면에서도 주요 CTA가 첫 뷰포트 안에 들어오도록 `.phone` preview를 sticky/internal-scroll 컨테이너로 조정했다.

## Final Verification After Follow-up

- `npm run verify:functional`
  - 통과: seedless default, demo-only seed, 초대/추천/확정 copy payload, `SCR-06` direct route guard, expired write guard, privacy link/delete, 320px/1024px CTA visibility.
- `npm run build`
  - `HAMMOYEO 최종출시제품 design verification passed.`
  - `[기능 계약 검증기] 통과`
- 직접 Playwright spot check
  - 1024x768 result 화면에서 primary CTA bottom이 768px viewport 안에 들어오는 것을 확인했다.

## Remaining Risks

- 실제 Apps in Toss shell의 back/close/safe-area는 아직 토스앱에서 검증하지 않았다.
- Toss login, Supabase/RLS, 실제 ShareAdapter, Google Play build, AI provider 호출은 아직 미구현이다.
- 현재 `docs/release/privacy.html`은 preview용 정적 정책이다. Google Play/Apps in Toss 제출 전 실제 공개 URL, 운영자 연락처, 계정/데이터 삭제 접수 경로를 확정해야 한다.

## Knowledge Promotion

- 현재 변경은 프로젝트 구현/QA 사실로 충분하며, cross-project 지식저장소 승격은 필요하지 않다.

## 2026-06-24 Duo Review Remediation

### User Request

Superpowers, gstack, and subagents를 활용해 현재 부족한 부분을 리뷰하고, 리뷰 때는 서로 다른 모델/역할의 서브에이전트 2개씩 붙여 취합한 뒤 리뷰대로 구현해 달라는 요청.

### Review Method

- Superpowers: `subagent-driven-development`, `test-driven-development`, `requesting-code-review`, `verification-before-completion` 흐름을 적용했다.
- gstack: fresh repo라 일반 PR diff review는 그대로 적용하기 어려워, 현재 파일 상태와 자동 검증을 기준으로 pre-landing review 방식으로 적용했다.
- 리뷰 페어 1: `reviewer` + `live-qa-runner`로 코드/UX 경로를 검토했다.
- 리뷰 페어 2: `toss-compliance-auditor` + `docs-researcher`로 Apps in Toss / Google Play / privacy / i18n 기준을 검토했다.
- 외부 Claude/Gemini 라우팅은 현재 Codex 네이티브 subagent 도구에서 직접 호출하지 못해, Codex subagent 역할/모델 조합으로 degraded mode 실행했다.

### Review Findings Implemented

- 기본 진입이 가짜 최근 방을 보여주던 문제를 고쳐, 저장된 room이 없으면 `room: null` 상태와 `저장된 모임이 아직 없어요` 안내를 보여준다.
- `?demo=1` fixture와 실제 기본 상태를 분리했다.
- 초대 문구가 실제 참여 URL처럼 보이던 false promise를 제거했다. ShareAdapter/Supabase 연결 전까지는 `preview 전용` 문구를 복사한다.
- `SCR-05` 직접 진입이 persisted room을 `expired`로 바꾸던 상태 오염을 제거했다.
- `SCR-02B` 직접 진입은 실제 제출 기록이나 `?demo=1`이 없으면 성공 화면을 보여주지 않는다.
- Clipboard API와 DOM fallback이 모두 실패하면 `복사하지 못했어요` 상태를 보여준다.
- `locale-ko`/`locale-en` resource와 상단 언어 전환 버튼을 추가했다.
- `docs/release/privacy.html`에 정적 최종출시제품 preview badge, 계정 삭제 없음, 제출 전 공개 문의 이메일/외부 privacy URL/데이터 삭제 URL placeholder를 명시했다.
- `docs/release/README.md`, `README.md`, `ai/plans/design-plan.md`, `ai/reviews/review.md`를 현재 구현과 맞췄다.

### TDD Evidence

- RED: `npm run verify:functional` 실패
  - `language-toggle-button`이 없어 timeout.
  - 새 검증 계약에는 fake recent room, real invite URL false promise, expired direct mutation, response-complete direct success, copy failure status, `lang=en` 경로가 포함됐다.
- GREEN: 구현 후 `npm run verify:functional` 통과.
- Build: `npm run build` 통과.

### Post-review Blockers Closed

- `demo=1` 상호작용이 일반 저장소 `hammoyo:release:v1`을 오염시키던 문제를 막기 위해 `hammoyo:release:demo:v1` 별도 demo storage key를 추가했다.
- `loadState()`, `saveState()`, `clearLocalData()`가 일반/demo 저장소를 구분하도록 정리했다. `reset=1`과 로컬 데이터 삭제는 현재 모드의 저장소 key만 정리해 demo 경로가 일반 저장소를 삭제하지 않는다.
- 초대/추천/확정 copy payload를 locale template 기반으로 옮겼다. `lang=en` 결과 화면과 copy payload는 `most workable option so far` 문구를 포함하고 한국어 추천 문구를 노출하지 않는다.
- 결과 화면 핵심 라벨, confidence, metric, candidate summary, copy 상태를 locale resource로 이동했다.
- `docs/release/privacy.html`에 English summary와 제출 전 data-deletion URL caveat를 추가했다.
- 기능 검증에 demo 저장소 오염 방지, English result/copy payload, bilingual privacy caveat를 추가했다.
- 최종 사후 리뷰에서 잡힌 demo `reset=1`/개인정보 삭제의 일반 저장소 삭제 오염을 막고, 일반 저장소가 이미 있는 상태에서도 demo reset/clear가 이를 보존하는 검증을 추가했다.
- live QA에서 잡힌 English result/copy payload 내 한국어 demo fixture 혼입을 막기 위해 demo room title/candidate/deadline fixture를 locale-aware로 분리했다.
- `privacy.html` 모바일 overflow를 막기 위해 문서 CSS에 border-box sizing과 safe wrapping을 추가했고, 320/390px privacy overflow 검증을 기능 계약에 추가했다.
- 최종 live QA의 non-blocking favicon 404를 없애기 위해 `privacy.html`에도 data favicon link를 추가했다.

### Final Verification After Duo Follow-up

- `npm run verify:functional`
  - 통과: demo 상호작용 후 normal storage 미오염, 일반 홈 empty state 유지, English result/copy payload localization, privacy English summary/caveat, 기존 방 생성/응답/추천/닫힘 플로우.
  - 추가 통과: normal storage가 있는 상태에서 demo `reset=1`과 demo `로컬 데이터 지우기`가 normal storage를 삭제하지 않음.
  - 추가 통과: English recommendation card/copy payload에 한글 demo fixture 문자가 섞이지 않음, `privacy.html` 320/390px horizontal overflow 없음.
  - 추가 통과: `index.html`과 `privacy.html` 모두 data favicon link 존재.
- `npm run verify:design`
  - `HAMMOYEO 최종출시제품 design verification passed.`
- `npm run build`
  - `HAMMOYEO 최종출시제품 design verification passed.`
  - `[기능 계약 검증기] 통과`

### Remaining Risks

- 실제 공유 링크, Toss login, Supabase/RLS, AI 문구 생성, Apps in Toss 실기기 shell/back/safe-area, Google Play build는 아직 미구현/미검증이다.
- 현재 i18n은 핵심 screen copy, 결과/metric/copy 상태, privacy 중심이다. production app 전환 시 세부 form label과 demo fixture/date label도 locale resource로 더 옮겨야 한다.
- 공개 privacy URL, 운영자 이메일, 데이터 삭제 요청 URL은 아직 placeholder다.
