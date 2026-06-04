# Framework install paths

The npm installer copies this same Agent Skills-compatible folder into framework-specific roots.

| Framework | Project scope | Global scope |
|---|---|---|
| Claude Code | `.claude/skills/commercial-license-skill` | `~/.claude/skills/commercial-license-skill` |
| Codex | `.agents/skills/commercial-license-skill` | `~/.agents/skills/commercial-license-skill` |
| OpenClaw | `skills/commercial-license-skill` | `~/.openclaw/skills/commercial-license-skill` |
| Hermes Agent | — | `~/.hermes/skills/commercial-license-skill` |
| Gemini CLI | `.gemini/skills/commercial-license-skill` | `~/.gemini/skills/commercial-license-skill` |
| GitHub Copilot | `.github/skills/commercial-license-skill` | `~/.copilot/skills/commercial-license-skill` |
| Universal fallback | `.agents/skills/commercial-license-skill` | `~/.agents/skills/commercial-license-skill` |

Codex and Copilot can both discover `.agents/skills`. The installer keeps dedicated adapters so users can intentionally choose the surfaces they use.

