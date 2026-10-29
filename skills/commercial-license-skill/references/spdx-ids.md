# SPDX expressions and unresolved declarations

The local parser handles bounded expression grammar, not the entire SPDX License List or legal compatibility. It preserves parentheses and evaluates `WITH` before `AND` before `OR`. Unknown identifiers need review; a parse error never results in `allow`. Legacy multi-entry license arrays are ambiguous unless their relationship is independently established.

| Expression | Meaning in the default triage |
|---|---|
| `MIT OR GPL-3.0-only` | MIT is a possible selected grant; record the choice and verify it covers this artifact. |
| `MIT AND GPL-3.0-only` | Both sets of obligations apply; high. |
| `(MIT OR Apache-2.0) AND GPL-3.0-only` | GPL remains cumulative; high. |
| `MIT OR Apache-2.0 AND GPL-3.0-only` | MIT is a standalone branch because AND binds before OR. |
| `GPL-2.0-only WITH Classpath-exception-2.0` | Review the exception text and covered use; retain base severity pending review. |
| `MIT WITH invented-exception` | Review, never automatic allow. |
| `SEE LICENSE IN LICENSE.txt`, `LicenseRef-Custom`, `NOASSERTION`, `NONE` | Resolve text/rights; do not infer commercial permission. |

`--allowed-licenses MIT,Apache-2.0` requires an entire usable branch to match. For `AND`, every operand must match; for `OR`, a complete branch may match. Exceptions and absent rights produce an unresolved match. The selected grant is chosen within the accepted branches, not from a different disallowed branch.

`-only` and `-or-later` express different grants. Do not silently upgrade a version or assume a deprecated identifier establishes an exception. `BSL-1.0` (Boost) and `BUSL-1.1` (Business Source) are different licenses.

Reference: [SPDX specification, Annex D](https://spdx.github.io/spdx-spec/v2.3.1/SPDX-license-expressions/).
