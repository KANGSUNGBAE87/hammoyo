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

    const { roomId } = await parseJson(request);
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");

    const room = await runQuery(
      supabase.from("hammoyo_rooms").select("id, host_core_user_id, status").eq("id", roomId).maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (room.host_core_user_id !== session.coreUserId) return jsonError("HOST_REQUIRED", "Only the host can close this room.", 403);
    if (room.status === "expired") return jsonError("ROOM_EXPIRED", "Expired room cannot be closed.", 409);

    const updated = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .update({ status: "closed", closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", roomId)
        .select("id, status, closed_at")
        .single(),
    );

    return jsonResponse({ ok: true, operation: "closeRoom", room: updated });
  } catch (error) {
    return serverError(error);
  }
});
