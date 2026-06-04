import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { exists, readJson, relativeTo, toPosix, unique, walkFiles } from './utils.mjs';

function packageRecord({ ecosystem, name, version = 'unknown', license = 'UNKNOWN', source, scope = 'runtime', evidence = [], notes = [] }) {
  return { ecosystem, name, version, license, source, scope, evidence: unique(evidence), notes: unique(notes) };
}

function readPackageLicense(root, packageName) {
  const packagePath = path.join(root, 'node_modules', ...packageName.split('/'), 'package.json');
  const metadata = readJson(packagePath, {});
  return { license: metadata.license ?? metadata.licenses ?? 'UNKNOWN', packagePath, metadata };
}

function detectInstalledNodeModules(root) {
  const modulesRoot = path.join(root, 'node_modules');
  if (!exists(modulesRoot)) return [];
  const packageFiles = walkFiles(modulesRoot, (filePath, name) => name === 'package.json' && filePath.includes('node_modules'), {
    maxDepth: 10,
    ignored: ['.bin', '.cache']
  });
  const records = [];
  for (const packagePath of packageFiles) {
    const metadata = readJson(packagePath, {});
    if (!metadata.name) continue;
    records.push(packageRecord({
      ecosystem: 'npm',
      name: metadata.name,
      version: metadata.version ?? 'unknown',
      license: metadata.license ?? metadata.licenses ?? 'UNKNOWN',
      source: toPosix(relativeTo(root, packagePath)),
      scope: 'transitive',
      evidence: [toPosix(relativeTo(root, packagePath))],
      notes: ['Resolved from installed node_modules metadata.']
    }));
  }
  return records;
}

function flattenNpmLockPackages(root, lock) {
  const result = [];
  if (lock?.packages && typeof lock.packages === 'object') {
    for (const [key, value] of Object.entries(lock.packages)) {
      if (!key || !key.startsWith('node_modules/')) continue;
      const name = key.slice('node_modules/'.length);
      const metadata = readPackageLicense(root, name);
      result.push(packageRecord({
        ecosystem: 'npm',
        name,
        version: value.version ?? metadata.metadata.version,
        license: value.license ?? metadata.license,
        source: toPosix(relativeTo(root, path.join(root, 'package-lock.json'))),
        scope: 'transitive',
        evidence: [toPosix(relativeTo(root, metadata.packagePath))],
        notes: ['Resolved from package-lock.json and installed package metadata when available.']
      }));
    }
  }
  return result;
}

export function detectNpm(root) {
  const packageFile = path.join(root, 'package.json');
  if (!exists(packageFile)) return [];
  const manifest = readJson(packageFile, {});
  const records = [];
  const groups = [
    ['dependencies', 'runtime'],
    ['optionalDependencies', 'runtime'],
    ['peerDependencies', 'peer'],
    ['devDependencies', 'dev']
  ];
  for (const [group, scope] of groups) {
    for (const [name, requestedVersion] of Object.entries(manifest[group] ?? {})) {
      const metadata = readPackageLicense(root, name);
      records.push(packageRecord({
        ecosystem: 'npm',
        name,
        version: metadata.metadata.version ?? requestedVersion,
        license: metadata.license,
        source: 'package.json',
        scope,
        evidence: [toPosix(relativeTo(root, metadata.packagePath))],
        notes: exists(metadata.packagePath) ? [] : ['Package is declared but not installed; license metadata could not be read locally.']
      }));
    }
  }
  const lock = readJson(path.join(root, 'package-lock.json'));
  if (lock) records.push(...flattenNpmLockPackages(root, lock));
  records.push(...detectInstalledNodeModules(root));
  return records;
}

function parseRequirementLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) return null;
  const match = trimmed.match(/^([A-Za-z0-9_.-]+)(?:\[[^\]]+\])?\s*(?:===|==|~=|>=|<=|>|<|!=)?\s*([^;\s]+)?/);
  if (!match) return null;
  return { name: match[1], version: match[2] ?? 'unknown' };
}

function installedPythonMetadata(root, packageName) {
  const candidates = walkFiles(root, (filePath, name) => name === 'METADATA' && filePath.includes('.dist-info'), { maxDepth: 8, ignored: ['.git', 'node_modules'] });
  const normalized = packageName.toLowerCase().replace(/[-_.]+/g, '-');
  for (const filePath of candidates) {
    const text = fs.readFileSync(filePath, 'utf8');
    const name = text.match(/^Name:\s*(.+)$/mi)?.[1]?.trim();
    if (!name || name.toLowerCase().replace(/[-_.]+/g, '-') !== normalized) continue;
    const license = text.match(/^License:\s*(.+)$/mi)?.[1]?.trim() || text.match(/^Classifier:\s*License :: OSI Approved :: (.+)$/mi)?.[1]?.trim() || 'UNKNOWN';
    const version = text.match(/^Version:\s*(.+)$/mi)?.[1]?.trim() || 'unknown';
    return { license, version, filePath };
  }
  return null;
}

export function detectPython(root) {
  const files = ['requirements.txt', 'requirements-dev.txt'];
  const records = [];
  for (const filename of files) {
    const filePath = path.join(root, filename);
    if (!exists(filePath)) continue;
    const scope = filename.includes('dev') ? 'dev' : 'runtime';
    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const req = parseRequirementLine(line);
      if (!req) continue;
      const metadata = installedPythonMetadata(root, req.name);
      records.push(packageRecord({
        ecosystem: 'python',
        name: req.name,
        version: metadata?.version ?? req.version,
        license: metadata?.license ?? 'UNKNOWN',
        source: filename,
        scope,
        evidence: metadata ? [toPosix(relativeTo(root, metadata.filePath))] : [],
        notes: metadata ? [] : ['Requirement found; install metadata or repository inspection is needed to resolve its license.']
      }));
    }
  }
  return records;
}

export function detectCargo(root) {
  const lockPath = path.join(root, 'Cargo.lock');
  if (!exists(lockPath)) return [];
  const text = fs.readFileSync(lockPath, 'utf8');
  const records = [];
  for (const block of text.split(/\n\[\[package\]\]\n/).slice(1)) {
    const name = block.match(/^name\s*=\s*"([^"]+)"/m)?.[1];
    const version = block.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
    if (!name) continue;
    records.push(packageRecord({
      ecosystem: 'cargo', name, version, license: 'UNKNOWN', source: 'Cargo.lock', scope: 'transitive',
      notes: ['Cargo.lock does not contain license metadata. Resolve with cargo metadata or a registry lookup before release.']
    }));
  }
  return records;
}

export function detectGo(root) {
  const modPath = path.join(root, 'go.mod');
  if (!exists(modPath)) return [];
  const text = fs.readFileSync(modPath, 'utf8');
  const records = [];
  let inBlock = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === 'require (') { inBlock = true; continue; }
    if (inBlock && line === ')') { inBlock = false; continue; }
    const candidate = inBlock ? line : line.replace(/^require\s+/, '');
    if (!inBlock && candidate === line) continue;
    const match = candidate.match(/^([^\s]+)\s+([^\s]+)(?:\s+\/\/\s+indirect)?$/);
    if (!match) continue;
    records.push(packageRecord({
      ecosystem: 'go', name: match[1], version: match[2], license: 'UNKNOWN', source: 'go.mod', scope: line.includes('indirect') ? 'transitive' : 'runtime',
      notes: ['go.mod does not contain license metadata. Inspect module cache or upstream repository before release.']
    }));
  }
  return records;
}

function hasExecutableInvocation(text, executableNames) {
  const executable = executableNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const directCommand = new RegExp(`(?:^|[;&|\\n]\\s*|\\$\\(|\`)(?:sudo\\s+)?(?:${executable})(?:\\s|$)`, 'im');
  const processApi = new RegExp(`(?:execFile|exec|spawn|spawnSync|execFileSync|execSync|execa|subprocess\\.(?:run|Popen|call|check_call|check_output)|os\\.system)\\s*\\(\\s*['\"](?:${executable})(?:['\"]|\\s)`, 'im');
  const packageInstall = new RegExp(`(?:apt(?:-get)?|apk|yum|dnf|brew|choco|winget)\\s+(?:install|add)\\b[^\\n]*(?:${executable})`, 'im');
  return directCommand.test(text) || processApi.test(text) || packageInstall.test(text);
}

export function detectSystemSignals(root) {
  const signals = [];
  const files = walkFiles(root, (filePath, name) => /^(Dockerfile|docker-compose\.ya?ml|Makefile|.*\.(sh|ps1|cmd|bat|ts|js|mjs|cjs|py))$/i.test(name), { maxDepth: 6, ignored: ['.git', 'node_modules', '.venv', 'venv'] });
  const patterns = [
    { name: 'ghostscript', executables: ['gs', 'ghostscript'] },
    { name: 'ffmpeg', executables: ['ffmpeg'] },
    { name: 'imagemagick', executables: ['magick', 'convert', 'imagemagick'] }
  ];
  for (const filePath of files) {
    let text = '';
    try { text = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
    for (const pattern of patterns) {
      if (!hasExecutableInvocation(text, pattern.executables)) continue;
      signals.push(packageRecord({
        ecosystem: 'system', name: pattern.name, version: 'unknown', license: 'UNKNOWN', source: toPosix(relativeTo(root, filePath)), scope: 'runtime',
        notes: ['Executable or system-package usage signal found. Confirm the installed binary license and whether it is merely invoked as a separate process.']
      }));
    }
  }
  return signals;
}

function inferVendoredLicense(text) {
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text)) return 'AGPL-3.0';
  if (/SERVER SIDE PUBLIC LICENSE|SSPL/i.test(text)) return 'SSPL-1.0';
  if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(text)) return 'LGPL';
  if (/GNU GENERAL PUBLIC LICENSE/i.test(text)) return 'GPL';
  if (/COMMONS CLAUSE/i.test(text)) return 'Commons Clause';
  if (/BUSINESS SOURCE LICENSE|BUSL/i.test(text)) return 'BUSL';
  if (/ELASTIC LICENSE/i.test(text)) return 'Elastic License';
  return null;
}

export function detectVendoredLicenses(root) {
  const vendorNames = new Set(['vendor', 'vendors', 'third_party', 'third-party', 'external', 'externals', 'deps']);
  const files = walkFiles(root, (filePath, name) => {
    if (!/^(LICENSE|LICENSE\..*|COPYING|COPYING\..*|NOTICE|NOTICE\..*)$/i.test(name)) return false;
    const segments = toPosix(relativeTo(root, filePath)).split('/');
    return segments.some((segment) => vendorNames.has(segment.toLowerCase()));
  }, { maxDepth: 10, ignored: ['.git', 'node_modules', '.venv', 'venv'] });
  const records = [];
  for (const filePath of files) {
    let text = '';
    try { text = fs.readFileSync(filePath, 'utf8').slice(0, 300_000); } catch { continue; }
    const license = inferVendoredLicense(text);
    if (!license) continue;
    const relative = toPosix(relativeTo(root, filePath));
    records.push(packageRecord({
      ecosystem: 'vendored',
      name: path.basename(path.dirname(filePath)),
      version: 'unknown',
      license,
      source: relative,
      scope: 'vendored',
      evidence: [relative],
      notes: ['License text was detected under a vendored or third-party directory. Confirm provenance and whether this code is compiled, bundled, modified, or unused.']
    }));
  }
  return records;
}

function mergeRecords(records) {
  const map = new Map();
  const scopePriority = { runtime: 5, vendored: 5, optional: 4, peer: 3, transitive: 2, dev: 1 };
  for (const record of records) {
    const key = `${record.ecosystem}:${record.name}:${record.version}`.toLowerCase();
    const previous = map.get(key);
    if (!previous) map.set(key, record);
    else {
      previous.evidence = unique([...previous.evidence, ...record.evidence]);
      previous.notes = unique([...previous.notes, ...record.notes]);
      if ((scopePriority[record.scope] ?? 0) > (scopePriority[previous.scope] ?? 0)) {
        previous.scope = record.scope;
        previous.source = record.source;
      }
      if (previous.license === 'UNKNOWN' && record.license !== 'UNKNOWN') previous.license = record.license;
    }
  }
  return [...map.values()];
}

export function detectDependencies(root) {
  return mergeRecords([
    ...detectNpm(root),
    ...detectPython(root),
    ...detectCargo(root),
    ...detectGo(root),
    ...detectSystemSignals(root),
    ...detectVendoredLicenses(root)
  ]);
}
