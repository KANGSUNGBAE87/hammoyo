import { buildAiCopyPayload, resolveShareCopy } from "../_shared/hammoyo/ai-copy.ts";
import { generateAiPolishedCopy, resolveDeepSeekModel } from "../_shared/hammoyo/ai-provider.ts";
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
    const { roomId, locale = "ko", recommendationRunId } = payload;
    if (typeof roomId !== "string" || !roomId) return jsonError("ROOM_ID_REQUIRED", "roomId is required.");

    const room = await runQuery(
      supabase.from("hammoyo_rooms").select("id, title, host_core_user_id").eq("id", roomId).maybeSingle(),
    );
    if (!room) return jsonError("ROOM_NOT_FOUND", "Room was not found.", 404);
    if (room.host_core_user_id !== session.coreUserId) return jsonError("HOST_REQUIRED", "Only the host can create share copy.", 403);

    const recommendation = recommendationRunId
      ? await runQuery(
          supabase.from("hammoyo_recommendation_runs").select("id, result_json").eq("id", recommendationRunId).eq("room_id", roomId).maybeSingle(),
        )
      : await runQuery(
          supabase
            .from("hammoyo_recommendation_runs")
            .select("id, result_json")
            .eq("room_id", roomId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        );
    if (!recommendation) return jsonError("RECOMMENDATION_REQUIRED", "Recommendation snapshot is required.", 409);

    const top = recommendation.result_json?.top;
    const copyInput = {
      aiEnabled: Deno.env.get("AI_COPY_ENABLED") === "true",
      locale,
      recommendation: {
        title: room.title,
        topCandidateLabel: top?.candidate?.label,
        topCandidateTime: top?.candidate?.starts_at ?? "",
        confidence: recommendation.result_json?.confidence,
        aggregateCounts: top?.aggregateCounts,
        caveatCode: top ? "none" : "low_confidence",
      },
    };
    const polished = await generateAiPolishedCopy(copyInput);
    const copy = polished
      ? { ok: true, method: "ai", body: polished, label: locale === "en" ? "AI-polished copy" : "AI가 다듬은 문구예요" }
      : resolveShareCopy(copyInput);
    buildAiCopyPayload(copyInput);

    const shareMessage = await runQuery(
      supabase
        .from("hammoyo_share_messages")
        .insert({
          room_id: roomId,
          recommendation_run_id: recommendation.id,
          locale: locale === "en" ? "en" : "ko",
          generation_method: copy.method === "ai" ? "ai_polish" : "template",
          body: copy.body,
          model: copy.method === "ai" ? resolveDeepSeekModel() : null,
          prompt_version: copy.method === "ai" ? "share-copy-v1" : null,
        })
        .select("id, generation_method, body")
        .single(),
    );

    return jsonResponse({
      ok: true,
      operation: "generateShareCopy",
      shareMessage,
      label: copy.method === "ai" ? copy.label : undefined,
    });
  } catch (error) {
    return serverError(error);
  }
});
