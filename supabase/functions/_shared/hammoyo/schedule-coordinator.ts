type Candidate = {
  id: string;
  label?: string;
  starts_at?: string | null;
  score?: number;
  sort_order?: number;
};

type RankedItem = {
  candidate: Candidate;
  score?: number;
  excluded?: boolean;
  aggregateCounts?: {
    responses?: number;
    prefer?: number;
    available?: number;
    adjustable?: number;
    hardNo?: number;
  };
};

type RankedResult = {
  algorithmVersion?: string;
  responseCount?: number;
  threshold?: number;
  confidence?: string;
  top?: RankedItem;
  items?: RankedItem[];
};

type SchedulePayload = ReturnType<typeof buildScheduleCoordinationPayload>;

export const AI_COORDINATION_ALLOWED_KEYS = [
  "locale",
  "tone",
  "responseCount",
  "threshold",
  "confidence",
  "deterministicTopCandidateId",
  "candidates",
  "guardrails",
];

function text(value: unknown, fallback = "") {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function numeric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function buildScheduleCoordinationPayload({
  ranked,
  locale = "ko",
  tone = "relationship_safe",
}: {
  ranked: RankedResult;
  locale?: string;
  tone?: string;
}) {
  const candidates = (ranked.items || []).map((item, index) => ({
    id: text(item.candidate?.id),
    optionLabel: `option-${index + 1}`,
    startsAt: text(item.candidate?.starts_at),
    score: numeric(item.score),
    excluded: Boolean(item.excluded),
    aggregateCounts: {
      responses: numeric(item.aggregateCounts?.responses),
      prefer: numeric(item.aggregateCounts?.prefer),
      available: numeric(item.aggregateCounts?.available),
      adjustable: numeric(item.aggregateCounts?.adjustable),
      hardNo: numeric(item.aggregateCounts?.hardNo),
    },
  }));

  return {
    locale: locale === "en" ? "en" : "ko",
    tone: text(tone, "relationship_safe"),
    responseCount: numeric(ranked.responseCount),
    threshold: numeric(ranked.threshold),
    confidence: text(ranked.confidence, "none"),
    deterministicTopCandidateId: ranked.top?.candidate?.id || null,
    candidates,
    guardrails: {
      promptVersion: "ai-schedule-coordination-v1",
      aggregateOnly: true,
      cannotSelectExcludedCandidate: true,
      cannotInventCandidate: true,
      cannotChangeDeterministicTop: true,
      doNotMentionParticipants: true,
      deterministicFallbackRequired: true,
    },
  };
}

function fallbackSummary(payload: SchedulePayload) {
  const top = payload.candidates.find((candidate) => candidate.id === payload.deterministicTopCandidateId);
  if (payload.locale === "en") {
    return top
      ? `${top.startsAt || top.optionLabel} is the safest coordination option based on the current aggregate responses.`
      : "There is not enough agreement yet, so keep collecting responses before confirming.";
  }
  return top
    ? `현재 집계 응답 기준으로 ${top.startsAt || top.optionLabel}이 가장 무리 없는 조율안이에요.`
    : "아직 합의가 부족해서 응답을 더 받은 뒤 확정하는 편이 안전해요.";
}

export function buildDeterministicCoordination(payload: SchedulePayload) {
  return {
    method: "deterministic",
    promptVersion: "deterministic-guardrail-v1",
    selectedCandidateId: payload.deterministicTopCandidateId,
    summary: fallbackSummary(payload),
    alternatives: payload.candidates
      .filter((candidate) => !candidate.excluded && candidate.id !== payload.deterministicTopCandidateId)
      .slice(0, 2)
      .map((candidate) => ({
        candidateId: candidate.id,
        reason: payload.locale === "en" ? "Backup option if the top time is difficult." : "1순위 시간이 어려울 때의 예비안입니다.",
      })),
    caveatCode: payload.responseCount < payload.threshold ? "low_response_count" : "none",
  };
}

function parseJsonObject(value: unknown) {
  if (typeof value === "object" && value !== null) return value as Record<string, unknown>;
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function validateAiScheduleCoordination(aiOutput: unknown, payload: SchedulePayload) {
  const parsed = parseJsonObject(aiOutput);
  if (!parsed) return null;

  const allowedCandidateIds = new Set(payload.candidates.filter((candidate) => !candidate.excluded).map((candidate) => candidate.id));
  const selectedCandidateId = text(parsed.selectedCandidateId);
  if (selectedCandidateId && !allowedCandidateIds.has(selectedCandidateId)) return null;
  if (selectedCandidateId && selectedCandidateId !== payload.deterministicTopCandidateId) return null;

  const summary = text(parsed.summary).slice(0, 500);
  if (!summary) return null;

  const alternatives = Array.isArray(parsed.alternatives)
    ? parsed.alternatives
        .map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const alternative = item as Record<string, unknown>;
          const candidateId = text(alternative.candidateId);
          if (!candidateId || !allowedCandidateIds.has(candidateId)) return null;
          return {
            candidateId,
            reason: text(alternative.reason).slice(0, 220),
          };
        })
        .filter(Boolean)
        .slice(0, 2)
    : [];

  return {
    method: "ai",
    promptVersion: "ai-schedule-coordination-v1",
    selectedCandidateId: payload.deterministicTopCandidateId,
    summary,
    alternatives,
    caveatCode: text(parsed.caveatCode, payload.responseCount < payload.threshold ? "low_response_count" : "none"),
  };
}

export function resolveScheduleCoordination({
  payload,
  aiOutput,
}: {
  payload: SchedulePayload;
  aiOutput?: unknown;
}) {
  const aiCoordination = validateAiScheduleCoordination(aiOutput, payload);
  return aiCoordination || buildDeterministicCoordination(payload);
}

export async function hashScheduleCoordinationPayload(payload: SchedulePayload) {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
