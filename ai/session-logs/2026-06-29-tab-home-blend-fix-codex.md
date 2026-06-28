---
date: 2026-06-29
actor: codex
topic: tab home blend fix
---

# Tab And Home Blend Fix

## User Request

- Bottom tab character images looked like rectangular cutouts pasted into each tab.
- Home hero group image still read as a rectangular image block rather than part of the background.
- Tab text should be centered and stay one line.
- Home status should not hide the fact that there are multiple hosted rooms.
- If needed, generate or adjust image assets for the bottom tab and background.

## Investigation

- `sips` confirmed the PNG files have alpha, but visual inspection showed the character assets still contain mostly white internal backgrounds.
- A one-off browser canvas background-removal attempt was tested, but it removed the white character body along with the white background. That generated output was discarded and deleted.
- Root cause was split:
  - CSS gave each nav item and label its own pale card/plate, amplifying the pasted-rectangle feel.
  - The global `AnimalBackground` reused the same group hero image, causing duplicated image layers.
  - Home only showed the active/current room title, while `hostRooms` could contain multiple hosted rooms.

## Decisions

- Keep original image assets, but blend them with CSS rather than relying on destructive background removal.
- Remove the group hero image from the app-wide background; keep the group image only in the home poster scene.
- Use `mix-blend-mode: multiply`, lower opacity, and radial masks on bottom-tab art to reduce visible rectangular boundaries.
- Remove individual tab card backgrounds and white label plates; tab text is centered, dark, and one-line.
- Center the home hero copy and remove the privacy-copy backing plate.
- Add `HomeHostedRooms` compact rows so home can show multiple hosted room titles and progress.
- When multiple hosted rooms exist, home title becomes `내 모임 N개` and metrics aggregate response/candidate counts across hosted rooms.

## Files Changed

- `docs/release/index.html`
- `docs/index.html`
- `scripts/verify-release-functional.mjs`
- `ai/session-logs/2026-06-29-tab-home-blend-fix-codex.md`

## Verification

- `npm run verify:functional` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Screenshot checked:
  - `/tmp/hammoyo-blended-final-home-2rooms-390.png`

## Remaining Risks

- The original character assets still have white interiors, so CSS blending reduces but cannot perfectly remove all source-image background traces.
- Fully transparent character cutouts likely require proper generated assets or a manual design pass, because automatic white-background removal also removes the white animal bodies.
