# Security policy

ParasiteCleaner scans local project files. The MVP does not upload source code, contact external APIs, or execute project scripts during scanning.

The installer copies the bundled `skills/commercial-license-skill` directory only into the user-selected destinations. Use `--dry-run` to inspect planned writes.

Report vulnerabilities through a private GitHub security advisory after publishing the repository.

## npm execution hygiene

This package intentionally declares no runtime dependencies and no npm lifecycle scripts. For reproducible automation, pin the package version instead of relying on a moving tag:

```bash
npx commercial-license-skill@0.1.0 install
```

Review the package tarball and checksum before organization-wide rollout.

