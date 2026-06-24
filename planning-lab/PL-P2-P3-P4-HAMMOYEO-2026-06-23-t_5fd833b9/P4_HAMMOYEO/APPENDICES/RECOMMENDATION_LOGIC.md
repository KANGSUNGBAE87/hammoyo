# Recommendation Logic

[INFERENCE] MVP scoring should remain explainable rather than “AI black box”.

## Suggested first-pass scoring

- 선호: +3
- 가능: +2
- 조정 가능: +1
- 강한 불가: -4 and caveat trigger

## Guardrails

- [INFERENCE] Candidate with hard-no should not be called “optimal”.
- [INFERENCE] If response count is below threshold, show insufficient-response state.
- [INFERENCE] Show aggregate counts, not individual blame.
