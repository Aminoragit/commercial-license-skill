# CommercialLicenseSkill architecture

## 1. Portable skill layer

`skills/commercial-license-skill/SKILL.md` follows the Agent Skills format. The same folder is copied into the framework-specific skill root selected by the user.

## 2. npm CLI layer

`npx commercial-license-skill install` detects common agent commands and config directories, then installs the skill globally or per project. `scan` builds a local dependency inventory, classifies license metadata with a conservative policy, emits human/JSON/SARIF output, and attaches curated replacement candidates. `mcp` exposes the same scanner through a stdio MCP server. Optional npm-registry discovery is isolated behind `recommend --online`.

## 3. Static analysis & Resolvers

The analyzer engine separates dependency discovery (fact collection) from license classification (policy logic).

### Supported Resolvers (Current)
- **Node.js (npm):** Parses `package.json` for direct dependencies and `package-lock.json` or `node_modules` for transitive dependencies.
- **Python:** Resolves packages from `requirements.txt` / `requirements-dev.txt` and attempts to verify license details dynamically from local `.dist-info/METADATA` structures.
- **Rust (Cargo):** Parses package definitions from `Cargo.lock` to extract dependencies.
- **Go:** Extracts dependencies and transitives from `go.mod`.
- **System Commands & Vendored Licenses:** Scans source code for system-level invocations (ffmpeg, imagemagick, ghostscript) and searches vendor directories for copyleft license file declarations.

### Planned Upgrades (Roadmap)
- Lockfile resolvers for `pnpm-lock.yaml`, `yarn.lock`, `uv.lock`, and Poetry manifests.
- AST import graph and build-artifact tracing.
- Optional GitHub API enrichment for repository license, maintenance activity, stars, and replacement discovery via `--online`.
- Package-manager-aware migration adapters and test-plan generation.
- CI Action wrappers and richer MCP installers.

## 4. Clean-room replacement rule

The tool may generate adapters and replacement code only from the user's own call sites, public API docs, standards, and tests. It must never rewrite restricted implementation source into a permissively licensed clone.


