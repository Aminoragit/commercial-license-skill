# Architecture

## Portable review instructions

`skills/commercial-license-skill/SKILL.md` establishes user conditions, evidence standards, version-specific verification, asset review, reporting and migration boundaries. References supply the license matrix, host paths, review checklist and report template. Without execution access, an assistant can review supplied artifacts and must report that narrower scope.

## Local inventory and policy

`detectors.mjs` reads root manifests/locks, bounded installed metadata, executable signals and vendor license files. Records retain observed declarations, version, scope and evidence. Conflicts never select a grant automatically; the scanner retains the stronger known triage severity. This is not an SBOM-complete or build-artifact-complete inventory.

`license-policy.mjs` parses bounded SPDX-style grammar with `WITH > AND > OR`. It classifies license families conservatively and evaluates an optional accepted-license list over complete branches. Unknown IDs and exception terms need further review. It does not implement a full SPDX License List validator or prove legal compatibility.

`scan.mjs` merges project configuration and explicit options, excludes requested scopes, traces bounded source references and reports partial coverage. Human/JSON/SARIF views share the same assessments. Severity is a review priority; it is not a legal ruling.

## Candidate discovery

`catalog.mjs` supplies a small, unverified set of npm leads with functional caveats. `registry.mjs` optionally searches public npm metadata with a timeout; it excludes the queried package itself and filters against the same policy. Neither path downloads implementation code, runs install hooks, verifies every transitive dependency or proves API compatibility. The agent performs those checks using exact primary evidence.

## Interfaces and installation

`cli.mjs` validates options and maps exit status to execution errors or an explicitly requested threshold. Project config controls accepted licenses, dev scope and snippet privacy unless explicitly overridden.

`mcp.mjs` exposes two stdio tools, validates their input types and canonicalizes root paths for its allowlist. It shares the scanner and candidate functions; it is not an OS sandbox or remote hosting service.

`install.mjs` copies the portable folder to selected host directories. Shared paths are deduplicated, existing user edits are backed up and backup failure stops the update. A host still needs to discover the installed skill and provide its own execution/browsing capabilities.

## Validation boundaries

Deterministic tests exercise SPDX decisions, user conditions, local evidence, malformed inputs, online-search filtering with controlled metadata, CLI exit codes, MCP calls and installer behavior. Manual agent rubrics cover higher-level reasoning. Local automation is not proof that every platform or model has passed a live integration run. See [review evidence](REVIEW.md).
