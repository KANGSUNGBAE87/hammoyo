# 2026-06-27 GitHub Pages Deploy

Actor: codex
Date: 2026-06-27 KST

## User Request

- Deploy the current Hammoyo state to GitHub.
- Explain the current product plan, implementation state, and design plan in detail.

## Decisions Made

- GitHub Pages source is `main` branch `/docs`, so deployment should push the current `main` branch rather than the older `gh-pages` branch.
- No pull request was opened because the user asked to deploy the current state directly.

## Files Changed

- No product code was changed in this deploy log step.
- The deployed product changes are in commit `9b34918` and include app-flow UI, animal assets, native share, invite-home entry, host dashboard delete/edit, and updated verification contracts.

## Commands And Verification

- `npm run build` passed before deployment.
- `git diff --cached --check` passed before commit.
- `git push origin main` pushed commit `9b34918`.
- GitHub Pages latest build reported `built` for commit `9b349181dd51a7abc5918531e370fd49e31507f6`.
- Live URL checked: `https://kangsungbae87.github.io/hammoyo/`.
- Live HTML contains new markers: `hammoyo-animal-background`, `친구한테 공유하기`, `초대가 도착했어요`.
- Live HTML no longer contains old markers: `앱 준비`, `기능 MVP`, `Converging Orbit`.
- Live image assets returned HTTP 200 for:
  - `/assets/hammoyo-animal-background.png`
  - `/assets/hammoyo-hero-animals.png`

## Remaining Risks

- GitHub Pages app state is still browser-local until Toss login/account sync is connected to the production app shell.
- Deleted invite links are revoked across the same browser state; cross-device revocation must use Supabase invite/room lookup.
- Apps in Toss sandbox evidence, public privacy/contact/delete values, and Toss secure worker/mTLS path remain release blockers.

## Next Steps

- Connect Toss login/account UI to `SupabaseBackendAdapter`.
- Use Supabase-backed invite lookup for shared links before store submission.
- Run Apps in Toss sandbox QA after app id/deep link settings are available.

## Knowledge Promotion

- No new cross-project rule was created. Existing Hammoyo deployment state remains project-local.
