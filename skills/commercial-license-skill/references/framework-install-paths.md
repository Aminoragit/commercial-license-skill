# Host installation and capability boundaries

The installer copies the same skill folder; it does not enable shell, browsing or MCP support in a host. Verify availability in the host after installation. Official path references were checked on 2026-10-29; adapter tests validate filesystem behavior, not live end-to-end integration with every product.

| Adapter | Project | Global |
|---|---|---|
| `claude-code` | `.claude/skills/commercial-license-skill` | `~/.claude/skills/commercial-license-skill` |
| `codex` | `.agents/skills/commercial-license-skill` | `~/.agents/skills/commercial-license-skill` |
| `antigravity` (agy CLI) | `.agents/skills/commercial-license-skill` | `~/.gemini/antigravity-cli/skills/commercial-license-skill` |
| `gemini-cli` | `.gemini/skills/commercial-license-skill` | `~/.gemini/skills/commercial-license-skill` |
| `openclaw` | `skills/commercial-license-skill` | `~/.openclaw/skills/commercial-license-skill` |
| `hermes` | Not provided by this adapter | `~/.hermes/skills/commercial-license-skill` |
| `copilot` | `.github/skills/commercial-license-skill` | `~/.copilot/skills/commercial-license-skill` |
| `universal` | `.agents/skills/commercial-license-skill` | `~/.agents/skills/commercial-license-skill` |

Shared destinations are copied once. `--dry-run` previews writes. Updating an existing folder creates a timestamped backup; a failed backup stops installation rather than deleting user edits. Installation does not delete the skill's own source folder.

Antigravity App/IDE uses `.agents/skills` per workspace and `~/.gemini/config/skills` globally; the `antigravity` adapter specifically targets **agy CLI** globally. Copy the folder to the App/IDE path manually if that is the intended surface. Gemini CLI also accepts `.agents/skills` aliases; avoid retaining conflicting copies in both paths.

For ChatGPT, Claude or Gemini chat interfaces, use the host's documented skill/file import feature where available, or supply `SKILL.md`, the relevant references, manifests and license artifacts as context. A directory on your workstation is not automatically visible to a web chat. When shell/project access is absent, use instruction-only review and explicitly bound the findings to supplied files. Native installation, local stdio MCP and remote connectors differ by product, account and administrator configuration; do not promise one universal setup.

Primary sources: [Codex and ChatGPT skills](https://learn.chatgpt.com/docs/build-skills), [Claude Code skills](https://code.claude.com/docs/en/skills), [Gemini CLI skills](https://geminicli.com/docs/cli/skills/), [Antigravity skills](https://antigravity.google/docs/skills).
