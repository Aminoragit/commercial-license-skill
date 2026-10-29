import path from 'node:path';
import { installSkill, uninstallSkill, renderInstallResult, detectFrameworks, supportedFrameworks } from './install.mjs';
import { parseArgs, splitComma } from './utils.mjs';
import { CLI_VERSION, scanProject, shouldFail, writeReport } from './scan.mjs';
import { recommendationsFor } from './catalog.mjs';
import { searchNpmCandidates } from './registry.mjs';
import { runMcpServer } from './mcp.mjs';

const HELP = `
CommercialLicenseSkill — commercial-safe license triage for agentic coding workflows

Usage:
  commercial-license-skill install [--global|--project] [--frameworks claude-code,codex,antigravity,openclaw,hermes,gemini-cli,copilot,universal] [--all] [--yes] [--dry-run]
  commercial-license-skill uninstall [--global|--project] [--frameworks ...] [--dry-run]
  commercial-license-skill doctor [--json]
  commercial-license-skill scan [path] [--format human|json|sarif] [--output file] [--include-dev] [--allowed-licenses MIT,Apache-2.0] [--fail-on review|high|critical]
  commercial-license-skill recommend <package> [--allowed-licenses MIT,Apache-2.0] [--online] [--query keywords] [--json]
  commercial-license-skill mcp
  commercial-license-skill help

Examples:
  npx commercial-license-skill install
  npx commercial-license-skill install --global --frameworks claude-code,codex,openclaw,hermes,gemini-cli,copilot
  npx commercial-license-skill scan . --format sarif --output reports/commercial-license-skill.sarif --fail-on high
  npx commercial-license-skill mcp
`;

function value(options, name, fallback) {
  return options[name] === true ? fallback : options[name] ?? fallback;
}

export async function main(argv) {
  if (argv[0] === '--version') { console.log(CLI_VERSION); return; }
  if (argv[0] === '--help') { console.log(HELP.trim()); return; }
  const [command = 'help', ...rest] = argv;
  const { positionals, options } = parseArgs(rest);
  const flags = {
    install: ['global', 'project', 'frameworks', 'all', 'yes', 'dry-run'],
    uninstall: ['global', 'project', 'frameworks', 'dry-run'],
    doctor: ['json'],
    scan: ['format', 'output', 'include-dev', 'fail-on', 'allowed-licenses', 'profile', 'ignore', 'no-snippets', 'max-snippet-length'],
    recommend: ['online', 'json', 'allowed-licenses', 'query', 'size'],
    mcp: ['allow-root'], help: []
  };
  for (const key of Object.keys(options)) {
    if (key !== 'help' && flags[command] && !flags[command].includes(key)) throw new Error(`Unknown option for ${command}: --${key}`);
    if (options[key] === true && !['help', 'global', 'project', 'all', 'yes', 'dry-run', 'json', 'online', 'include-dev', 'no-snippets'].includes(key)) throw new Error(`Missing value for --${key}`);
  }
  if (command === 'help' || options.help) {
    console.log(HELP.trim());
    return;
  }
  if (command === 'install') {
    const result = await installSkill({
      ...options,
      frameworks: value(options, 'frameworks', ''),
      all: Boolean(options.all), yes: Boolean(options.yes), dryRun: Boolean(options['dry-run']), global: Boolean(options.global), project: Boolean(options.project)
    });
    console.log(renderInstallResult(result));
    return;
  }
  if (command === 'uninstall') {
    const result = uninstallSkill({ ...options, frameworks: value(options, 'frameworks', ''), dryRun: Boolean(options['dry-run']), global: Boolean(options.global), project: Boolean(options.project) });
    console.log(renderInstallResult(result));
    return;
  }
  if (command === 'doctor') {
    const result = { detected: detectFrameworks(), supported: Object.entries(supportedFrameworks()).map(([id, adapter]) => ({ id, title: adapter.title })) };
    console.log(options.json ? JSON.stringify(result, null, 2) : result.detected.map((item) => `${item.detected ? '✓' : '·'} ${item.id.padEnd(12)} ${item.title}${item.reasons.length ? ` — ${item.reasons.join(', ')}` : ''}`).join('\n'));
    return;
  }
  if (command === 'recommend') {
    const packageName = positionals[0];
    if (!packageName) throw new Error('Usage: commercial-license-skill recommend <package> [--online]');
    const allowedLicenses = options['allowed-licenses'] === undefined ? undefined : splitComma(options['allowed-licenses']);
    const curated = recommendationsFor(packageName, { allowedLicenses });
    let discovered = [];
    let onlineError = null;
    if (options.online) {
      try { discovered = await searchNpmCandidates(value(options, 'query', packageName), { size: value(options, 'size', 12), allowedLicenses, excludeName: packageName }); }
      catch (error) { onlineError = error?.message ?? String(error); }
    }
    const result = { packageName, allowedLicenses: allowedLicenses ?? null, curated, discovered, onlineError, notice: 'Discovery candidates are not verified replacements. Check versioned artifacts, notices, transitive licenses, maintenance and used APIs.' };
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else {
      const lines = [];
      if (curated.length) {
        lines.push('Curated candidates:');
        for (const item of curated) lines.push(`- ${item.name} (${item.license}) — ${item.note}`);
      }
      if (discovered.length) {
        lines.push('npm registry discovery candidates — verify before adoption:');
        for (const item of discovered) lines.push(`- ${item.name}@${item.version} (${item.license}) — ${item.description || item.note}`);
      }
      if (onlineError) lines.push(`Online discovery unavailable: ${onlineError}`);
      if (!lines.length) lines.push(`No curated replacement found for ${packageName}. Re-run with --online or ask the agent to search upstream repositories and verify exact license terms, activity, API fit, and migration cost.`);
      console.log(lines.join('\n'));
    }
    return;
  }
  if (command === 'mcp') {
    await runMcpServer();
    return;
  }
  if (command === 'scan') {
    const root = positionals[0] ?? '.';
    const format = value(options, 'format', 'human');
    if (!['human', 'json', 'sarif'].includes(format)) throw new Error(`Unsupported format: ${format}`);
    const threshold = value(options, 'fail-on', null);
    if (threshold && !['review', 'high', 'critical'].includes(threshold)) throw new Error(`Unsupported fail-on threshold: ${threshold}`);
    const report = scanProject(root, {
      includeDev: options['include-dev'] === undefined ? undefined : Boolean(options['include-dev']),
      profile: value(options, 'profile', undefined),
      allowedLicenses: options['allowed-licenses'] === undefined ? undefined : splitComma(options['allowed-licenses']),
      ignorePackages: splitComma(options.ignore),
      noSnippets: options['no-snippets'] === undefined ? undefined : Boolean(options['no-snippets']),
      maxSnippetLength: options['max-snippet-length'] ? Number(options['max-snippet-length']) : undefined
    });
    console.log(writeReport(report, format, options.output));
    if (threshold && shouldFail(report, threshold)) process.exitCode = 2;
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${HELP.trim()}`);
}


