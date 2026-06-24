import { createSupabaseAdminClient, getTossExchangeUrl, runQuery } from "../_shared/hammoyo/backend.ts";
import { jsonError, jsonResponse, parseJson, requirePost, serverError } from "../_shared/hammoyo/response.ts";
import { hashProviderSubject, signSessionToken } from "../_shared/hammoyo/security.ts";

function providerMetadata(existing: unknown) {
  const base = typeof existing === "object" && existing !== null ? { ...(existing as Record<string, unknown>) } : {};
  return {
    ...base,
    hammoyo: {
      subject_hash_alg: "hmac-sha256",
      last_login_at: new Date().toISOString(),
    },
  };
}

Deno.serve(async (request) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    const { authorizationCode, locale = "ko" } = await parseJson(request);
    if (typeof authorizationCode !== "string" || authorizationCode.length < 8) {
      return jsonError("TOSS_AUTH_CODE_REQUIRED", "authorizationCode is required.");
    }

    const exchangeResponse = await fetch(getTossExchangeUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ authorizationCode }),
    });
    if (!exchangeResponse.ok) {
      return jsonError("TOSS_EXCHANGE_FAILED", "Toss authorization exchange failed.", 502);
    }

    const exchangeBody = await exchangeResponse.json();
    const providerSubject = exchangeBody.subject || exchangeBody.sub || exchangeBody.id;
    if (typeof providerSubject !== "string" || !providerSubject) {
      return jsonError("TOSS_SUBJECT_MISSING", "Toss exchange response did not include a subject.", 502);
    }

    const providerSubjectHash = await hashProviderSubject(providerSubject);
    const supabase = createSupabaseAdminClient();
    const existing = await runQuery(
      supabase
        .from("authmap_user_identities")
        .select("user_id, provider_metadata, unlinked_at")
        .eq("provider", "apps_in_toss")
        .eq("provider_subject", providerSubjectHash)
        .maybeSingle(),
    );

    let coreUserId = existing?.user_id;
    if (existing?.unlinked_at) {
      return jsonError("ACCOUNT_DELETED", "This account was deleted. Contact support if you need to restore access.", 403);
    }

    if (coreUserId) {
      const coreUser = await runQuery(
        supabase.from("core_users").select("id, deleted_at").eq("id", coreUserId).maybeSingle(),
      );
      if (!coreUser || coreUser.deleted_at) {
        await runQuery(
          supabase
            .from("authmap_user_identities")
            .update({ unlinked_at: new Date().toISOString() })
            .eq("provider", "apps_in_toss")
            .eq("provider_subject", providerSubjectHash)
            .is("unlinked_at", null),
        );
        return jsonError("ACCOUNT_DELETED", "This account was deleted. Contact support if you need to restore access.", 403);
      }
    }

    if (!coreUserId) {
      const coreUser = await runQuery(
        supabase.from("core_users").insert({ default_locale: locale === "en" ? "en" : "ko" }).select("id").single(),
      );
      coreUserId = coreUser.id;
      await runQuery(
        supabase.from("authmap_user_identities").insert({
          user_id: coreUserId,
          provider: "apps_in_toss",
          provider_subject: providerSubjectHash,
          provider_metadata: providerMetadata(null),
        }),
      );
    } else {
      await runQuery(
        supabase
          .from("authmap_user_identities")
          .update({
            linked_at: new Date().toISOString(),
            provider_metadata: providerMetadata(existing?.provider_metadata),
          })
          .eq("provider", "apps_in_toss")
          .eq("provider_subject", providerSubjectHash),
      );
    }

    const sessionToken = await signSessionToken(coreUserId);
    return jsonResponse({
      ok: true,
      operation: "exchangeTossAuth",
      sessionToken,
      user: { id: coreUserId, provider: "apps_in_toss" },
    });
  } catch (error) {
    return serverError(error);
  }
});
