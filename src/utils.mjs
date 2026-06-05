import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export const TOOL_NAME = 'commercial-license-skill';
export const SKILL_NAME = 'commercial-license-skill';

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

export function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

export function removeDir(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

export function homePath(...segments) {
  return path.join(os.homedir(), ...segments);
}

export function relativeTo(root, filePath) {
  return path.relative(root, filePath) || '.';
}

export function unique(items) {
  return [...new Set(items)];
}

export function commandExists(command) {
  try {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    execFileSync(checker, [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function parseArgs(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      positionals.push(item);
      continue;
    }
    const equalIndex = item.indexOf('=');
    if (equalIndex !== -1) {
      options[item.slice(2, equalIndex)] = item.slice(equalIndex + 1);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return { positionals, options };
}

export function splitComma(value) {
  if (!value || value === true) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeLicense(raw) {
  if (!raw) return 'UNKNOWN';
  if (Array.isArray(raw)) {
    return raw.map(item => normalizeLicense(item)).filter(l => l !== 'UNKNOWN').join(' OR ') || 'UNKNOWN';
  }
  if (typeof raw === 'object') {
    if (raw.type) return normalizeLicense(raw.type);
    if (raw.license) return normalizeLicense(raw.license);
    return 'UNKNOWN';
  }
  return String(raw)
    .trim()
    .replace(/^\(|\)$/g, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function walkFiles(root, predicate, options = {}) {
  const ignored = new Set(options.ignored ?? ['.git', '.hg', '.svn', '.next', 'dist', 'build', 'coverage']);
  const maxDepth = options.maxDepth ?? 8;
  const results = [];
  function visit(current, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full, depth + 1);
      else if (entry.isFile() && predicate(full, entry.name)) results.push(full);
    }
  }
  visit(root, 0);
  return results;
}

export function toPosix(value) {
  return value.split(path.sep).join('/');
}

