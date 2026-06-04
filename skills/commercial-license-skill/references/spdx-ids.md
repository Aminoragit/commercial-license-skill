# SPDX Identifier Reference

`commercial-license-skill` parses standard SPDX license expressions to evaluate risks. Below is a reference of common SPDX identifiers mapped to our triage profiles.

## Permissive (ALLOW Profile)
- `MIT`
- `Apache-2.0`
- `BSD-2-Clause`
- `BSD-3-Clause`
- `ISC`
- `Unlicense`
- `WTFPL`
- `CC0-1.0`

## Weak Copyleft / Hybrid (REVIEW Profile)
- `LGPL-2.0-only` / `LGPL-2.0-or-later`
- `LGPL-2.1-only` / `LGPL-2.1-or-later`
- `LGPL-3.0-only` / `LGPL-3.0-or-later`
- `MPL-2.0`
- `EPL-1.0` / `EPL-2.0`
- `CDDL-1.0` / `CDDL-1.1`

## Strong Copyleft (CRITICAL / HIGH Profile)
- `GPL-2.0-only` / `GPL-2.0-or-later`
- `GPL-3.0-only` / `GPL-3.0-or-later`
- `AGPL-3.0-only` / `AGPL-3.0-or-later`
- `SSPL-1.0`
- `BUSL-1.1` (Business Source License)
- `EUPL-1.2`
- `CC-BY-NC-4.0` (Non-commercial variations)

## Multi-Licensing & Expressions
Expressions like `(MIT OR GPL-3.0)` are resolved dynamically. By default, dual-licensing containing at least one permissive option is classified as **ALLOW**, provided you select the permissive licensing path.
