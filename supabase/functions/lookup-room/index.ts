import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { canonicalRoomStatus, isJoinableRoom } from "../_shared/hammoyo/rooms.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const { inviteSlug } = await parseJson(request);
    if (typeof inviteSlug !== "string" || !inviteSlug.trim()) {
      return jsonError("INVITE_SLUG_REQUIRED", "inviteSlug is required.");
    }

    const room = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .select("id, invite_slug, title, status, expected_count, response_round, expires_at, closed_at, deleted_at")
        .eq("invite_slug", inviteSlug.trim())
        .maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Invite room was not found.", 404);

    const status = canonicalRoomStatus(room);
    const joinable = isJoinableRoom(room);
    const candidates =
      status === "deleted"
        ? []
        : await runQuery(
            supabase
              .from("hammoyo_candidate_slots")
              .select("id, label, starts_at, ends_at, area_hint, note, sort_order, active")
              .eq("room_id", room.id)
              .eq("active", true)
              .order("sort_order", { ascending: true }),
          );

    return jsonResponse({
      ok: true,
      operation: "lookupRoom",
      joinable,
      canonicalRoomStatus: status,
      reasonCode: joinable ? "ROOM_JOINABLE" : `ROOM_${status.toUpperCase()}`,
      room: {
        id: room.id,
        inviteSlug: room.invite_slug,
        title: room.title,
        status,
        expectedCount: room.expected_count,
        responseRound: room.response_round,
        expiresAt: room.expires_at,
        closedAt: room.closed_at,
        deletedAt: room.deleted_at,
      },
      candidates,
    });
  } catch (error) {
    return serverError(error);
  }
});
