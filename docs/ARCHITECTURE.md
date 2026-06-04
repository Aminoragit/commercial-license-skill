# ParasiteCleaner architecture

## 1. Portable skill layer

`skills/commercial-license-skill/SKILL.md` follows the Agent Skills format. The same folder is copied into the framework-specific skill root selected by the user.

## 2. npm CLI layer

`npx commercial-license-skill install` detects common agent commands and config directories, then installs the skill globally or per project. `scan` builds a local dependency inventory, classifies license metadata with a conservative policy, emits human/JSON/SARIF output, and attaches curated replacement candidates. `mcp` exposes the same scanner through a stdio MCP server. Optional npm-registry discovery is isolated behind `recommend --online`.

## 3. Static analysis roadmap

The MVP deliberately separates fact collection from legal conclusions. Planned upgrades:

- lockfile resolvers for pnpm, yarn, uv, Poetry, Cargo metadata, Maven, Gradle, NuGet, Go module cache, and container SBOMs;
- AST import graph and build-artifact tracing;
- optional GitHub API enrichment for repository license, maintenance activity, stars, and replacement discovery;
- package-manager-aware migration adapters and test-plan generation;
- CI action and richer MCP configuration installers using the same JSON schema.

## 4. Clean-room replacement rule

The tool may generate adapters and replacement code only from the user's own call sites, public API docs, standards, and tests. It must never rewrite restricted implementation source into a permissively licensed clone.

