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

    const { roomId, reasonCode = "host_deleted" } = await parseJson(request);
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");

    const room = await runQuery(
      supabase.from("hammoyo_rooms").select("id, host_core_user_id, status, deleted_at").eq("id", roomId).maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (room.host_core_user_id !== session.coreUserId) return jsonError("HOST_REQUIRED", "Only the host can delete this room.", 403);

    const deletedAt = room.deleted_at || new Date().toISOString();
    const updated = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .update({
          status: "deleted",
          deleted_at: deletedAt,
          deleted_by_core_user_id: session.coreUserId,
          deleted_reason: String(reasonCode).slice(0, 80),
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
        .select("id, status, deleted_at, deleted_by_core_user_id")
        .single(),
    );

    return jsonResponse({ ok: true, operation: "deleteRoom", room: updated });
  } catch (error) {
    return serverError(error);
  }
});
