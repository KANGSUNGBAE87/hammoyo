import { createSupabaseAdminClient, runQuery } from "../_shared/hammoyo/backend.ts";
import { generateAiScheduleCoordination, resolveDeepSeekModel } from "../_shared/hammoyo/ai-provider.ts";
import { rankCandidates } from "../_shared/hammoyo/recommendation.ts";
import {
  buildScheduleCoordinationPayload,
  hashScheduleCoordinationPayload,
  resolveScheduleCoordination,
} from "../_shared/hammoyo/schedule-coordinator.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import { requireActiveSession } from "../_shared/hammoyo/security.ts";

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const supabase = createSupabaseAdminClient();
    const session = await requireActiveSession(supabase, request);
    if (!session.ok) return jsonError(session.code, "Valid Hammoyo session is required.", 401);

    const { roomId, locale = "ko" } = await parseJson(request);
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");

    const room = await runQuery(
      supabase
        .from("hammoyo_rooms")
        .select("id, host_core_user_id, status, expected_count, response_round")
        .eq("id", roomId)
        .maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (room.host_core_user_id !== session.coreUserId) return jsonError("HOST_REQUIRED", "Only the host can recompute.", 403);
    if (["closed", "expired"].includes(room.status)) return jsonError("ROOM_WRITE_LOCKED", "Room is locked.", 409);

    const candidates = await runQuery(
      supabase.from("hammoyo_candidate_slots").select("id, label, starts_at, sort_order").eq("room_id", roomId).eq("active", true),
    );
    const responses = await runQuery(
      supabase.from("hammoyo_responses").select("id").eq("room_id", roomId).eq("response_round", room.response_round).eq("status", "active"),
    );
    const preferences = responses.length
      ? await runQuery(
          supabase.from("hammoyo_response_preferences").select("response_id, candidate_slot_id, value").in(
            "response_id",
            responses.map((response: { id: string }) => response.id),
          ),
        )
      : [];

    const responsesWithPreferences = responses.map((response: { id: string }) => ({
      preferences: preferences.filter((preference: { response_id: string }) => preference.response_id === response.id),
    }));
    const ranked = rankCandidates({ candidates, responses: responsesWithPreferences, expectedCount: room.expected_count });
    const coordinationPayload = buildScheduleCoordinationPayload({ ranked, locale });
    const shouldCoordinateWithAi = ranked.confidence !== "none" && Boolean(ranked.top);
    const aiCoordinationOutput = shouldCoordinateWithAi ? await generateAiScheduleCoordination(coordinationPayload) : null;
    const coordination = resolveScheduleCoordination({ payload: coordinationPayload, aiOutput: aiCoordinationOutput });
    const nextStatus = ranked.confidence === "none" || !ranked.top ? "low_confidence" : "recommended";
    const run = await runQuery(
      supabase
        .from("hammoyo_recommendation_runs")
        .insert({
          room_id: roomId,
          response_round: room.response_round,
          algorithm_version: coordination.method === "ai" ? `${ranked.algorithmVersion}+ai-schedule-coordination-v1` : ranked.algorithmVersion,
          confidence: ranked.confidence,
          result_json: { ...ranked, coordination },
        })
        .select("id, confidence, result_json")
        .single(),
    );

    if (coordination.method === "ai") {
      await runQuery(
        supabase.from("hammoyo_ai_coordination_runs").insert({
          room_id: roomId,
          recommendation_run_id: run.id,
          provider: "deepseek",
          model: resolveDeepSeekModel("AI_MODEL_COORDINATION"),
          locale: locale === "en" ? "en" : "ko",
          input_kind: "schedule_matrix",
          prompt_version: "ai-schedule-coordination-v1",
          input_hash: await hashScheduleCoordinationPayload(coordinationPayload),
          output_json: coordination,
          safety_status: "passed",
        }),
      );
    }

    await runQuery(supabase.from("hammoyo_rooms").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", roomId));

    return jsonResponse({ ok: true, operation: "recomputeRecommendation", recommendationRun: run, coordination, status: nextStatus });
  } catch (error) {
    return serverError(error);
  }
});
