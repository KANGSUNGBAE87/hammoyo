# 2026-06-24 shared Supabase public env setup

Actor: codex
Date: 2026-06-24

## User Request

- 모든 프로젝트가 같은 Supabase URL/anon key 위치를 참조하도록 구성.

## Decisions

- `hammoyo/.env.local`은 `/Users/kangsungbae/.config/sungbae/shared-env/supabase-public.env.local`을 참조한다.
- `.env.example`에는 placeholder만 둔다.
- `.gitignore`는 `.env.local`, `.env.*.local`을 무시한다.
- service role key, `SUPABASE_ACCESS_TOKEN`, DB password, JWT/webhook secret은 이 public env 경로에 넣지 않는다.

## Files Changed

- `.env.local`
- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- AI project scaffolding under `ai/`

## Verification

- `.env.local` symlink target verified.
- Shared env file permission verified as `600`.
- Project bootstrap helper completed without error.

## Remaining User Action

- 성배님이 shared env 파일에 실제 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 입력한다.

## Knowledge Promotion

- Global/shared knowledge store updated by the main Codex session.
