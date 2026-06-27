import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { canonicalRoomStatus } from "../_shared/hammoyo/rooms.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import { hashAnonymousParticipantKey, readOptionalActiveSession } from "../_shared/hammoyo/security.ts";

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const session = await readOptionalActiveSession(supabase, request);

    const { roomId, responseRound, preferences, anonymousParticipantKey } = await parseJson(request);
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");
    if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
      return jsonError("PREFERENCES_REQUIRED", "preferences are required.");
    }

    const room = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .select("id, status, expires_at, closed_at, deleted_at, response_round")
        .eq("id", roomId)
        .maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (!["collecting", "low_confidence", "recommended"].includes(canonicalRoomStatus(room))) {
      return jsonError("ROOM_WRITE_LOCKED", "Responses are closed for this room.", 409);
    }
    const round = Number(responseRound || room.response_round);
    if (round !== room.response_round) return jsonError("RESPONSE_ROUND_STALE", "Response round has changed.", 409);

    const requestedAnonymousParticipantKey =
      typeof anonymousParticipantKey === "string" && anonymousParticipantKey.trim() ? anonymousParticipantKey.trim() : "";
    const anonymousKeyHash = requestedAnonymousParticipantKey
      ? await hashAnonymousParticipantKey(roomId, requestedAnonymousParticipantKey)
      : null;
    if (!session.ok && !anonymousKeyHash) {
      return jsonError("PARTICIPANT_AUTH_REQUIRED", "A signed session or anonymous participant key is required.", 401);
    }

    const member = await runQuery(
      !anonymousKeyHash && session.ok
        ? supabase
            .from("hammoyo_room_members")
            .select("id, room_id, core_user_id, role, participant_kind")
            .eq("room_id", roomId)
            .eq("core_user_id", session.coreUserId)
            .is("deleted_at", null)
            .maybeSingle()
        : supabase
            .from("hammoyo_room_members")
            .select("id, room_id, core_user_id, role, participant_kind")
            .eq("room_id", roomId)
            .eq("anonymous_key_hash", anonymousKeyHash)
            .is("deleted_at", null)
            .maybeSingle(),
    );
    if (!member) return jsonError("MEMBERSHIP_REQUIRED", "Join this room with a valid invite before submitting.", 403);

    const preferenceRows = Object.entries(preferences as Record<string, string>).map(([candidateSlotId, value]) => ({
      response_id: "",
      candidate_slot_id: candidateSlotId,
      value,
    }));
    const allowedValues = new Set(["prefer", "available", "adjustable", "hardNo"]);
    if (preferenceRows.some((row) => !allowedValues.has(row.value))) {
      return jsonError("PREFERENCE_VALUE_INVALID", "Preference value is invalid.");
    }

    const candidateSlotIds = [...new Set(preferenceRows.map((row) => row.candidate_slot_id))];
    if (candidateSlotIds.length > 0) {
      const slots = await runQuery(
        supabase
          .from("hammoyo_candidate_slots")
          .select("id, active")
          .eq("room_id", roomId)
          .in("id", candidateSlotIds),
      );
      const slotById = new Map(slots.map((slot: { id: string; active: boolean }) => [slot.id, slot]));
      const missingSlotId = candidateSlotIds.find((candidateSlotId) => !slotById.has(candidateSlotId));
      if (missingSlotId) return jsonError("CANDIDATE_SLOT_NOT_IN_ROOM", "Candidate slot does not belong to this room.", 400);
      const inactiveSlotId = candidateSlotIds.find((candidateSlotId) => !slotById.get(candidateSlotId)?.active);
      if (inactiveSlotId) return jsonError("CANDIDATE_SLOT_INACTIVE", "Candidate slot is inactive.", 400);
    }

    const response = await runQuery(
      supabase
        .from("hammoyo_responses")
        .upsert(
          {
            room_id: roomId,
            member_id: member.id,
            core_user_id: !anonymousKeyHash && session.ok ? session.coreUserId : null,
            response_round: round,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "room_id,member_id,response_round" },
        )
        .select("id")
        .single(),
    );

    await runQuery(supabase.from("hammoyo_response_preferences").delete().eq("response_id", response.id));
    const rowsToInsert = preferenceRows.map(({ candidate_slot_id, value }) => ({
      response_id: response.id,
      candidate_slot_id,
      value,
    }));
    if (rowsToInsert.length > 0) {
      await runQuery(supabase.from("hammoyo_response_preferences").insert(rowsToInsert));
    }

    return jsonResponse({
      ok: true,
      operation: "submitResponse",
      responseId: response.id,
      responseRound: round,
      participantKind: member.participant_kind,
    });
  } catch (error) {
    return serverError(error);
  }
});
