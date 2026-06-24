import { buildAiCopyPayload } from "./ai-copy.ts";

type AiCopyInput = Parameters<typeof buildAiCopyPayload>[0];

export const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-pro";

export function resolveDeepSeekModel(envName = "AI_MODEL_COPY") {
  const configuredModel = Deno.env.get(envName)?.trim();
  return configuredModel === DEFAULT_DEEPSEEK_MODEL ? configuredModel : DEFAULT_DEEPSEEK_MODEL;
}

function readDeepSeekConfig(featureFlag: string, modelEnvName: string) {
  if (Deno.env.get(featureFlag) !== "true") return null;
  const provider = Deno.env.get("AI_PROVIDER") || "deepseek";
  if (provider !== "deepseek") return null;

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) return null;

  return { apiKey, model: resolveDeepSeekModel(modelEnvName) };
}

export async function generateAiPolishedCopy(input: AiCopyInput) {
  const config = readDeepSeekConfig("AI_COPY_ENABLED", "AI_MODEL_COPY");
  if (!config) return null;

  const payload = buildAiCopyPayload(input);
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content:
            "You polish a meetup confirmation message. Use only the provided structured fields. Do not infer names, reasons, identities, or private context.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      thinking: { type: "disabled" },
      temperature: 0.3,
      max_tokens: 160,
    }),
  });

  if (!response.ok) return null;
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

export async function generateAiScheduleCoordination(payload: unknown) {
  const config = readDeepSeekConfig("AI_COORDINATION_ENABLED", "AI_MODEL_COORDINATION");
  if (!config) return null;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content:
            "You coordinate a meetup schedule from aggregate-only availability data. Return JSON only in this exact shape: {\"selectedCandidateId\":\"candidate-id\",\"summary\":\"short relationship-safe reason\",\"alternatives\":[{\"candidateId\":\"candidate-id\",\"reason\":\"short reason\"}],\"caveatCode\":\"none\"}. Never mention participants, names, private reasons, or invented candidates. Respect guardrails, never choose excluded candidates, and never change deterministicTopCandidateId.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 640,
    }),
  });

  if (!response.ok) return null;
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}
