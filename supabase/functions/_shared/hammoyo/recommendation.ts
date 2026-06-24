type Candidate = {
  id: string;
  label?: string;
  starts_at?: string | null;
  sort_order?: number;
};

type Preference = {
  candidate_slot_id: string;
  value: "prefer" | "available" | "adjustable" | "hardNo";
};

type ResponseWithPreferences = {
  preferences: Preference[];
};

const SCORE = {
  prefer: 3,
  available: 2,
  adjustable: 1,
  hardNo: -5,
};

export function minimumResponses(expectedCount: number) {
  return Math.min(4, Math.max(3, Math.ceil(Number(expectedCount || 0) * 0.5)));
}

export function rankCandidates({
  candidates,
  responses,
  expectedCount,
}: {
  candidates: Candidate[];
  responses: ResponseWithPreferences[];
  expectedCount: number;
}) {
  const threshold = minimumResponses(expectedCount);
  const responseCount = responses.length;
  const items = candidates.map((candidate) => {
    const values = responses
      .map((response) => response.preferences.find((preference) => preference.candidate_slot_id === candidate.id)?.value)
      .filter(Boolean) as Preference["value"][];
    const hardNo = values.filter((value) => value === "hardNo").length;
    const prefer = values.filter((value) => value === "prefer").length;
    const available = values.filter((value) => value === "available").length;
    const adjustable = values.filter((value) => value === "adjustable").length;
    const score = values.reduce((sum, value) => sum + SCORE[value], 0);
    const excluded = hardNo >= 2 || (responseCount > 0 && hardNo / responseCount >= 0.34);
    return {
      candidate,
      score,
      excluded,
      aggregateCounts: { responses: responseCount, prefer, available, adjustable, hardNo },
    };
  });

  const sorted = [...items].sort((a, b) => {
    // Canonical tie-breaker: score, hard-no count, prefer count, prefer + available count, then host order.
    const aPreferAvailable = a.aggregateCounts.prefer + a.aggregateCounts.available;
    const bPreferAvailable = b.aggregateCounts.prefer + b.aggregateCounts.available;
    return (
      Number(a.excluded) - Number(b.excluded) ||
      b.score - a.score ||
      a.aggregateCounts.hardNo - b.aggregateCounts.hardNo ||
      b.aggregateCounts.prefer - a.aggregateCounts.prefer ||
      bPreferAvailable - aPreferAvailable ||
      (a.candidate.sort_order ?? 0) - (b.candidate.sort_order ?? 0)
    );
  });

  const top = sorted.find((item) => !item.excluded);
  const second = sorted.filter((item) => !item.excluded)[1];
  const scoreGap = top && second ? top.score - second.score : top ? top.score : 0;
  const confidence =
    responseCount < threshold
      ? "none"
      : top && top.aggregateCounts.hardNo === 0 && scoreGap >= 3
        ? "high"
        : top && scoreGap >= 1
          ? "medium"
          : top
            ? "low"
            : "low";
  return {
    algorithmVersion: "deterministic-v1",
    responseCount,
    threshold,
    confidence,
    top,
    items: sorted,
  };
}
