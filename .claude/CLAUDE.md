
## Custom Subagent Routing

When the user explicitly asks for subagents, parallel agents, delegation, or a named custom agent:

- First consult `/Users/kangsungbae/.codex/agents/` and `/Users/kangsungbae/.codex/agent-routing/subagent-backends.toml`.
- Treat `subagent-backends.toml` as the source of truth for preferred backend/model routing.
- Prefer the routing file's external primary or secondary backend, such as `agy`/Gemini or Claude, before native Codex fallback when specified.
- Before using Claude CLI or Antigravity CLI (`agy`), run the auth checks from the global instructions: `claude auth status` for Claude and `agy -p 'Reply with exactly: AGY_AUTH_OK' --print-timeout 45s` for `agy`.
- If the preferred external backend is unavailable, unauthenticated, quota-limited, timed out, or rejected, tell 성배님 plainly and mark the run as degraded before falling back. Do not silently substitute GPT/native Codex for a custom-routed external worker.
- Subagents return a `세션로그용 요약 블록`; the main Codex/Claude session writes project-local `ai/session-logs/` when needed.
# graphify
- **graphify** (`.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.
