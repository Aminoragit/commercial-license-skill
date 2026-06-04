import path from 'node:path';
import { installSkill, uninstallSkill, renderInstallResult, detectFrameworks, supportedFrameworks } from './install.mjs';
import { parseArgs, splitComma } from './utils.mjs';
import { renderHuman, scanProject, shouldFail, toSarif, writeReport } from './scan.mjs';
import { recommendationsFor } from './catalog.mjs';
import { searchNpmCandidates } from './registry.mjs';
import { runMcpServer } from './mcp.mjs';

const HELP = `
CommercialLicenseSkill — commercial-safe license triage for agentic coding workflows

Usage:
  commercial-license-skill install [--global|--project] [--frameworks claude-code,codex,openclaw,hermes,gemini-cli,copilot,universal] [--all] [--yes] [--dry-run]
  commercial-license-skill uninstall [--global|--project] [--frameworks ...] [--dry-run]
  commercial-license-skill doctor [--json]
  commercial-license-skill scan [path] [--format human|json|sarif] [--output file] [--include-dev] [--fail-on review|high|critical]
  commercial-license-skill recommend <package> [--online] [--json]
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
  const [command = 'help', ...rest] = argv;
  const { positionals, options } = parseArgs(rest);
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
    const curated = recommendationsFor(packageName);
    let discovered = [];
    let onlineError = null;
    if (options.online) {
      try { discovered = await searchNpmCandidates(packageName, { size: value(options, 'size', 12) }); }
      catch (error) { onlineError = error?.message ?? String(error); }
    }
    const result = { packageName, curated, discovered, onlineError };
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
    const report = scanProject(root, { includeDev: Boolean(options['include-dev']), profile: value(options, 'profile', 'commercial-safe'), ignorePackages: splitComma(options.ignore) });
    console.log(writeReport(report, format, options.output));
    const threshold = value(options, 'fail-on', null);
    if (threshold && shouldFail(report, threshold)) process.exitCode = 2;
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${HELP.trim()}`);
}


