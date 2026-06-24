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

    const { inviteSlug, displayAlias = "참여자" } = await parseJson(request);
    if (typeof inviteSlug !== "string" || !inviteSlug) return jsonError("INVITE_SLUG_REQUIRED", "inviteSlug is required.");

    const room = await runQuery(
      supabase.from("hammoyo_rooms").select("id, status, expires_at").eq("invite_slug", inviteSlug).maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Invite room was not found.", 404);
    if (["closed", "expired"].includes(room.status) || new Date(room.expires_at).getTime() < Date.now()) {
      return jsonError("ROOM_NOT_JOINABLE", "This room is no longer accepting participants.", 409);
    }

    const member = await runQuery(
      supabase
        .from("hammoyo_room_members")
        .upsert(
          {
            room_id: room.id,
            core_user_id: session.coreUserId,
            role: "participant",
            display_alias: String(displayAlias).slice(0, 40),
            deleted_at: null,
          },
          { onConflict: "room_id,core_user_id" },
        )
        .select("room_id, core_user_id, role")
        .single(),
    );

    return jsonResponse({ ok: true, operation: "joinRoom", roomId: room.id, member });
  } catch (error) {
    return serverError(error);
  }
});
