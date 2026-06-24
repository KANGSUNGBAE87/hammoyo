# RECOMMENDATION_LOGIC

## Inputs
Candidate time, per participant strength: preferred/possible/adjustable/hard_no, optional shallow constraints.

## Scoring sketch
- preferred: +3
- possible: +2
- adjustable: +1
- hard_no: -5 and triggers caution
- insufficient responses: no recommendation

## Output rules
- If unanimous possible/preferred exists: show clear winner.
- If no unanimous exists: show top 1–2 least-harm candidates with reasons.
- If all candidates unsafe: show no_safe_recommendation.

## Safety rules
Do not expose names in shared copy. Hard-no candidate is “확인 필요”, not “확정”.
