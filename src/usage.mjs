import fs from 'node:fs';
import path from 'node:path';
import { relativeTo, toPosix, walkFiles } from './utils.mjs';

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?|py|go|rs|java|kt|kts|cs|php|rb|sh|bash|zsh|ps1|cmd|bat|ya?ml|toml)$/i;

function regexEscape(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compactSnippet(value) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 240);
}

export function buildSourceIndex(root, options = {}) {
  const files = walkFiles(root, (filePath, name) => SOURCE_FILE.test(name), {
    maxDepth: options.maxDepth ?? 9,
    ignored: ['.git', '.hg', '.svn', 'node_modules', '.venv', 'venv', 'dist', 'build', 'coverage', '.next', ...(options.ignored ?? [])]
  });
  const index = [];
  for (const filePath of files) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.size > (options.maxBytes ?? 1_000_000)) continue;
      const text = fs.readFileSync(filePath, 'utf8');
      if (text.includes('\u0000')) continue;
      index.push({ filePath, relativePath: toPosix(relativeTo(root, filePath)), lines: text.split(/\r?\n/) });
    } catch {
      // Ignore unreadable files.
    }
  }
  return index;
}

function usagePatterns(item) {
  const escapedName = regexEscape(item.name);
  if (item.ecosystem === 'npm') {
    return [
      { kind: 'js-import', regex: new RegExp(`(?:from\\s*|require\\s*\\(\\s*|import\\s*\\(\\s*|^\\s*import\\s*)['\"]${escapedName}(?:/[^'\"]*)?['\"]`, 'i') },
      { kind: 'js-reference', regex: new RegExp(`['\"]${escapedName}(?:/[^'\"]*)?['\"]`, 'i') }
    ];
  }
  if (item.ecosystem === 'python') {
    const moduleName = regexEscape(item.name.replace(/-/g, '_'));
    return [{ kind: 'python-import', regex: new RegExp(`^\\s*(?:from\\s+${moduleName}(?:\\.|\\s)|import\\s+${moduleName}(?:\\.|\\s|$))`, 'i') }];
  }
  if (item.ecosystem === 'go') {
    return [{ kind: 'go-import', regex: new RegExp(`['\"]${escapedName}(?:/[^'\"]*)?['\"]`, 'i') }];
  }
  if (item.ecosystem === 'cargo') {
    const crateName = regexEscape(item.name.replace(/-/g, '_'));
    return [{ kind: 'rust-use', regex: new RegExp(`^\\s*(?:use|extern\\s+crate)\\s+${crateName}(?:::|\\s|;)`, 'i') }];
  }
  return [];
}

export function findUsageEvidence(sourceIndex, item, options = {}) {
  if (item.ecosystem === 'system' || item.ecosystem === 'vendored') return [];
  const patterns = usagePatterns(item);
  const results = [];
  const max = options.max ?? 12;
  const noSnippets = Boolean(options.noSnippets);
  const maxSnippetLength = options.maxSnippetLength ?? 240;
  for (const file of sourceIndex) {
    for (let index = 0; index < file.lines.length; index += 1) {
      const line = file.lines[index];
      const matched = patterns.find((pattern) => pattern.regex.test(line));
      if (!matched) continue;
      const snippet = noSnippets ? '[REDACTED]' : compactSnippet(line).slice(0, maxSnippetLength);
      results.push({ file: file.relativePath, line: index + 1, kind: matched.kind, snippet });
      if (results.length >= max) return results;
    }
  }
  return results;
}
