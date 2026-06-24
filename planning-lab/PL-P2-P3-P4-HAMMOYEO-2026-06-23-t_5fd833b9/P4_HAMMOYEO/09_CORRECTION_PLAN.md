# P4 Correction Plan

Updated: 2026-06-24
Status: `PROJECT_COPY_CORRECTED`

이 파일은 공식 Planning Lab 원본을 파괴적으로 수정하지 않고, 현재 프로젝트 사본에 추가한 보정 기획입니다.

## 보정 이유

기존 P4 패키지는 조건부 산출물로는 완성되어 있었지만, 구현 전 다음 경계가 비어 있었습니다.

- Supabase schema, RLS, Edge Function, auth mapping
- host 권한, 중복 응답, 응답 수정, 만료 링크, room close 후 재계산 정책
- AI/copy 생성 방식, 고지, 라벨, privacy fallback
- 디자인 화면 ID와 샘플 inventory 정합성

## 보정된 기준

- 구현 기준: `/Users/kangsungbae/Documents/hammoyo/ai/plans/implementation-plan.md`
- 디자인 기준: `/Users/kangsungbae/Documents/hammoyo/ai/plans/design-plan.md`
- platform 기준: `/Users/kangsungbae/Documents/지식저장소/projects/hammoyo/platform.md`
- 정적 MVP sample: `/Users/kangsungbae/Documents/hammoyo/docs/mvp/index.html`
- 이미지 생성문: `/Users/kangsungbae/Documents/hammoyo/docs/design/image-generation-brief.md`

## 핵심 결정

1. 로그인은 Apps in Toss `appLogin()` 기준으로 준비합니다.
2. Supabase는 Edge Function/server boundary 뒤에 둡니다.
3. Host 권한은 URL token이 아니라 Toss 로그인 기반 `host_user_id`로 판단합니다.
4. Invite link에는 locator 성격의 `invite_slug`만 넣습니다.
5. 한 사용자당 한 response round에 한 active response만 허용합니다.
6. Closed/expired room은 write와 recompute를 거절합니다.
7. 추천 로직은 deterministic이며 AI가 ranking하지 않습니다.
8. AI는 공유 문구 polish에만 선택적으로 사용합니다.
9. AI copy는 라벨과 template fallback을 반드시 갖습니다.
10. 사람 리뷰는 구현 전 필수 게이트로 두지 않고, 문서 정합성/샘플 확인/에이전트 QA로 대체합니다.

## 디자인 보정

기존 `SCR-04-copy-builder`는 독립 화면에서 제거하고 `SCR-03-result-recommendation`의 공유 문구 영역으로 합칩니다. 추가 상태는 아래처럼 정규화합니다.

- `SCR-01-host-room`
- `SCR-02-participant-input`
- `SCR-03-result-recommendation`
- `SCR-04-insufficient-response`
- `SCR-05-link-expired`
- `SCR-06-room-closed`
- `SCR-07-ai-copy-label`

## 구현 전 남은 Open Item

- Supabase project 생성과 migration 작성
- Toss app id/deep link prefix 확정
- Toss server API credential/mTLS 처리 위치 확정
- AI provider/model/budget 최종 선택
- live validation 모집 경로 확보

## 결론

P4 패키지는 여전히 `EVIDENCE_UNVALIDATED`입니다. 다만 구현자가 임의 해석해야 했던 backend/auth/AI/design 경계는 현재 프로젝트 보정 문서로 닫았습니다.
