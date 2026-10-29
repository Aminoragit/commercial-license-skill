# Evidence and replacement checklist

## Inventory beyond a single manifest

- Manifests, supported and unsupported lockfiles, workspace packages, SBOMs, nested dependencies, optional/peer and build/dev dependencies.
- Native executables, image/video codecs, containers and OS packages; inspect the actual binary/build flags, not just a JavaScript wrapper.
- Vendored files, copied snippets, generated bundles, templates, fonts, icons, photos, illustrations, models, weights and datasets. Inspect origin links, sidecar terms, attribution and purchase records.
- SaaS and client-distributed portions separately, including browser JavaScript and SDKs. A dev-only package may contribute code/assets to the shipped build.

## Minimum evidence per component

Identity/version or commit; origin and artifact path/URL; license expression and exact text; retrieval date and hash when practical; direct/transitive/dev scope; local usage/build evidence; modifications and distribution; notices and source obligations; unresolved conflicts. A metadata declaration is weaker than checking the selected artifact. Missing provenance means unresolved.

## Candidate gate

1. Exact version/commit exists and is obtainable from a primary upstream source.
2. Its actual artifact terms satisfy the user's requested conditions, including exceptions and separately licensed files.
3. Critical transitive/native components are checked; unresolved dependencies are named.
4. Required APIs, output quality, platforms, performance, maintenance and cost have evidence. Record release dates and deprecation information rather than inventing a maintenance score.
5. Migration work and tests cover the user's operations. No drop-in claim without a matching API and executed tests.

If any gate lacks evidence, label the candidate `unverified` or `partial` and state the missing check. Do not manufacture a second recommendation to fill a table. Search results and the built-in catalog are leads, not adoption decisions.

## Release follow-through

Keep required LICENSE/NOTICE and attribution material, modification records and source offers. Remove an old dependency only after verifying it is absent from the lockfile, bundles, containers and copied assets in scope. Re-scan the final artifact where tooling permits; document remaining inventory gaps. Do not upload proprietary source or run scripts from inspected packages during this review.
