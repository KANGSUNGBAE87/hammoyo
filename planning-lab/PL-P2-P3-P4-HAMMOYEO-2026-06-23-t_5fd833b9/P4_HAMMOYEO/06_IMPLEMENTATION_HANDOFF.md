# Implementation Handoff

## User actions

- [INFERENCE] Host creates room, edits candidates, shares link, views result, copies message.
- [INFERENCE] Participant opens link, selects preference for candidates, submits response.

## Data to store

- [INFERENCE] Room: id, title, host token, candidate times, optional location/category constraints, status, created_at/expires_at.
- [INFERENCE] Response: anonymous participant label or nickname, candidate preference values, optional constraints, submitted_at.
- [INFERENCE] Recommendation snapshot: ranked candidates, aggregate counts, caveat level, generated copy.

## States

- [INFERENCE] draft, collecting, enough_responses, low_confidence, recommended, closed, expired.

## Integrations

- [INFERENCE] Required for MVP: clipboard/share sheet only.
- [FACT] KakaoTalk deep integration, calendar sync, maps, payment, reservation are out of scope.

## Performance

- [INFERENCE] Recommendation calculation should be instant for 4~12 participants and 5~10 candidates.

## Privacy

- [INFERENCE] Do not expose individual hard-no reasons in shared copy.
- [INFERENCE] Avoid collecting phone numbers or Kakao identifiers in MVP.
- [INFERENCE] Room links should be unguessable and expire.

## Viewport support

- [INFERENCE] Mobile 390px first, responsive desktop result screen.

## Error handling

- [INFERENCE] Expired link, insufficient response, all-hard-no candidates, network save failure, duplicate response edit path.

## Implementer may decide

- [INFERENCE] Framework, database, exact API URLs, scoring weights within documented behavior, visual polish details.

## Must not change

- [INFERENCE] Do not broaden to generic scheduling.
- [INFERENCE] Do not show individual blame in shared copy.
- [INFERENCE] Do not set `FINAL_APPROVED` or trigger production handoff without Owner approval.
- [INFERENCE] Do not report live validation metrics unless collected.
