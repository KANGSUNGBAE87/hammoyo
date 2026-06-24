import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import { requireActiveSession } from "../_shared/hammoyo/security.ts";

function randomSlug() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const session = await requireActiveSession(supabase, request);
    if (!session.ok) return jsonError(session.code, "Valid Hammoyo session is required.", 401);

    const payload = await parseJson(request);
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const candidates = Array.isArray(payload.candidates) ? payload.candidates.slice(0, 8) : [];
    if (!title || candidates.length < 2) return jsonError("ROOM_INPUT_INVALID", "title and at least two candidates are required.");

    const expiresAt = payload.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
    const room = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .insert({
          host_core_user_id: session.coreUserId,
          invite_slug: randomSlug(),
          title,
          status: "collecting",
          expected_count: Number(payload.expectedCount || 4),
          expires_at: expiresAt,
        })
        .select("id, invite_slug, status, response_round")
        .single(),
    );

    await runQuery(
      supabase.from("hammoyo_room_members").insert({
        room_id: room.id,
        core_user_id: session.coreUserId,
        role: "host",
        display_alias: "방장",
      }),
    );

    const slots = candidates.map((candidate: Record<string, unknown>, index: number) => ({
      room_id: room.id,
      label: String(candidate.label || `후보 ${index + 1}`).slice(0, 80),
      starts_at: typeof candidate.startsAt === "string" ? candidate.startsAt : null,
      ends_at: typeof candidate.endsAt === "string" ? candidate.endsAt : null,
      area_hint: typeof candidate.areaHint === "string" ? candidate.areaHint.slice(0, 80) : null,
      note: typeof candidate.note === "string" ? candidate.note.slice(0, 160) : null,
      sort_order: index,
      active: true,
    }));
    await runQuery(supabase.from("hammoyo_candidate_slots").insert(slots));

    return jsonResponse({ ok: true, operation: "createRoom", room });
  } catch (error) {
    return serverError(error);
  }
});
