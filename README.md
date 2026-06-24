# 함모여 기능 MVP 샘플

정적 HTML/CSS/JS로 만든 기능 MVP 샘플입니다. 실제 Apps in Toss SDK, Supabase, AI 호출, 실공유 링크는 연결하지 않았고, 화면의 방/응답/추천 상태는 브라우저 `localStorage`에만 저장합니다.

- 열기: `docs/mvp/index.html`
- 배포 확인: `https://kangsungbae87.github.io/hammoyo/`
- 직접 화면 열기: `docs/mvp/index.html?screen=scr-00-entry`
- 영어 preview 열기: `docs/mvp/index.html?lang=en`
- 데모 데이터 화면 열기: `docs/mvp/index.html?demo=1&screen=scr-03-result-recommendation`
- 목적: `HAMMOYEO_DESIGN_PACKAGE` 기준의 방 생성, 참여자 응답, 추천/응답 부족/만료/closed/개인정보 흐름 확인
- 구현된 기능: 방 생성, 후보 시간 입력, 참여자 선호 저장, deterministic 추천, preview 전용 초대/추천/확정 문구 복사 fallback, 약속 확정, closed 상태 보존, ko/en 언어 전환, 로컬 데이터 삭제
- 플랫폼 준비 산출물: `src/platform/*.mjs`, `supabase/migrations/20260624_hammoyo_backend.sql`, `supabase/functions/*`, `docs/release/platform-readiness.md`
- 백엔드/AI 연결 코드: `src/platform/supabase-backend-adapter.mjs`, `src/platform/ai-copy-policy.mjs`, `supabase/functions/generate-share-copy/index.ts` (`deepseek-v4-pro` server-only copy polish)
- 현재 제한: 초대 문구는 실제 참여 링크를 만들지 않습니다. ShareAdapter와 Supabase/backend가 연결되기 전까지는 같은 브라우저에서 흐름 확인용 preview 문구로만 사용합니다.
- 제출 전 필요: 공개 개인정보처리방침 URL, 공개 문의 이메일, 데이터 삭제 요청 URL, Apps in Toss 콘솔/샌드박스 검증, Google Play Data safety 입력값 확정
- 제출 전 placeholder 페이지: `docs/mvp/contact.html`, `docs/mvp/delete-data.html`
- 기준 문서: `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_CODEX_DESIGN_BRIEF.md`, `HAMMOYEO_DESIGN_PACKAGE/HAMMOYEO_DESIGN_TOKENS.json`, `ai/plans/design-plan.md`, `ai/plans/implementation-plan.md`
- 검증: `npm run build`, `npm run verify:design`, `npm run verify:functional`, `npm run verify:platform`, `npm run verify:backend-ai`

다음 구현자가 React/Vite 또는 Apps in Toss runtime을 선택할 때 이 샘플을 UI와 순수 추천 로직 reference로 사용합니다.
