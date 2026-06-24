export const AI_COPY_DISABLED = "AI_COPY_DISABLED";
export const AI_COPY_FALLBACK_TEMPLATE = "AI_COPY_FALLBACK_TEMPLATE";
export const AI_COPY_ALLOWED_KEYS = Object.freeze([
  "locale",
  "tone",
  "confidence",
  "topCandidateLabel",
  "topCandidateTime",
  "aggregateCounts",
  "caveatCode",
]);

const DEFAULT_COUNTS = Object.freeze({
  responses: 0,
  prefer: 0,
  available: 0,
  adjustable: 0,
  hardNo: 0,
});

function text(value, fallback = "") {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function counts(value = {}) {
  return {
    responses: Number(value.responses || 0),
    prefer: Number(value.prefer || 0),
    available: Number(value.available || 0),
    adjustable: Number(value.adjustable || 0),
    hardNo: Number(value.hardNo || 0),
  };
}

export function sanitizeAiCopyInput({ locale = "ko", tone = "warm", recommendation = {} } = {}) {
  return {
    locale: locale === "en" ? "en" : "ko",
    tone: text(tone, "warm"),
    confidence: text(recommendation.confidence, "medium"),
    topCandidateLabel: text(recommendation.topCandidateLabel),
    topCandidateTime: text(recommendation.topCandidateTime),
    aggregateCounts: counts(recommendation.aggregateCounts || DEFAULT_COUNTS),
    caveatCode: text(recommendation.caveatCode, "none"),
  };
}

export function buildAiCopyPayload(input = {}) {
  return sanitizeAiCopyInput(input);
}

export function buildTemplateShareCopy({ locale = "ko", recommendation = {} } = {}) {
  const safeLocale = locale === "en" ? "en" : "ko";
  const title = text(recommendation.title, safeLocale === "en" ? "This meetup" : "이 모임");
  const label = text(recommendation.topCandidateLabel, safeLocale === "en" ? "the selected day" : "선택한 날짜");
  const time = text(recommendation.topCandidateTime, safeLocale === "en" ? "the selected time" : "선택한 시간");
  const aggregateCounts = counts(recommendation.aggregateCounts || DEFAULT_COUNTS);
  const confidence = text(recommendation.confidence, "medium");

  if (safeLocale === "en") {
    return `${title}: ${label} ${time} is the most workable option so far. ${aggregateCounts.responses} people responded, and ${aggregateCounts.prefer} picked it as best. Confidence: ${confidence}.`;
  }

  return `${title}은 현재 응답 기준으로 ${label} ${time}이 가장 현실적인 약속안이에요. ${aggregateCounts.responses}명이 답했고, ${aggregateCounts.prefer}명이 가장 좋아요로 골랐어요. 신뢰도는 ${confidence}입니다.`;
}

function templateResult(input, extra = {}) {
  return {
    ok: true,
    method: "template",
    body: buildTemplateShareCopy(input),
    ...extra,
  };
}

export function resolveShareCopy({ aiEnabled = false, generateAiCopy, ...input } = {}) {
  if (!aiEnabled) {
    return templateResult(input, { fallbackReason: AI_COPY_DISABLED });
  }

  if (typeof generateAiCopy !== "function") {
    return templateResult(input, { fallbackReason: AI_COPY_FALLBACK_TEMPLATE });
  }

  const payload = buildAiCopyPayload(input);
  return Promise.resolve()
    .then(() => generateAiCopy(payload))
    .then((body) => {
      const polished = typeof body === "string" ? body.trim() : String(body?.body || "").trim();
      if (!polished) {
        return templateResult(input, { fallbackReason: AI_COPY_FALLBACK_TEMPLATE });
      }
      return {
        ok: true,
        method: "ai",
        body: polished,
        label: input.locale === "en" ? "AI-polished copy" : "AI가 다듬은 문구예요",
      };
    })
    .catch(() => templateResult(input, { fallbackReason: AI_COPY_FALLBACK_TEMPLATE }));
}
