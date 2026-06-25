# 2026-06-26 UX Flow Hardening

Actor: codex

## User Request

서브에이전트와 스킬을 활용해 이전 UX/시장성 리뷰 개선사항을 모두 구현.

## Decisions Made

- 모바일 하단 CTA는 fixed overlay 대신 화면 내부 footer + scrollable body 구조로 변경했다.
- 프로덕션 기본 화면에서는 SCR/debug 패널을 숨기고 `?debug=1`에서만 노출한다.
- 공백 참여자명은 명시적으로 익명 저장하되, 응답 수정은 `lastResponseId`로 기존 응답을 업데이트한다.
- 별도 리마인드 문구 복사 CTA를 추가하되, 응답이 충분하면 리마인드 대신 추천 결과로 이동한다.
- 추천 결과에는 trust panel과 추천 이유 문구를 추가했다.
- 설정 화면에서 개인정보처리방침, 문의, 계정/서버 데이터 삭제 요청, 로컬 데이터 삭제 경로를 분리했다.
- 작성 중 홈/설정/언어 전환/히스토리 이동은 확인을 거치도록 했다.

## Subagents

- `code-mapper`: button routing, sticky CTA, debug panel, test target mapping.
- `toss-compliance-auditor`: Apps in Toss/Google Play readiness and lightweight market UX recommendations.
- `reviewer`: diff review; found anonymous overwrite, dirty locale/history gaps, need=0 reminder copy.
- `live-qa-runner`: local static browser QA; found CTA overlay and response-edit duplication before remediation.

## Files Changed

- `docs/index.html`
- `docs/mvp/index.html`
- `docs/privacy.html`
- `docs/mvp/privacy.html`
- `docs/contact.html`
- `docs/mvp/contact.html`
- `docs/delete-data.html`
- `docs/mvp/delete-data.html`
- `scripts/verify-mvp-functional.mjs`
- `scripts/verify-platform-readiness.mjs`

## Verification

- `npm run verify:functional` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Local static browser QA passed on `http://127.0.0.1:8765/` for 320, 390, and 1024 width checks.

## Remaining Risks

- Real Apps in Toss deep-link share still needs sandbox/device validation.
- Real account/server deletion flow must be rechecked when Toss login/Supabase account UI becomes user-facing.
- Live market validation is still unproven; previous Planning Lab caveat of zero real responses remains.

## Knowledge Promotion

No new cross-project rule is promoted in this log. Existing app-platform and Graphify workflow rules were followed.
