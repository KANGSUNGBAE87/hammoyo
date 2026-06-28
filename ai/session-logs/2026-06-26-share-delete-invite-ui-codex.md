---
date: 2026-06-26
actor: codex
topic: share-delete-invite-ui
---

# 2026-06-26 Share, Delete, Invite Home UI

## User Request

- Add meeting deletion from the saved meeting/status dashboard.
- Deleted meetings should make previously shared invite links unavailable.
- Invite recipients should land on the same home UI and clearly see that an invite needs a response.
- Replace copy-only link behavior with a general/native share screen where the user can choose an app or copy.
- Remove app-ready/최종출시제품 feeling from the user-facing UI.
- Make buttons feel more clickable and 3D.
- Add a cute animal background matching the existing generated animal assets.
- Use subagents for implementation review.

## Subagent Findings Used

- Two read-only subagents reviewed the current UI and agreed on three must-fix items:
  1. Base64 snapshot invite links could not be invalidated by deletion.
  2. Invite links forced direct participant input instead of a home invite context.
  3. "친구한테 공유하기" was copy-only and over-promised real sharing.
- Both noted that full cross-device invite invalidation requires backend/Supabase lookup; the static GitHub Pages app can only simulate revocation in the current browser state.

## Decisions

- GitHub Pages links now open `screen=scr-00-entry&join=...`, so invite recipients see the normal home screen with an incoming invite card and response CTA.
- `navigator.share` is used first for sharing; clipboard copy remains as fallback when native share is unavailable.
- Meeting deletion records the room id in `revokedRoomIds`, removes it from `hostRooms`, clears the active room if needed, and routes old links to the expired/deleted state in the same browser.
- 3D button/card treatment was added with thicker shadows, gradient faces, pressed offsets, and raised action pills.
- `hammoyo-animal-background.png` is used as a low-contrast background layer behind the app.

## Files Changed

- `docs/index.html`
- `docs/release/index.html`
- `docs/assets/hammoyo-animal-background.png`
- `docs/release/assets/hammoyo-animal-background.png`
- `docs/design/asset-provenance.md`
- `README.md`
- `docs/release/README.md`
- `docs/release/platform-readiness.md`
- `ai/plans/design-plan.md`
- `ai/plans/implementation-plan.md`
- `scripts/verify-release-design.mjs`
- `scripts/verify-release-functional.mjs`

## Verification

- `npm run build` passed.
- `git diff --check` passed.
- Playwright visual/layout QA:
  - home background and 3D buttons render without horizontal overflow.
  - dashboard shows status/edit/share/delete actions.
  - share action sends a payload to `navigator.share`.
  - invite link opens home with `초대가 도착했어요` and `초대 응답하기`.
  - deleted meeting removes dashboard card and routes the old link to the expired/deleted state in the same browser.

## Remaining Risks

- Static GitHub Pages cannot revoke already-shared links across other devices because the URL still carries a snapshot. Production Apps in Toss/Supabase must resolve invite slug/server state before rendering the participant flow.
- Public privacy/contact/delete URLs remain release blockers before store submission.

## Knowledge Promotion

- No new cross-project global rule promoted. This is project-local Hammoyo app behavior and UI state.
