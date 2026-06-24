# 2026-06-24 shared AI secrets env setup

Actor: codex
Date: 2026-06-24

## User Request

- DeepSeek API key를 모든 프로젝트가 기본 참조할 수 있게 구성.

## Decisions

- `.env.server.local`은 `/Users/kangsungbae/.config/sungbae/shared-env/ai-secrets.env.local`을 참조한다.
- `.env.local`은 Supabase public 값용, `.env.server.local`은 server-only AI secret용으로 분리한다.
- DeepSeek key는 클라이언트 앱 번들에 넣지 않고 backend/Supabase Edge Function/server proxy에서만 쓴다.

## Files Changed

- `.env.server.local`
- `.env.example`
- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`

## Verification

- `.env.server.local` symlink target verified.
- Shared AI secrets file permission verified as `600`.
- Project bootstrap helper completed without syntax error.

## Remaining User Action

- 성배님이 shared AI secrets 파일에 실제 `DEEPSEEK_API_KEY`를 입력한다.
- 배포용 backend/Edge Function secret에도 같은 키를 별도로 설정한다.

## Knowledge Promotion

- Global/shared knowledge store updated by the main Codex session.
