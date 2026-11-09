<p align="center">
  <img src="docs/assets/license-hero.png" alt="commercial-license-skill" width="1200">
</p>

<p align="center"><strong>Identify licenses. Set your conditions. Compare replacements.</strong></p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-9fe5ce?style=flat-square" alt="Apache-2.0"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-9fe5ce?style=flat-square" alt="Node.js 18.17+"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/0.4.0-unreleased-f2c078?style=flat-square" alt="0.4.0 unreleased"></a>
</p>

<p align="center">
  English · <a href="README.ko.md">한국어</a><br>
  <a href="#demo">Demo</a> · <a href="#install">Install</a> · <a href="#platform-examples">Platforms</a> · <a href="docs/CLI.md">CLI / MCP</a>
</p>

A portable skill, CLI and MCP server for reviewing dependencies and assets against your commercial-use, source-sharing and accepted-license requirements.

## Demo

**1. Find the license and its usage.**

![Actual CLI scan output with a GPL finding and source reference](docs/assets/examples/scan.png)

**2. Review the patch.** This synthetic example replaces a deduplication dependency with native `Set`, updates the manifest and lockfile, and checks four behaviors.

![Before and after source code, dependency removal and executed checks](docs/assets/examples/patch.png)

**3. Re-scan.**

![Actual scan after the example patch, exit code 0 and partial coverage](docs/assets/examples/rescan.png)

`gpl-demo` is fictional test metadata. Output images are rendered excerpts from actual CLI runs. [Files, full output and diff](docs/examples/README.md).

## Install

Use the checkout for the unreleased 0.4.0 features:

```bash
git clone https://github.com/Aminoragit/commercial-license-skill.git
cd commercial-license-skill
npm install -g .

cd /path/to/your-project
commercial-license-skill install --project --frameworks codex,claude-code,antigravity,gemini-cli --yes
commercial-license-skill scan . --allowed-licenses MIT,Apache-2.0 --no-snippets
```

For an interactive platform picker, run `commercial-license-skill install --project`:

![Actual interactive installer output with platform selection and installed paths](docs/assets/examples/installer.png)

## Platform examples

These cards show **suggested requests and patch workflows**, not native app screenshots or recorded model sessions. Coding hosts can edit accessible workspace files; chat-only examples return a suggested diff. Click an image to enlarge it.

| Codex | Claude Code |
|---|---|
| [![Codex installation, skill request and example source diff](docs/assets/examples/codex.png)](docs/assets/examples/codex.png) | [![Claude Code installation, skill request and example source diff](docs/assets/examples/claude-code.png)](docs/assets/examples/claude-code.png) |

| Antigravity / agy CLI | Gemini CLI |
|---|---|
| [![agy CLI project skill path and proposed workspace patch](docs/assets/examples/agy.png)](docs/assets/examples/agy.png) | [![Gemini CLI project skill path and proposed workspace patch](docs/assets/examples/gemini-cli.png)](docs/assets/examples/gemini-cli.png) |

| ChatGPT | Claude |
|---|---|
| [![ChatGPT supplied-file review and suggested diff](docs/assets/examples/chatgpt.png)](docs/assets/examples/chatgpt.png) | [![Claude supplied-file review and suggested diff](docs/assets/examples/claude.png)](docs/assets/examples/claude.png) |

Copy this request:

```text
Use commercial-license-skill to review this project.
Accept MIT and Apache-2.0; keep our application source private.
Include dependencies, fonts, icons and bundled assets.
Show license evidence, alternatives and API gaps.
Prepare a patch only after checking the selected candidate's exact terms.
```

[Skill instructions](skills/commercial-license-skill/SKILL.md) · [Host paths and setup](skills/commercial-license-skill/references/framework-install-paths.md)

## Find alternatives

```bash
commercial-license-skill recommend imagemagick --allowed-licenses MIT --json
```

![Actual MIT-filtered candidate JSON with its unverified status](docs/assets/examples/candidates.png)

Catalog and npm search results are discovery leads. Verify the selected version, license text, transitive/native dependencies and used APIs before adoption. Add `--online --query "image processing"` for npm discovery.

## Ask with Superlinked (SIE)

Ask a license question in Korean or English and get the matching clauses, ranked by meaning:

```bash
commercial-license-skill ask "Can I distribute this commercially?"
commercial-license-skill ask "SaaS로 제공하면 소스 공개해야 하나?" --json
```

It searches 36 short clause summaries — 12 licenses (MIT, Apache-2.0, BSD-2/3-Clause, ISC, GPL-2.0/3.0-only, LGPL-2.1/3.0-only, AGPL-3.0-only, MPL-2.0, EPL-2.0) across 3 kinds (commercial use, source disclosure, notice). With a Superlinked API key it embeds the question and the clauses with `BAAI/bge-m3` and ranks them by cosine similarity. Without a key it falls back to local keyword search and says so in the output. No generation model is used; answers are clause summaries with a license id and a score.

Set the key from the environment only — never commit it to the repository:

```bash
export SUPERLINKED_API_KEY="..."   # or SIE_API_KEY
```

Verified 2026-11-09: the SIE model catalog lists 110 models including `BAAI/bge-m3` and `Qwen/Qwen3-Reranker-0.6B`; embedding two short sentences returned 1024-dimension vectors and cost 1 credit. A live `ask` in SIE mode returned `mode: sie` with `AGPL-3.0-only` on top, and one batched call (question + 36 clauses, 1547 tokens) cost 6 credits. Without a key the command runs in local mode.

Cost guardrails: one batched embeddings call (question + 36 clauses), top 5 results, no generation. A single `ask` costs only a few credits at most, so the $520 launch credits cover development and demo use.

Clause texts are summaries, not legal advice. Check the license text before relying on an answer.

## Scope

| Local CLI | Agent follow-up |
|---|---|
| npm manifests/v2–v3 locks, local Python metadata, Cargo/Go inventory, vendored license files and executable signals | Exact upstream grants, fonts/icons/images, models/weights/datasets, unsupported locks, built artifacts and replacement compatibility |

> GPL/AGPL can permit commercial use. Source-sharing obligations depend on the actual grant and use. Scans have partial coverage; an `allow` result is not legal clearance.

[CLI options and CI](docs/CLI.md) · [MCP setup](docs/MCP_SETUP.ko.md) · [Security](SECURITY.md) · [Contributing](docs/CONTRIBUTING.md) · [Review record](docs/REVIEW.md) · [Apache-2.0](LICENSE)
