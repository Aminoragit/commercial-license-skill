import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { commandExists, copyDir, exists, homePath, removeDir, SKILL_NAME, splitComma } from './utils.mjs';
import { fileURLToPath } from 'node:url';

const ADAPTERS = {
  'claude-code': {
    title: 'Claude Code', command: 'claude', clues: ['.claude'],
    destinations: { project: ['.claude/skills'], global: [homePath('.claude', 'skills')] }
  },
  codex: {
    title: 'OpenAI Codex', command: 'codex', clues: ['.codex'],
    destinations: { project: ['.agents/skills'], global: [homePath('.agents', 'skills')] }
  },
  openclaw: {
    title: 'OpenClaw', command: 'openclaw', clues: ['.openclaw'],
    destinations: { project: ['skills'], global: [homePath('.openclaw', 'skills')] }
  },
  hermes: {
    title: 'Hermes Agent', command: 'hermes', clues: ['.hermes'],
    destinations: { project: [], global: [homePath('.hermes', 'skills')] }
  },
  'gemini-cli': {
    title: 'Gemini CLI', command: 'gemini', clues: ['.gemini'],
    destinations: { project: ['.gemini/skills'], global: [homePath('.gemini', 'skills')] }
  },
  copilot: {
    title: 'GitHub Copilot', command: 'copilot', clues: ['.github', '.copilot'],
    destinations: { project: ['.github/skills'], global: [homePath('.copilot', 'skills')] }
  },
  universal: {
    title: 'Universal Agent Skills', command: null, clues: ['.agents'],
    destinations: { project: ['.agents/skills'], global: [homePath('.agents', 'skills')] }
  }
};

function packageRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

function skillSource() {
  return path.join(packageRoot(), 'skills', SKILL_NAME);
}

export function supportedFrameworks() {
  return ADAPTERS;
}

export function detectFrameworks(cwd = process.cwd()) {
  return Object.entries(ADAPTERS).map(([id, adapter]) => {
    const reasons = [];
    if (adapter.command && commandExists(adapter.command)) reasons.push(`command:${adapter.command}`);
    for (const clue of adapter.clues) {
      if (exists(path.join(cwd, clue)) || exists(path.join(os.homedir(), clue))) reasons.push(`path:${clue}`);
    }
    if (id === 'universal') reasons.push('portable fallback');
    return { id, title: adapter.title, detected: reasons.length > (id === 'universal' ? 1 : 0), reasons };
  });
}

async function chooseInteractive(detected) {
  const rl = readline.createInterface({ input, output });
  try {
    output.write('\nSelect frameworks to install. Use comma-separated numbers.\n');
    detected.forEach((item, index) => output.write(`  ${index + 1}) [${item.detected ? 'detected' : 'optional'}] ${item.title}${item.reasons.length ? ` — ${item.reasons.join(', ')}` : ''}\n`));
    const defaults = detected.map((item, index) => item.detected ? String(index + 1) : null).filter(Boolean);
    const answer = await rl.question(`Selection [${defaults.join(',') || '7'}]: `);
    const raw = answer.trim() || defaults.join(',') || '7';
    const indexes = raw.split(',').map((part) => Number(part.trim()) - 1).filter((index) => Number.isInteger(index) && index >= 0 && index < detected.length);
    return [...new Set(indexes.map((index) => detected[index].id))];
  } finally {
    rl.close();
  }
}

async function chooseScope(options) {
  if (options.global) return 'global';
  if (options.project) return 'project';
  if (!process.stdin.isTTY) return 'project';
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question('Install scope: 1) project  2) global [1]: ')).trim();
    return answer === '2' ? 'global' : 'project';
  } finally {
    rl.close();
  }
}

function destinationPaths(frameworkId, scope, cwd) {
  const adapter = ADAPTERS[frameworkId];
  if (!adapter) throw new Error(`Unsupported framework: ${frameworkId}`);
  const paths = adapter.destinations[scope] ?? [];
  return paths.map((base) => path.isAbsolute(base) ? path.join(base, SKILL_NAME) : path.join(cwd, base, SKILL_NAME));
}

export async function installSkill(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const detected = detectFrameworks(cwd);
  const requested = splitComma(options.frameworks);
  const automaticallyDetected = detected.filter((item) => item.detected).map((item) => item.id);
  const frameworkIds = requested.length ? requested : options.all ? Object.keys(ADAPTERS) : options.yes ? (automaticallyDetected.length ? automaticallyDetected : ['universal']) : await chooseInteractive(detected);
  const scope = await chooseScope(options);
  const results = [];
  for (const id of [...new Set(frameworkIds)]) {
    const paths = destinationPaths(id, scope, cwd);
    if (!paths.length) {
      results.push({ framework: id, status: 'skipped', reason: `${ADAPTERS[id].title} does not expose a ${scope} skill directory in the current adapter.` });
      continue;
    }
    for (const destination of paths) {
      if (!options.dryRun) copyDir(skillSource(), destination);
      results.push({ framework: id, status: options.dryRun ? 'planned' : 'installed', destination });
    }
  }
  return { scope, cwd, detected, results };
}

export function uninstallSkill(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const requested = splitComma(options.frameworks);
  const frameworkIds = requested.length ? requested : Object.keys(ADAPTERS);
  const scopes = options.global ? ['global'] : options.project ? ['project'] : ['project', 'global'];
  const results = [];
  for (const id of frameworkIds) {
    for (const scope of scopes) {
      for (const destination of destinationPaths(id, scope, cwd)) {
        if (exists(destination)) {
          if (!options.dryRun) removeDir(destination);
          results.push({ framework: id, scope, status: options.dryRun ? 'planned-remove' : 'removed', destination });
        }
      }
    }
  }
  return { cwd, results };
}

export function renderInstallResult(result) {
  const lines = [`Scope: ${result.scope ?? 'project+global'}`];
  if (!result.results.length) lines.push('No matching installation was found.');
  for (const item of result.results) lines.push(`${item.status.toUpperCase()}: ${item.framework}${item.destination ? ` -> ${item.destination}` : ''}${item.reason ? ` (${item.reason})` : ''}`);
  return lines.join('\n');
}
