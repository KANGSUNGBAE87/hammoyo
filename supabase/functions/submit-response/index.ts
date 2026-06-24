import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import { requireActiveSession } from "../_shared/hammoyo/security.ts";

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const session = await requireActiveSession(supabase, request);
    if (!session.ok) return jsonError(session.code, "Valid Hammoyo session is required.", 401);

    const { roomId, responseRound, preferences } = await parseJson(request);
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");
    if (!preferences || typeof preferences !== "object") return jsonError("PREFERENCES_REQUIRED", "preferences are required.");

    const room = await runQuery(
      supabase.from("hammoyo_rooms").select("id, status, expires_at, response_round").eq("id", roomId).maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (["closed", "expired"].includes(room.status) || new Date(room.expires_at).getTime() < Date.now()) {
      return jsonError("ROOM_WRITE_LOCKED", "Responses are closed for this room.", 409);
    }
    const round = Number(responseRound || room.response_round);
    if (round !== room.response_round) return jsonError("RESPONSE_ROUND_STALE", "Response round has changed.", 409);

    const member = await runQuery(
      supabase
        .from("hammoyo_room_members")
        .select("room_id, core_user_id, role")
        .eq("room_id", roomId)
        .eq("core_user_id", session.coreUserId)
        .is("deleted_at", null)
        .maybeSingle(),
    );
    if (!member) return jsonError("MEMBERSHIP_REQUIRED", "Join this room with a valid invite before submitting.", 403);

    const response = await runQuery(
      supabase
        .from("hammoyo_responses")
        .upsert(
          {
            room_id: roomId,
            core_user_id: session.coreUserId,
            response_round: round,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "room_id,core_user_id,response_round" },
        )
        .select("id")
        .single(),
    );

    await runQuery(supabase.from("hammoyo_response_preferences").delete().eq("response_id", response.id));
    const preferenceRows = Object.entries(preferences as Record<string, string>).map(([candidateSlotId, value]) => ({
      response_id: response.id,
      candidate_slot_id: candidateSlotId,
      value,
    }));
    if (preferenceRows.length > 0) {
      await runQuery(supabase.from("hammoyo_response_preferences").insert(preferenceRows));
    }

    return jsonResponse({ ok: true, operation: "submitResponse", responseId: response.id, responseRound: round });
  } catch (error) {
    return serverError(error);
  }
});
