---
date: 2026-06-26
actor: codex
topic: app-flow-link-status
---

# 2026-06-26 App Flow, Share Link, Host Status

## User Request

- 함모여는 더 이상 MVP 앱이 아니므로 모든 버튼과 날짜 선택이 동작해야 한다.
- 새 모임 생성/설정 후 일반 공유 링크를 바로 공유할 수 있어야 한다.
- 내가 만든 모임 상태를 항상 체크할 수 있어야 한다.
- Supabase와 AI 연동 상태를 확인해야 한다.

## Decisions

- Public GitHub Pages UI remains browser-first until Toss login/account sync is added, but user-facing copy no longer presents the app as a static MVP preview.
- General share links encode a public room snapshot for recipient entry into the participant response screen.
- Host-created rooms are tracked in browser state as `hostRooms`, with a dedicated "내가 만든 모임" status dashboard.
- Supabase and DeepSeek V4 Pro remain server-side only. Remote smoke confirmed Supabase Edge Functions and AI coordination without exposing secrets to the client.

## Files Changed

- `docs/index.html`
- `docs/mvp/index.html`
- `docs/privacy.html`
- `docs/mvp/privacy.html`
- `docs/contact.html`
- `docs/mvp/contact.html`
- `docs/delete-data.html`
- `docs/mvp/delete-data.html`
- `README.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `docs/release/platform-readiness.md`
- `scripts/verify-mvp-design.mjs`
- `scripts/verify-mvp-functional.mjs`
- `scripts/verify-platform-readiness.mjs`

## Verification

- `npm run verify:functional`
- `npm run verify:design`
- `npm run smoke:remote`
- Live DeepSeek coordination smoke through Supabase Edge Function: passed with `method=ai` and audit row creation.
- Browser QA through Playwright file URL: create room, edit date/time, add candidate, copy/open general share link, participant submit, host dashboard, mobile overlap check.
- `npm run build`
- Final rerun after copy/package cleanup: `npm run build`, `npm run smoke:remote`, and live DeepSeek coordination smoke all passed.

## Remaining Risks

- General share links intentionally expose room title and candidate times to anyone with the link.
- Participant responses opened from a general share link do not sync back to the host dashboard until Toss login/account sync or a Supabase-backed room session UI is attached.
- Apps in Toss sandbox login, public support email, external privacy URL, and data deletion URL still need final release values before store submission.

## Knowledge Promotion

- No new global rule promoted. The session follows existing app platform, Supabase, AI, and project artifact rules.
