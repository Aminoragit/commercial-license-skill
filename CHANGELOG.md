# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-06-04

### Changed
- Bumped version to 0.3.1 to prepare for publication with npm provenance (`--provenance`).

## [0.3.0] - 2026-06-04

### Added
- Created `.claude-plugin/plugin.json` for Claude Code marketplace compatibility.
- Added `checkpoints.yaml` for Agent Skill registration verification.
- Added `evals/evals.json` containing 5 quality assessment scenarios for AI agents.
- Added reference documents: `references/license-matrix.md` (compliance rules) and `references/spdx-ids.md` (SPDX identifier reference).
- Added dynamic version resolution from `package.json` in `src/scan.mjs` (SARIF report) and `src/registry.mjs` (User-Agent string).
- Added `package-lock.json` to ensure reproducible builds.
- Documented `leechshield` CLI alias, CI/CD integration, and comprehensive flag details in READMEs.

### Fixed
- Corrected License badges in `README.md` and `README.ko.md` to show `Apache-2.0` instead of `MIT` (reconciling mismatch with `package.json`).

## [0.2.1] - 2026-05-15

### Added
- Added package files whitelist.
- Refined TUI layout display for CLI scan execution.

## [0.2.0] - 2026-04-20

### Added
- Introduced stdio-based MCP (Model Context Protocol) server mode.
- Added SARIF output format support for CI/CD tools.

## [0.1.0] - 2026-03-01

### Added
- Initial release.
- Added dependency `scan` command for Node.js, Python, Rust, and Go ecosystems.
- Added interactive `install` command for registering Agent Skills.
