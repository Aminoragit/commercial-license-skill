# Executable documentation example

`before/` and `after/` are **synthetic documentation fixtures**, not published packages or third-party implementations. `gpl-demo` is only a made-up metadata entry. Do not install it. The `before` application demonstrates a call site and is not executable without an implementation. No GPL implementation is included or translated.

The demonstrated requirement is removing duplicate primitive values while preserving first appearance. The replacement uses JavaScript's built-in `Set`; broader compatibility with a real package is not implied. Source, manifest and lockfile changes are shown together.

From the repository root:

```bash
node ./bin/commercial-license-skill.mjs scan docs/examples/before --allowed-licenses MIT,Apache-2.0 --no-snippets --fail-on review
node ./bin/commercial-license-skill.mjs scan docs/examples/after --allowed-licenses MIT,Apache-2.0 --no-snippets --fail-on review
git diff --no-index -- docs/examples/before/src/unique.mjs docs/examples/after/src/unique.mjs
```

Expected scan exit codes are 2 before and 0 after. No dependency findings in the second scan establish only the local dependency inventory, not universal release clearance.

The terminal images display actual local CLI output, typeset in a terminal frame. Long reports are visibly marked as excerpts; the full output remains in `transcripts/`. The platform cards are **workflow examples**, not native app screenshots, recorded model responses or proof that every host was executed. They show the documented adapter path, a suggested request and the same demonstrated patch. Chat-only hosts receive supplied files and return a suggested diff unless their environment separately grants editing access.

The report, candidate discovery and source diff images can be reproduced from these fixtures and the CLI. Existing host path references are in [the installation guide](../../skills/commercial-license-skill/references/framework-install-paths.md).

To refresh the rendered examples, run `node scripts/render-examples.mjs` from the repository root with Playwright available to that script. `README_RENDER_MODULES` can point to an existing dependency directory and `README_BROWSER` to a browser executable. The renderer executes scans, verifies the four shown behaviors, saves full transcripts, installs the skill only in `.commercial-license-skill/qa/installer-demo`, and captures HTML frames. It does not call any hosted model or alter user-level host configuration. Playwright is an authoring dependency, not a product runtime dependency.
