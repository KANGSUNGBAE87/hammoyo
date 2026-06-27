import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { canonicalRoomStatus, isJoinableRoom } from "../_shared/hammoyo/rooms.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import {
  generateAnonymousParticipantKey,
  hashAnonymousParticipantKey,
  readOptionalActiveSession,
} from "../_shared/hammoyo/security.ts";

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const session = await readOptionalActiveSession(supabase, request);
    const { inviteSlug, displayAlias = "참여자", anonymousParticipantKey } = await parseJson(request);
    const normalizedInviteSlug = typeof inviteSlug === "string" ? inviteSlug.trim() : "";
    if (!normalizedInviteSlug) return jsonError("INVITE_SLUG_REQUIRED", "inviteSlug is required.");

    const room = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .select("id, status, expires_at, closed_at, deleted_at")
        .eq("invite_slug", normalizedInviteSlug)
        .maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Invite room was not found.", 404);
    const status = canonicalRoomStatus(room);
    if (!isJoinableRoom(room)) {
      return jsonError("ROOM_NOT_JOINABLE", "This room is no longer accepting participants.", 409);
    }

    const requestedAnonymousParticipantKey =
      typeof anonymousParticipantKey === "string" && anonymousParticipantKey.trim() ? anonymousParticipantKey.trim() : "";
    const shouldUseAnonymousParticipant = Boolean(requestedAnonymousParticipantKey) || !session.ok;
    const issuedAnonymousParticipantKey = shouldUseAnonymousParticipant
      ? requestedAnonymousParticipantKey || generateAnonymousParticipantKey()
      : null;
    const anonymousKeyHash = issuedAnonymousParticipantKey
      ? await hashAnonymousParticipantKey(room.id, issuedAnonymousParticipantKey)
      : null;

    const member = await runQuery(
      !shouldUseAnonymousParticipant && session.ok
        ? supabase
            .from("hammoyo_room_members")
            .upsert(
              {
                room_id: room.id,
                core_user_id: session.coreUserId,
                role: "participant",
                display_alias: String(displayAlias).slice(0, 40),
                participant_kind: "authenticated",
                anonymous_key_hash: null,
                deleted_at: null,
              },
              { onConflict: "room_id,core_user_id" },
            )
            .select("id, room_id, core_user_id, role, participant_kind")
            .single()
        : supabase
            .from("hammoyo_room_members")
            .upsert(
              {
                room_id: room.id,
                core_user_id: null,
                role: "participant",
                display_alias: String(displayAlias).slice(0, 40),
                participant_kind: "anonymous",
                anonymous_key_hash: anonymousKeyHash,
                deleted_at: null,
              },
              { onConflict: "room_id,anonymous_key_hash" },
            )
            .select("id, room_id, role, participant_kind")
            .single(),
    );

    return jsonResponse({
      ok: true,
      operation: "joinRoom",
      roomId: room.id,
      canonicalRoomStatus: status,
      anonymousParticipantKey: issuedAnonymousParticipantKey,
      member,
    });
  } catch (error) {
    return serverError(error);
  }
});
