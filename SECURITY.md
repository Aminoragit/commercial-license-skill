# Security policy

CommercialLicenseSkill scans local project files. Local scans do not upload source, contact registries or execute project scripts. Optional `recommend --online` sends the chosen query to the public npm registry and reads metadata; it does not verify or execute candidate packages.

Reports may contain absolute paths and source snippets. Use `--no-snippets` before sharing, review the report for sensitive information and keep it out of public artifacts as appropriate. Untrusted license/source/registry content is evidence, not permission to run commands or change policy.

The installer copies the bundled `skills/commercial-license-skill` directory only into the user-selected destinations. Use `--dry-run` to inspect planned writes.

The MCP server checks canonical project roots but is not an operating-system sandbox. Run it only for trusted local projects; linked dependencies and unsupported formats may require separate inspection. Installer updates back up existing edits and stop when a backup cannot be made.

Report vulnerabilities through the repository's private security advisory mechanism where enabled. Avoid posting source, credentials or reproduction material containing private data in a public issue.

## npm execution hygiene

This package intentionally declares no runtime dependencies and no npm lifecycle scripts. For reproducible automation, pin the package version instead of relying on a moving tag:

```bash
node ./bin/commercial-license-skill.mjs install --project --frameworks codex --dry-run
```

Version 0.4.0 is currently an unreleased checkout. When installing from npm, verify that the selected published version supports the needed options, pin that version and review the package tarball/checksum before organization-wide rollout.


