type ShareCopyInput = {
  locale?: string;
  recommendation?: {
    title?: string;
    topCandidateLabel?: string;
    topCandidateTime?: string;
    confidence?: string;
    aggregateCounts?: {
      responses?: number;
      prefer?: number;
      available?: number;
      adjustable?: number;
      hardNo?: number;
    };
    caveatCode?: string;
  };
};

export const AI_COPY_ALLOWED_KEYS = [
  "locale",
  "tone",
  "confidence",
  "topCandidateLabel",
  "topCandidateTime",
  "aggregateCounts",
  "caveatCode",
];

function value(input: unknown, fallback = "") {
  return typeof input === "string" && input.trim() ? input.trim() : fallback;
}

function numeric(input: unknown) {
  return typeof input === "number" && Number.isFinite(input) ? input : 0;
}

export function buildTemplateShareCopy(input: ShareCopyInput) {
  const locale = input.locale === "en" ? "en" : "ko";
  const recommendation = input.recommendation ?? {};
  const aggregateCounts = recommendation.aggregateCounts ?? {};
  const title = value(recommendation.title, locale === "en" ? "This meetup" : "이 모임");
  const label = value(recommendation.topCandidateLabel, locale === "en" ? "the selected day" : "선택한 날짜");
  const time = value(recommendation.topCandidateTime, locale === "en" ? "the selected time" : "선택한 시간");
  const responses = numeric(aggregateCounts.responses);
  const prefer = numeric(aggregateCounts.prefer);

  if (locale === "en") {
    return `${title}: ${label} ${time} is the most workable option so far. ${responses} people responded, and ${prefer} picked it as best.`;
  }

  return `${title}은 현재 응답 기준으로 ${label} ${time}이 가장 현실적인 약속안이에요. ${responses}명이 답했고, ${prefer}명이 가장 좋아요로 골랐어요.`;
}

export function buildAiCopyPayload(input: ShareCopyInput & { tone?: string }) {
  const recommendation = input.recommendation ?? {};
  const aggregateCounts = recommendation.aggregateCounts ?? {};
  return {
    locale: input.locale === "en" ? "en" : "ko",
    tone: value(input.tone, "warm"),
    confidence: value(recommendation.confidence, "medium"),
    topCandidateLabel: value(recommendation.topCandidateLabel),
    topCandidateTime: value(recommendation.topCandidateTime),
    aggregateCounts: {
      responses: numeric(aggregateCounts.responses),
      prefer: numeric(aggregateCounts.prefer),
      available: numeric(aggregateCounts.available),
      adjustable: numeric(aggregateCounts.adjustable),
      hardNo: numeric(aggregateCounts.hardNo),
    },
    caveatCode: value(recommendation.caveatCode, "none"),
  };
}

export function resolveShareCopy(input: ShareCopyInput & { tone?: string; aiEnabled?: boolean }) {
  return {
    ok: true,
    method: "template",
    fallbackReason: input.aiEnabled ? "AI_COPY_FALLBACK_TEMPLATE" : "AI_COPY_DISABLED",
    body: buildTemplateShareCopy(input),
  };
}
