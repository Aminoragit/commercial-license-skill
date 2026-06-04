# License review checklist

ParasiteCleaner provides engineering triage, not legal advice. For each flagged component, capture:

1. Exact package, version, repository URL, package registry URL, and license file hash.
2. SPDX identifier if available, plus exceptions, dual-license options, and custom clauses.
3. Whether the component is direct, transitive, dev-only, optional, bundled, modified, or invoked as a separate executable.
4. Delivery model: SaaS-only, distributed binary, client app, mobile app, on-premise deployment, SDK, CLI, container image, or source release.
5. Evidence: manifest, lock file, import references, build configuration, Dockerfile, shell command, and output artifact inspection.
6. Replacement candidates: repository, exact license, maintenance activity, transitive dependency risk, API-fit estimate, and migration test plan.
7. Notices, attributions, source offers, and modification records to preserve.

## Default engineering policy

- Allow by default: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Zlib, BSL-1.0, CC0-1.0, Unlicense.
- Manual review: MPL, EPL, CDDL, LGPL, unknown, compound SPDX expressions, dual licenses, exceptions.
- Escalate immediately: AGPL, SSPL, GPL in distributed or bundled outputs, BUSL, Commons Clause, Elastic License, non-commercial clauses, proprietary or custom terms.

The policy is intentionally conservative. Legal obligations depend on exact license terms and facts.
