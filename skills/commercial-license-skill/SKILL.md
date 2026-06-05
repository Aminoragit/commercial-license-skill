---
name: commercial-license-skill
description: Scan a software project for licenses that may restrict commercial use or require disclosure of proprietary source code; explain engineering risk, identify usage paths, recommend permissive MIT/Apache/BSD alternatives, and prepare reviewable migration patches. Use for GPL, AGPL, LGPL, SSPL, BUSL, Commons Clause, source-available, open-source due diligence, license audit, dependency replacement, or pre-release compliance checks.
license: Apache-2.0
compatibility: Requires Node.js 18.17+ and npx. Designed for Agent Skills-compatible coding agents including Claude Code, Codex, OpenClaw, Hermes, Gemini CLI, and GitHub Copilot.
metadata:
  author: commercial-license-skill contributors
  version: "0.3.3"
---

# CommercialLicenseSkill

Use this skill to run an engineering-first open-source license triage. Do not present the result as legal advice and do not claim that a license automatically “infects” an entire codebase merely because it appears in a manifest.

## Safety boundary

Never copy, translate, mechanically rewrite, or derive implementation code from a GPL, AGPL, SSPL, source-available, or otherwise restricted implementation to produce a permissively licensed replacement. A replacement implementation must be clean-room: derive requirements from the user's own call sites, public API documentation, standards, and tests. Preserve attribution and notices where required. Ask for qualified legal review before release when obligations remain uncertain.

## Workflow

1. Run a machine-readable scan:

   ```bash
   npx commercial-license-skill@0.3.3 scan . --format json --output .commercial-license-skill/report.json
   ```

2. Read `.commercial-license-skill/report.json`. Start with `critical`, then `high`, then `review` items. Treat `UNKNOWN` as unresolved rather than safe.

3. For every non-allowlisted dependency, inspect actual usage:
   - Find import, require, dynamic import, FFI, build, Docker, shell, and subprocess references.
   - Separate direct from transitive dependencies.
   - Identify runtime, development-only, optional, and peer dependency scope.
   - Determine whether the project is SaaS-only, distributed software, on-premise, mobile, desktop, CLI, SDK, library, or container image.
   - Record whether the dependency is bundled, statically linked, dynamically linked, modified, or called as a separate executable.

4. Explain the result in engineering language:
   - **Confirmed metadata:** package, version, declared license, evidence file, call sites.
   - **Risk hypothesis:** why review is needed based on distribution and integration.
   - **Unknowns:** exact license text, exceptions, dual-license terms, linking mode, deployment details.
   - **Recommended action:** keep with notice, isolate behind process boundary, replace, remove, or escalate to counsel.

5. Recommend alternatives:
   - Prefer actively maintained alternatives with MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, or similarly permissive terms.
   - Provide at least two candidates when possible.
   - Verify the exact repository license and the license of critical transitive dependencies. Never rely solely on a search snippet or model memory.
   - Estimate API fit from the project's actual call sites. Do not claim drop-in compatibility without tests.

6. For an approved migration, create a reviewable patch:
   - Update manifests and lock files.
   - Change imports and adapters.
   - Add or update tests for every used behavior.
   - Run build, lint, unit tests, and relevant integration tests.
   - Show `git diff --stat` and summarize unresolved risks.

## Useful commands

```bash
npx commercial-license-skill@0.3.3 scan . --format human
npx commercial-license-skill@0.3.3 scan . --format sarif --output reports/commercial-license-skill.sarif --fail-on high
npx commercial-license-skill@0.3.3 recommend <package-name> --online --json
npx commercial-license-skill@0.3.3 mcp
```

## References

Read `references/license-review-checklist.md` when a dependency is flagged. Read `references/framework-install-paths.md` when troubleshooting installation.


