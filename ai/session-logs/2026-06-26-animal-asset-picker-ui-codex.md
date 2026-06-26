---
date: 2026-06-26
actor: codex
topic: animal-asset-picker-ui
---

# 2026-06-26 Animal Asset And Picker UI

## User Request

- Use the generated animal group image as the main home image.
- Save each character as an individual reusable asset.
- Explain copyright risk and keep provenance.
- Fix the date/time picker box overflowing out of the candidate card.
- Make date/time selection feel closer to an iPhone-style dropdown/alarm picker.
- Remove language/app-ready surface controls from the user-facing screen.

## Decisions

- The home screen now uses a newly generated animal illustration, not an external stock or existing IP reference.
- Asset provenance is recorded in `docs/design/asset-provenance.md`; Apps in Toss release should still re-check whether AI-generated image disclosure is required.
- First Apps in Toss UI is Korean-only. User-facing language toggle and app-ready pill are removed.
- The overflow root cause was narrow-grid sizing plus native date/time input affordances. Candidate date/time fields now use an `AppleDateTimePicker` shell with `min-width: 0`, `minmax(0, 1fr)` grid behavior, and hidden native indicator overlap.
- Host-created rooms can be edited from "내가 만든 모임", including title, expected count, date, time, and place/note.

## Files Changed

- `docs/index.html`
- `docs/mvp/index.html`
- `docs/assets/hammoyo-hero-animals.png`
- `docs/assets/characters/*`
- `docs/mvp/assets/hammoyo-hero-animals.png`
- `docs/mvp/assets/characters/*`
- `docs/design/asset-provenance.md`
- `docs/mvp/README.md`
- `docs/release/platform-readiness.md`
- `README.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `scripts/verify-mvp-design.mjs`
- `scripts/verify-mvp-functional.mjs`

## Verification

- `npm run build` passed.
- `git diff --check` passed.
- Playwright visual/layout QA:
  - home hero image loaded from `assets/hammoyo-hero-animals.png` at 720x720 source resolution.
  - `Converging Orbit`, `EN`, and `앱 준비` are absent from the user-facing home screen.
  - host-room candidate date/time picker overflow checked at 390, 414, 430, and 460 px: horizontal overflow 0 px and picker right edge stayed inside card.
  - no console errors during the checked flows.

## Remaining Risks

- This is not legal advice. Copyright risk is lowered by using a fresh generated image with no named brands, logos, or existing character references, but final store submission should still check Apps in Toss policy wording for AI-generated art.
- GitHub Pages still runs browser-first state until Toss login/account sync is attached to the live Supabase room state.

## Knowledge Promotion

- No new cross-project global rule promoted. This is project-local Hammoyo UI and asset provenance.
