# 2026-06-28 Server Invite Anonymous Hardening

Actor: codex
Date: 2026-06-28 KST

## User Request

- Implement all remaining items that do not require user intervention.
- Use subagents.
- Remaining items were server-backed invite/status lookup, deleted/expired/closed canonical state, anonymous participant response/edit model, candidate slot ownership validation, and latest local changes not yet committed/deployed.

## Subagents Used

- `code-mapper` mapped current Supabase functions, migration, adapter, verification scripts, and dirty-worktree risks.
- `reviewer` confirmed the same blockers before implementation: no `lookup-room`, no anonymous participant path, no candidate-slot ownership validation.
- `reviewer` re-checked the implementation and found one remaining duplicate-risk path: a participant who first responded anonymously could later submit while signed in and accidentally create a separate authenticated response row. Codex changed `join-room` and `submit-response` to prefer the supplied anonymous participant key over the signed session for that request and added remote smoke coverage.
- `reviewer` ran a final read-only re-review after the fix and reported no remaining blockers for joinable status consistency, anonymous-key reuse, candidate ownership validation, or deleted/closed/expired write locks.

## Decisions

- Keep GitHub Pages static preview usable with base64 snapshot fallback because it has no runtime Supabase env.
- Implement the real Apps in Toss/Supabase path through Edge Functions and adapter:
  - `lookup-room` for side-effect-free invite status lookup.
  - `delete-room` for host soft-delete and shared link invalidation.
  - anonymous participant key issuance/hash/reuse for login-free participant join/respond/edit.
  - function-level and DB-trigger-level candidate-slot ownership validation.
- Remote Supabase apply/deploy and `smoke:remote` were later run in this turn after local verification passed.

## Files Changed

- `supabase/migrations/20260628_hammoyo_invite_status_anonymous_hardening.sql`
- `supabase/functions/_shared/hammoyo/security.ts`
- `supabase/functions/_shared/hammoyo/rooms.ts`
- `supabase/functions/lookup-room/index.ts`
- `supabase/functions/delete-room/index.ts`
- `supabase/functions/join-room/index.ts`
- `supabase/functions/submit-response/index.ts`
- `supabase/functions/close-room/index.ts`
- `supabase/functions/recompute-recommendation/index.ts`
- `src/platform/supabase-backend-adapter.mjs`
- `scripts/verify-backend-ai.mjs`
- `scripts/verify-platform-readiness.mjs`
- `scripts/smoke-remote-functions.mjs`
- `ai/plans/implementation-plan.md`
- `ai/reviews/review.md`

## Implemented

- Added additive migration for:
  - `hammoyo_rooms.status = deleted`
  - `deleted_at`, `deleted_by_core_user_id`, `deleted_reason`
  - `hammoyo_room_members.participant_kind`
  - hashed anonymous key storage
  - member primary key/unique constraints for authenticated and anonymous participants
  - response `member_id`
  - `hammoyo_validate_response_preference_room` trigger to reject cross-room or inactive candidate preferences.
- Added shared room status helper with `canonicalRoomStatus`.
- Added anonymous participant key generation and hashing.
- Added `lookup-room` Edge Function.
- Added `delete-room` Edge Function.
- Updated `join-room` to allow signed or anonymous participants.
- Updated `submit-response` to allow signed or anonymous participants, reuse the same response row for the same anonymous key even when the request also has a signed session, and reject invalid candidate slots before write.
- Updated `close-room` and `recompute-recommendation` to treat deleted rooms as terminal.
- Updated `SupabaseBackendAdapter` with `lookupRoom` and `deleteRoom`.
- Expanded backend/platform verification and remote smoke script to cover the new path.

## TDD / Verification

Red checks before implementation:

- `npm run verify:backend-ai` failed for missing `lookup-room` and `delete-room`.
- `npm run verify:platform` failed for missing deleted status, anonymous fields, anonymous unique key, and candidate ownership DB trigger.

Green checks after implementation:

- `npm run verify:backend-ai` passed.
- `npm run verify:platform` passed.
- `npm run build` passed.
- `node --check` passed for changed Edge Function files and changed JS verifier/adapter/smoke files.

Could not run:

- `deno check` because `deno` is not installed in this local shell.

Remote apply/deploy/smoke:

- Applied `supabase/migrations/20260628_hammoyo_invite_status_anonymous_hardening.sql` to the linked shared Supabase project.
- Deployed `lookup-room`, `delete-room`, `join-room`, `submit-response`, `close-room`, and `recompute-recommendation` with `--no-verify-jwt`.
- `npm run smoke:remote` passed with:
  - create-room
  - lookup-room
  - anonymous join
  - anonymous submit/edit
  - signed session plus anonymous key response reuse
  - candidate ownership rejection
  - recompute
  - delete-room
  - deleted lookup/write lock
  - deletion-revokes-session

## Remaining

- Decide P1 scope for `negotiating`/`ready_to_confirm` and server-backed `update-room`.
- Commit/push the local repo work when requested. Supabase migration/function deployment is complete.

## Knowledge Promotion

- No cross-project rule was created. This is project-local implementation state.
