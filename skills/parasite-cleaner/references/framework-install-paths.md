# Framework install paths

The npm installer copies this same Agent Skills-compatible folder into framework-specific roots.

| Framework | Project scope | Global scope |
|---|---|---|
| Claude Code | `.claude/skills/parasite-cleaner` | `~/.claude/skills/parasite-cleaner` |
| Codex | `.agents/skills/parasite-cleaner` | `~/.agents/skills/parasite-cleaner` |
| OpenClaw | `skills/parasite-cleaner` | `~/.openclaw/skills/parasite-cleaner` |
| Hermes Agent | — | `~/.hermes/skills/parasite-cleaner` |
| Gemini CLI | `.gemini/skills/parasite-cleaner` | `~/.gemini/skills/parasite-cleaner` |
| GitHub Copilot | `.github/skills/parasite-cleaner` | `~/.copilot/skills/parasite-cleaner` |
| Universal fallback | `.agents/skills/parasite-cleaner` | `~/.agents/skills/parasite-cleaner` |

Codex and Copilot can both discover `.agents/skills`. The installer keeps dedicated adapters so users can intentionally choose the surfaces they use.
