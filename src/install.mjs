import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { commandExists, copyDir, exists, homePath, removeDir, SKILL_NAME, splitComma } from './utils.mjs';
import { fileURLToPath } from 'node:url';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const ADAPTERS = {
  'claude-code': {
    title: 'Claude Code', command: 'claude', clues: ['.claude'], emoji: '🤖',
    destinations: { project: ['.claude/skills'], global: [homePath('.claude', 'skills')] }
  },
  codex: {
    title: 'OpenAI Codex', command: 'codex', clues: ['.codex'], emoji: '🧠',
    destinations: { project: ['.agents/skills'], global: [homePath('.agents', 'skills')] }
  },
  openclaw: {
    title: 'OpenClaw', command: 'openclaw', clues: ['.openclaw'], emoji: '🛡️',
    destinations: { project: ['skills'], global: [homePath('.openclaw', 'skills')] }
  },
  hermes: {
    title: 'Hermes Agent', command: 'hermes', clues: ['.hermes'], emoji: '🕊️',
    destinations: { project: [], global: [homePath('.hermes', 'skills')] }
  },
  'gemini-cli': {
    title: 'Gemini CLI', command: 'gemini', clues: ['.gemini'], emoji: '♊',
    destinations: { project: ['.gemini/skills'], global: [homePath('.gemini', 'skills')] }
  },
  copilot: {
    title: 'GitHub Copilot', command: 'copilot', clues: ['.github', '.copilot'], emoji: '🐈',
    destinations: { project: ['.github/skills'], global: [homePath('.copilot', 'skills')] }
  },
  universal: {
    title: 'Universal Agent Skills', command: null, clues: ['.agents'], emoji: '🌐',
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
    output.write(`\n${c.bold}${c.cyan}🧼 commercial-license-skill 설치 마법사${c.reset}\n`);
    output.write(`${c.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`);
    output.write(`감지되거나 연동 가능한 에이전트 프레임워크 목록입니다:\n\n`);

    detected.forEach((item, index) => {
      const adapter = ADAPTERS[item.id];
      const emoji = adapter?.emoji ?? '⚙️';
      const num = `${c.bold}${c.cyan}[${index + 1}]${c.reset}`;
      
      let statusText = '';
      if (item.detected) {
        statusText = `${c.green}(감지됨: ${item.reasons.join(', ')})${c.reset}`;
      } else {
        statusText = `${c.dim}(옵션)${c.reset}`;
      }
      
      output.write(`  ${num} ${emoji} ${c.bold}${item.title}${c.reset}  ${statusText}\n`);
    });

    output.write(`\n설치할 프레임워크 번호를 반점(${c.bold},${c.reset})으로 구분해 입력해 주세요.\n`);
    
    const defaults = detected.map((item, index) => item.detected ? String(index + 1) : null).filter(Boolean);
    const defaultStr = defaults.join(',') || '7';
    
    const answer = await rl.question(`👉 번호 입력 [기본값: ${c.bold}${c.green}${defaultStr}${c.reset}]: `);
    const raw = answer.trim() || defaultStr;
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
    output.write(`\n${c.bold}설치할 범위를 선택해 주세요:${c.reset}\n`);
    output.write(`  ${c.bold}${c.cyan}[1]${c.reset} 📁 현재 프로젝트 로컬 (project)\n`);
    output.write(`  ${c.bold}${c.cyan}[2]${c.reset} 🏠 사용자 홈디렉토리 전역 (global)\n\n`);
    
    const answer = (await rl.question(`👉 선택 입력 [기본값: ${c.bold}${c.green}1${c.reset}]: `)).trim();
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
      let backedUp = null;
      if (!options.dryRun && exists(destination)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `${destination}.bak-${timestamp}`;
        try {
          fs.renameSync(destination, backupDir);
          backedUp = backupDir;
        } catch {
          try { removeDir(destination); } catch {}
        }
      }
      if (!options.dryRun) copyDir(skillSource(), destination);
      results.push({ framework: id, status: options.dryRun ? 'planned' : 'installed', destination, backedUp });
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
  const lines = [
    `\n${c.bold}${c.cyan}✨ 설치 완료 리포트${c.reset} (범위: ${c.bold}${result.scope === 'global' ? '🏠 global' : '📁 project'}${c.reset})`,
    `${c.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`
  ];
  if (!result.results.length) {
    lines.push(`  ${c.yellow}⚠️ 연동 가능한 대상을 찾지 못했습니다.${c.reset}`);
  }
  for (const item of result.results) {
    const emoji = ADAPTERS[item.framework]?.emoji ?? '⚙️';
    if (item.status === 'installed') {
      let line = `  ${c.green}✅ ${emoji} ${c.bold}${item.framework}${c.reset}  ➜  ${c.dim}${item.destination}${c.reset}`;
      if (item.backedUp) {
        line += `\n     ${c.yellow}↳ ⚠️ 기존 편집본 백업됨: ${item.backedUp}${c.reset}`;
      }
      lines.push(line);
    } else if (item.status === 'planned') {
      lines.push(`  ${c.cyan}📝 ${emoji} ${c.bold}${item.framework}${c.reset} (설치 예정)  ➜  ${c.dim}${item.destination}${c.reset}`);
    } else if (item.status === 'skipped') {
      lines.push(`  ${c.yellow}⚠️  ${emoji} ${c.bold}${item.framework}${c.reset} (건너뜀: ${item.reason})${c.reset}`);
    } else {
      lines.push(`  ${emoji} ${item.framework} (${item.status}) -> ${item.destination}`);
    }
  }
  lines.push(`${c.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  lines.push(`🎉 에이전트 스킬 연동 작업이 성공적으로 처리되었습니다.\n`);
  return lines.join('\n');
}
