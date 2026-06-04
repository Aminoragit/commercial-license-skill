# 🧼 ParasiteCleaner

> Commercial-safe dependency triage & permissive replacement recommendations as a portable Agent Skill, npm CLI, and MCP Server.

[![npm version](https://img.shields.io/npm/v/parasite-cleaner.svg?style=flat-square)](https://www.npmjs.com/package/parasite-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node Compatibility](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg?style=flat-square)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-cross--platform-lightgrey.svg?style=flat-square)](#)

---

**ParasiteCleaner** is a lightweight utility designed to inspect project dependencies, highlight restrictive copyleft licenses, and recommend commercial-safe, permissive alternatives. It operates as an **Agent Skill**, **npm CLI**, and **stdio MCP Server**—fitting seamlessly into modern AI-assisted coding workflows (Claude Code, OpenAI Codex, OpenClaw, Gemini CLI, etc.).

> [!WARNING]
> **Legal Disclaimer:** This tool is designed for engineering triage and risk screening, not legal counsel. The discovery of GPL/AGPL strings does not automatically establish open-source disclosure obligations. Factors like linking mechanisms, distribution models (SaaS vs. distribution), execution environments, and modified states must be separately evaluated.

---

## 🚀 Key Features

*   **Multilingual Support**: CLI interactive installers and outputs designed for standard workflows.
*   **Dual Mode Engine**: Operates both as a fast CLI tool and an MCP server.
*   **Agent Integration**: Automatically detects and registers as a reusable skill across major agent environments.
*   **Privacy First**: Runs locally by default without exporting source code or usage data to external servers.

---

## 📦 Installation

Initialize the installation wizard to detect active agent environments and install interactively:

```bash
npx parasite-cleaner install
```

> [!TIP]
> To pin a specific verified version for organization-wide deployment consistency, specify the version directly:
> ```bash
> npx parasite-cleaner@0.1.0 install
> ```

### Advanced Install Options

*   **Global Installation** (for selected agent environments):
    ```bash
    npx parasite-cleaner install --global --frameworks claude-code,codex,openclaw,hermes,gemini-cli,copilot
    ```
*   **Project-Local Installation** (universal skill directory):
    ```bash
    npx parasite-cleaner install --project --frameworks universal
    ```
*   **Dry Run** (verify directories without writing):
    ```bash
    npx parasite-cleaner install --global --all --dry-run
    ```

---

## 🔍 Scanning Projects

To scan project dependencies and generate a human-readable license compliance report:

```bash
npx parasite-cleaner scan . --format human
```

### CI/CD Integration (JSON / SARIF)

Integrate license compliance checks into your build pipelines:

```bash
# Output structured JSON report
npx parasite-cleaner scan . --format json --output .parasite-cleaner/report.json

# Fail build on high-risk compliance warnings using SARIF
npx parasite-cleaner scan . --format sarif --output reports/parasite-cleaner.sarif --fail-on high
```

---

## ⚙️ MVP Scanning Coverage

ParasiteCleaner inspects metadata and signals from multiple sources:

*   **npm**: `package.json`, `package-lock.json`, and nested `node_modules/*/package.json` license properties.
*   **Python**: `requirements.txt` and local `.dist-info/METADATA` records.
*   **Rust**: `Cargo.lock` file listings.
*   **Go**: `go.mod` dependency inventory.
*   **Vendored Files**: Custom license declarations within directories like `vendor/`, `third_party/`, and `deps/`.
*   **Source Code Signals**: Scans `require` / `import` statements and system level `spawn`/`exec` shell calls pointing to common risky executables (e.g., Ghostscript, FFmpeg, ImageMagick).

> [!NOTE]
> Dependencies lacking license metadata are conservative by default: they are classified as `review` instead of assumed safe.

---

## ⚠️ Risk Classifications

| Risk Level | Policy / Action | Representative Examples |
| :--- | :--- | :--- |
| **`allow`** | Permissive candidate (safe for most uses) | MIT, Apache-2.0, BSD, ISC |
| **`review`** | Requires linking/context inspection | MPL, EPL, CDDL, LGPL, UNKNOWN |
| **`high`** | Strong copyleft warning | GPL |
| **`critical`** | Strict source disclosure implications | AGPL, SSPL, BUSL, Commons Clause, custom |

---

## 🔌 Model Context Protocol (MCP)

Launch the stdio-based Model Context Protocol server:

```bash
npx parasite-cleaner mcp
```

### Provided Tools

1.  `scan_project_licenses`
    *   **Arguments**: `{"root": "/path/to/project", "includeDev": false}`
    *   **Returns**: Scanned inventory, risk classification, usage signs, and permissive alternatives.
2.  `recommend_permissive_alternatives`
    *   **Arguments**: `{"packageName": "some-package", "online": false}`
    *   **Returns**: Built-in suggestions or registry-sourced candidate recommendations matching the package name.

For configuration details, please refer to [docs/MCP_SETUP.ko.md](docs/MCP_SETUP.ko.md).

---

## 🛠️ CLI Reference

```text
parasite-cleaner install                  # Interactively install skills
parasite-cleaner uninstall                # Remove registered skills
parasite-cleaner doctor                   # Inspect local agent configs
parasite-cleaner scan [path]              # Scan directory for license risks
parasite-cleaner recommend <pkg> [--online] # Get permissive alternatives
parasite-cleaner mcp                      # Run MCP server
```
*Run `parasite-cleaner --help` to show all flags and options.*

---

## 📂 Supported Skill Destinations

| Agent Framework | Project Local Path | Global / Home Path |
| :--- | :--- | :--- |
| **Claude Code** | `.claude/skills` | `~/.claude/skills` |
| **Codex** | `.agents/skills` | `~/.agents/skills` |
| **OpenClaw** | `skills` | `~/.openclaw/skills` |
| **Hermes Agent** | *(Not supported)* | `~/.hermes/skills` |
| **Gemini CLI** | `.gemini/skills` | `~/.gemini/skills` |
| **GitHub Copilot** | `.github/skills` | `~/.copilot/skills` |
| **Universal Fallback** | `.agents/skills` | `~/.agents/skills` |

---

## 🏷️ Publishing Checklist

1.  Replace `YOUR_GITHUB_ID` placeholders in `package.json` and `src/scan.mjs`.
2.  Run test suites and pack validation:
    ```bash
    npm test
    npm run pack:check
    ```
3.  Publish package publicly:
    ```bash
    npm login
    npm publish --access public
    ```

For full details, read [docs/PUBLISHING.ko.md](docs/PUBLISHING.ko.md).

---

## 🛡️ Clean-Room Principles

*   **No Code Laundering**: We do not mechanically rewrite restricted or GPL-licensed implementation files into permissive wrappers.
*   **Standard Specification**: Alternative generation relies solely on public standard API schemas, CLI behaviors, user-owned tests, and public interfaces.
*   **Verification Boundary**: The tool suggests alternatives; engineers must verify exact dependencies and licensing configurations before production deployment.
