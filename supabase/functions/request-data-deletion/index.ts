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

    const payload = await parseJson(request);
    const deletedAt = new Date().toISOString();
    await runQuery(
      supabase
        .from("core_users")
        .update({ deleted_at: deletedAt, updated_at: deletedAt })
        .eq("id", session.coreUserId),
    );
    await runQuery(
      supabase
        .from("authmap_user_identities")
        .update({ unlinked_at: deletedAt })
        .eq("user_id", session.coreUserId)
        .is("unlinked_at", null),
    );
    await runQuery(
      supabase
        .from("hammoyo_room_members")
        .update({ display_alias: "삭제된 사용자", deleted_at: deletedAt })
        .eq("core_user_id", session.coreUserId),
    );
    await runQuery(
      supabase
        .from("hammoyo_responses")
        .update({ status: "withdrawn", updated_at: deletedAt })
        .eq("core_user_id", session.coreUserId),
    );

    return jsonResponse({
      ok: true,
      operation: "requestDataDeletion",
      reasonCode: payload.reasonCode ?? "user_request",
      message: "User data deletion/anonymization request was applied to Hammoyo app tables.",
    });
  } catch (error) {
    return serverError(error);
  }
});
