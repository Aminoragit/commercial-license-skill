<p align="center">
  <img src="docs/assets/license-hero.png" alt="Commercial License Skill — license documents under a magnifying lens, with the message Know your licenses. Choose your terms." width="1200">
</p>

<h1 align="center">commercial-license-skill</h1>
<p align="center"><strong>Know your licenses. Choose your terms.</strong><br>Evidence-first license review and alternative discovery for AI coding assistants.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-9fe5ce?style=flat-square" alt="Apache-2.0 license"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-9fe5ce?style=flat-square" alt="Node.js 18.17 or newer"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-9fe5ce?style=flat-square" alt="Zero runtime dependencies"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/0.4.0-unreleased-f2c078?style=flat-square" alt="0.4.0 unreleased"></a>
</p>

<p align="center">
  English · <a href="README.ko.md">한국어</a><br>
  <a href="#quick-start">Quick start</a> · <a href="#choose-your-conditions">Your conditions</a> · <a href="#use-it-with-your-assistant">Assistants</a> · <a href="#coverage-and-limits">Coverage</a> · <a href="docs/REVIEW.md">Adversarial review</a>
</p>

Identify the licenses behind your dependencies and assets, compare them with your commercial-use and source-sharing requirements, and investigate alternatives that fit. One portable **Agent Skill**, a **local CLI** and a **stdio MCP server** share the same review approach.

> [!IMPORTANT]
> **Commercial use and keeping source private are different requirements.** GPL/AGPL are not blanket bans on commercial activity. Obligations depend on the selected grant, modifications, integration and distribution. This project supports engineering review; it does not issue legal clearance.

## What you get

| Identify | Evaluate | Find a way forward |
|---|---|---|
| Package/version, declared license, evidence paths and usage references | Your accepted licenses, SPDX branches, copyleft triggers and unresolved terms | Candidate leads, API gaps, transitive risks and a reviewable migration plan |

- **Your conditions matter.** Restrict a review to MIT, Apache-2.0 or another explicit set.
- **Evidence stays visible.** Missing and conflicting declarations remain unresolved; exclusions and coverage gaps appear in reports.
- **Beyond packages.** The skill guides review of fonts, icons, images, copied code, models, weights and datasets. This broader review uses agent tools and supplied evidence.
- **Local by default.** Scans do not install packages or query registries. Optional online discovery sends only your search query to npm.

## Quick start

**Node.js 18.17+ · no dependency installation required.** Version 0.4.0 is an unreleased checkout; use these local commands to get the features documented here. An older npm release may behave differently.

```bash
git clone https://github.com/Aminoragit/commercial-license-skill.git
cd commercial-license-skill

# Inspect a project. Replace ../your-project with its path.
node ./bin/commercial-license-skill.mjs scan ../your-project --format human

# Install the skill into this workspace for your coding assistants.
node ./bin/commercial-license-skill.mjs install --project --frameworks codex,claude-code,antigravity,gemini-cli --yes
```

Use `--dry-run` to preview installation, or `--global` for a user-level installation. Existing skill folders receive timestamped backups. Shared destinations are copied once. Use `doctor --json` to inspect adapters; detection does not prove a host has loaded the skill.

Already using a published release? `npx commercial-license-skill help` shows that release's capabilities. After 0.4.0 is published, its CLI can also be run through npm. This change does not publish or install anything into your accounts.

## Choose your conditions

```bash
# Accept only MIT or Apache-2.0; fail CI for unresolved or higher-priority findings.
node ./bin/commercial-license-skill.mjs scan ../your-project --allowed-licenses MIT,Apache-2.0 --include-dev --no-snippets --fail-on review

# Filter known candidates to MIT.
node ./bin/commercial-license-skill.mjs recommend imagemagick --allowed-licenses MIT --json

# Optionally discover candidates by required capability in the public npm registry.
node ./bin/commercial-license-skill.mjs recommend imagemagick --online --query "image processing" --allowed-licenses MIT --json
```

Or put this file in the **scanned project's root** as `commercial-license-skill.config.json`:

```json
{
  "allowedLicenses": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "includeDev": true,
  "noSnippets": true,
  "ignorePackages": []
}
```

Explicit CLI values override config values. A complete `OR` branch may satisfy the list; every `AND` term must satisfy it. Exceptions, unknowns and conflicts need review. An allowlist controls metadata matching; the agent separately assesses requirements such as source disclosure, notices, paid entitlements and deployment.

<p align="center">
  <img src="docs/assets/license-workflow.png" alt="Three illustrated stages: inspect component evidence, choose license conditions, compare candidate fit and verification checks." width="1200">
  <br><sub>Inventory → conditions → verified comparison. Original AI-generated concept artwork, not a product screenshot.</sub>
</p>

## Use it with your assistant

The portable entry point is [`SKILL.md`](skills/commercial-license-skill/SKILL.md). Ask your assistant:

```text
Use commercial-license-skill to review this project for a commercial desktop app.
Accept MIT, Apache-2.0 and BSD-3-Clause. Keep our application source private.
Include dependencies, native binaries, fonts, icons and bundled assets.
Show exact evidence, unresolved obligations and alternatives that cover our used APIs.
Label unverified candidates and estimate migration effort before changing dependencies.
```

| Surface | Integration in this project |
|---|---|
| Codex | `--frameworks codex` → `.agents/skills/` |
| Claude Code | `--frameworks claude-code` → `.claude/skills/` |
| Antigravity / agy CLI | `--frameworks antigravity` → `.agents/skills/`; dedicated CLI global path |
| Gemini CLI | `--frameworks gemini-cli` → `.gemini/skills/` |
| ChatGPT, Claude, Gemini chat | Use the host's supported skill/file import, or supply the skill and evidence as context. Filesystem access and execution depend on the host. |
| OpenClaw, Hermes, GitHub Copilot | Additional filesystem adapters; see [paths and capability boundaries](skills/commercial-license-skill/references/framework-install-paths.md). |

The installer tests folder placement, backups and shared paths. It does not certify live integration with every host. In a chat without project/shell access, the skill reviews supplied files and clearly reports that narrower scope.

## Read the result

| Level | Meaning | Next step |
|---|---|---|
| `allow` | Recognized permissive metadata matches applicable conditions | Verify the artifact and retain required notices |
| `review` | Unknown, ambiguous, file/library copyleft or exception | Resolve text, rights and integration facts |
| `high` | Copyleft review or explicit allowlist mismatch | Review the relevant grant; comply, replace or remove |
| `critical` | Service/network, non-commercial or custom restrictions | Resolve exact terms and any entitlement before release |

For example, `(MIT OR Apache-2.0) AND GPL-3.0-only` remains `high`: the GPL term is cumulative. `MIT OR GPL-3.0-only` may select MIT only after confirming that grant covers the artifact. No source match is not proof of no use.

Candidate results are deliberately labeled **`unverified`** (catalog) or **`metadata-only`** (npm search). Neither status proves repository/artifact licensing, maintenance, transitive compatibility or drop-in API coverage. The skill performs those follow-up checks when the host provides the tools and evidence. No suitable candidate is a valid result.

## CLI and MCP

<details>
<summary><strong>CLI reference</strong> — commands, reports and exit codes</summary>

| Command | Purpose |
|---|---|
| `scan [path]` | Local inventory with `--format human\|json\|sarif` and optional `--output file` |
| `recommend <package>` | Filter catalog leads; add `--online --query "keywords"` for npm discovery |
| `install` / `uninstall` | Choose `--project` or `--global`, `--frameworks`, and optional `--dry-run` |
| `doctor --json` | List detected and supported filesystem adapters |
| `mcp --allow-root <path>` | Start stdio tools with access to the current directory and explicit additional roots |

Scan options: `--allowed-licenses`, `--include-dev`, `--ignore name1,name2`, `--no-snippets`, `--max-snippet-length`, `--fail-on review\|high\|critical`. `ignorePackages` are excluded findings, not approved grants. JSON includes `policy`, `coverage`, `licenseDeclarations`, `assessment`, `usageEvidence` and `recommendations`.

Exit codes: **0** completed without a configured threshold failure; **1** invalid input or execution error; **2** findings reached `--fail-on`. Without `--fail-on`, findings do not change exit status. To block unknown licenses, choose `review`, not `high`. The `leechshield` binary remains an alias.

```bash
node ./bin/commercial-license-skill.mjs scan ../your-project --format sarif --output reports/licenses.sarif --include-dev --no-snippets --fail-on review
```

</details>

The MCP server exposes `scan_project_licenses` and `recommend_permissive_alternatives` with the same license conditions. Use an **absolute path** to this checkout and explicitly allow the project directory:

```json
{
  "mcpServers": {
    "commercial-license-skill": {
      "command": "node",
      "args": ["/absolute/path/to/commercial-license-skill/bin/commercial-license-skill.mjs", "mcp", "--allow-root", "/absolute/path/to/your-project"]
    }
  }
}
```

Client setup differs by product. See [MCP setup and tool arguments](docs/MCP_SETUP.ko.md); local stdio is not interchangeable with a remotely hosted connector.

## Coverage and limits

| Input | What the local scanner resolves |
|---|---|
| npm | Root `package.json`, v2/v3 `package-lock.json`, bounded installed `node_modules` metadata; direct/dev/optional/peer scopes |
| Python | Root requirements files and local `.dist-info/METADATA`, including `License-Expression` |
| Rust / Go | Root `Cargo.lock` / `go.mod` inventory; license remains `UNKNOWN` until separately resolved |
| Native / vendored | Heuristic executable references and license files under vendor directories; confirm actual build and origin |
| Assets, models, unsupported locks, workspaces, built artifacts | Agent-assisted inspection required; not an exhaustive automatic scan |

Source tracing uses bounded regex searches, not a full dependency/build graph. pnpm, Yarn, uv and Poetry locks are not resolved. Symlinked or out-of-root dependencies need separate inspection. A report always marks local coverage as partial. Code snippets can contain sensitive data; use `--no-snippets` before sharing reports.

## Verification and contribution

```bash
npm test
npm run docs:check
npm run pack:check
```

See the [four-round adversarial review](docs/REVIEW.md) for reproduced failures, fixes, checks and remaining limitations. [Agent evaluation scenarios](skills/commercial-license-skill/evals/evals.json) are a manual rubric, not a claim that every model has passed them. Contributions should include primary license evidence, realistic failure cases and tests of observable behavior. Preserve independent replacement work and required notices.

[Architecture](docs/ARCHITECTURE.md) · [Security](SECURITY.md) · [Publishing](docs/PUBLISHING.ko.md) · [Changelog](CHANGELOG.md)

## Design and license

The README takes structural inspiration from [Ollama](https://github.com/ollama/ollama), [uv](https://github.com/astral-sh/uv) and [bat](https://github.com/sharkdp/bat): a distinct visual header, useful navigation, an immediate quick start and progressive detail. Their artwork and logos are not reused. [Artwork prompts and provenance](docs/assets/ARTWORK.md) document this project's generated visuals.

Project code, documentation and original generated artwork: [Apache-2.0](LICENSE), to the extent applicable rights are held. Reviewed third-party components retain their own licenses.
