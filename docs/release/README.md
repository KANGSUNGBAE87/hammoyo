# 함모여 앱 화면 샘플

정적 HTML/CSS/JS로 만든 앱 화면 샘플입니다. GitHub Pages 화면은 Apps in Toss SDK 없이 브라우저 `localStorage`와 공개 친구 공유 링크로 흐름을 확인하고, 실서비스 Supabase/DeepSeek 연결은 `src/platform/`과 `supabase/functions/` 경계에서 관리합니다.

- 열기: `docs/release/index.html`
- 배포 확인: `https://kangsungbae87.github.io/hammoyo/`
- 직접 화면 열기: `docs/release/index.html?screen=scr-00-entry`
- 데모 데이터 화면 열기: `docs/release/index.html?demo=1&screen=scr-03-result-recommendation`
- 목적: `HAMMOYEO_FINAL_DELIVERY` 기준의 방 생성, 참여자 응답, 추천/응답 부족/만료/closed/개인정보 흐름 확인
- 구현된 기능: 방 생성, 모임 이름 자유입력, 예상 인원 선택, 후보 날짜 chip, 낮/저녁/밤 시간 slot, 후보 추가/삭제, 참여자 선호 저장, deterministic 추천, OS/브라우저 공유 화면 우선 공유, 초대 홈 진입, 약속 확정, closed 상태 보존, 내가 만든 모임 상태 확인/수정/삭제, 설정의 로그인 상태/로그아웃, 로컬 데이터 삭제
- 메인 이미지: `assets/hammoyo-hero-animals.png`
- 배경 이미지: `assets/hammoyo-animal-background.png`
- 개별 캐릭터 asset: `assets/characters/`
- 플랫폼 준비 산출물: `src/platform/*.mjs`, `supabase/migrations/20260624_hammoyo_backend.sql`, `supabase/functions/*`, `docs/release/platform-readiness.md`
- 백엔드/AI 연결 코드: `src/platform/supabase-backend-adapter.mjs`, `src/platform/ai-copy-policy.mjs`, `supabase/functions/generate-share-copy/index.ts` (`deepseek-v4-pro` server-only copy polish)
- 현재 제한: GitHub Pages 화면은 Toss account sync 전까지 브라우저 저장을 우선합니다. 같은 브라우저에서는 모임 삭제 후 기존 초대 링크를 revoked 처리하지만, 다른 기기까지 완전 무효화하려면 Apps in Toss 빌드에서 ShareAdapter와 BackendAdapter가 같은 화면 흐름을 Toss deep link/Supabase state lookup으로 연결해야 합니다.
- 제출 전 필요: 공개 개인정보처리방침 URL, 공개 문의 이메일, 데이터 삭제 요청 URL, Apps in Toss 콘솔/샌드박스 검증, Google Play Data safety 입력값 확정
- 제출 전 placeholder 페이지: `docs/release/contact.html`, `docs/release/delete-data.html`
- 기준 문서: `docs/final-delivery/design-plan.md`, `docs/final-delivery/tokens.json`, `ai/plans/design-plan.md`, `ai/plans/implementation-plan.md`
- 검증: `npm run build`, `npm run verify:design`, `npm run verify:functional`, `npm run verify:platform`, `npm run verify:backend-ai`

다음 구현자가 React/Vite 또는 Apps in Toss runtime을 선택할 때 이 샘플을 UI와 순수 추천 로직 reference로 사용합니다.
