# 2026-06-25 GitHub Current-State Deploy

Actor: codex

## User Request

- "현재 상태로 깃헙에 배포해줘"

## Actions

- Verified the current 최종출시제품 with `npm run build`.
- Verified deployed Supabase Edge Functions with `npm run smoke:remote`.
- Scanned commit candidates for obvious secret/credential patterns without printing secret values.
- Committed and pushed the project source to `origin/main`.
- Deployed the static 최종출시제품 preview to GitHub Pages.
- Switched GitHub Pages source to `main` / `/docs` after the existing `gh-pages` legacy build got stuck/errored.
- Mirrored `docs/release/*.html` to `docs/*.html` so the Pages root and public policy/contact/delete paths resolve directly.

## Verification

- `npm run build` passed.
- `npm run smoke:remote` passed.
- GitHub Pages status: `built`.
- Live URL: `https://kangsungbae87.github.io/hammoyo/`
- Live root HTML hash matched local `docs/index.html`.
- `privacy.html` returned HTTP 200.

## Files Changed In This Session

- `.gitignore`
- `docs/.nojekyll`
- `docs/index.html`
- `docs/contact.html`
- `docs/delete-data.html`
- `docs/privacy.html`
- `ai/session-logs/2026-06-25-github-current-state-deploy-codex.md`

## Remaining Risks

- GitHub Pages is a static preview only; production Apps in Toss / Google Play release still needs real public contact/privacy/delete endpoints, Toss auth exchange hardening, and store review evidence.
- `gh-pages` branch contains a prior fallback deployment, but active Pages source is now `main` / `/docs`.

## Knowledge Promotion

- No new cross-project reusable rule was created. No additional knowledge-store promotion required.
