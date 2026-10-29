# CLI reference

Use a checkout-installed `commercial-license-skill` for the unreleased 0.4.0 features, or invoke `node /path/to/checkout/bin/commercial-license-skill.mjs` directly. Check `--version` and `--help` before relying on options in older npm releases.

## Commands

| Command | Purpose |
|---|---|
| `scan [path]` | Local dependency inventory and license triage |
| `recommend <package>` | Filter catalog leads and optionally search npm |
| `install` / `uninstall` | Copy/remove the skill in selected host directories |
| `doctor --json` | Show adapter and detection information |
| `mcp --allow-root <path>` | Expose the scanner and recommender as stdio tools |

`leechshield` remains a binary alias. [MCP configuration and tool arguments](MCP_SETUP.ko.md).

## Scan options

| Option | Purpose |
|---|---|
| `--allowed-licenses MIT,Apache-2.0` | Explicit accepted license identifiers |
| `--include-dev` | Include development dependencies |
| `--format human\|json\|sarif` | Choose output format |
| `--output file` | Write the report to a file |
| `--fail-on review\|high\|critical` | Exit 2 when a finding meets the threshold |
| `--ignore name1,name2` | Exclude named dependencies; does not establish permission |
| `--no-snippets` | Redact source snippets |
| `--max-snippet-length 240` | Limit snippet text length |

Exit codes: 0 means completed without a configured threshold failure; 1 means invalid input or an execution error; 2 means findings reached the requested threshold. Without `--fail-on`, findings do not change exit status. Use `review` to block unknown licenses as well as higher-priority findings.

## Saved project conditions

Place `commercial-license-skill.config.json` in the scanned project's root:

```json
{
  "allowedLicenses": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "includeDev": true,
  "noSnippets": true,
  "ignorePackages": []
}
```

Explicit CLI values override config values. A complete `OR` branch may satisfy the allowlist; all `AND` terms must satisfy it. Exceptions and conflicts remain subject to review. License choice does not replace the analysis of source disclosure, notices, deployment and paid entitlements.

## Reports and CI

```bash
commercial-license-skill scan . --format sarif --output reports/licenses.sarif --include-dev --no-snippets --fail-on review
```

JSON includes `policy`, `coverage`, `licenseDeclarations`, `assessment`, `usageEvidence` and `recommendations`. `allow` describes recognized permissive metadata; `review` covers unresolved or file/library copyleft; `high` covers copyleft review or an explicit allowlist mismatch; `critical` prioritizes service/network, non-commercial and custom restrictions. None of these levels establishes legal clearance.

The inventory is partial: pnpm/Yarn/uv/Poetry locks, nested workspaces, binary contents, out-of-root symlinks and assets without license evidence need additional inspection. No usage match is not proof of no use. Required notices must be retained even for permissive components.

## Candidate discovery

```bash
commercial-license-skill recommend imagemagick --allowed-licenses MIT --json
commercial-license-skill recommend imagemagick --online --query "image processing" --allowed-licenses MIT --json
```

Catalog leads are `unverified`; online npm candidates are `metadata-only`. Search sends only the query to public npm. Check versioned artifact terms, important transitive/native dependencies, maintenance and actual API coverage before recommending adoption.

## Installation

Use `--project` or `--global`, select `--frameworks`, and add `--dry-run` to preview writes. Existing folders receive timestamped backups. Shared paths are copied once. A detected host is not proof that the skill has loaded. [Host paths and limitations](../skills/commercial-license-skill/references/framework-install-paths.md).
