import fs from 'node:fs';
import path from 'node:path';
import { classifyLicense, isAtLeast, LEVEL_ORDER } from './license-policy.mjs';
import { recommendationsFor } from './catalog.mjs';
import { detectDependencies } from './detectors.mjs';
import { readJson, toPosix } from './utils.mjs';
import { buildSourceIndex, findUsageEvidence } from './usage.mjs';

function loadConfig(root) {
  return readJson(path.join(root, 'parasite-cleaner.config.json'), {});
}

function deploymentQuestions() {
  return [
    'Is the project distributed to customers, shipped on-premise, embedded in a client/mobile app, or operated only as SaaS?',
    'Is the dependency bundled, statically linked, dynamically linked, modified, imported at runtime, or launched as a separate process?',
    'Does the dependency cross a network boundary or expose functionality to remote users?',
    'Are license files, notices, source-offer obligations, and modification records preserved?'
  ];
}

export function scanProject(root, options = {}) {
  const absoluteRoot = path.resolve(root);
  const config = loadConfig(absoluteRoot);
  const includeDev = Boolean(options.includeDev ?? config.includeDev);
  const ignoredNames = new Set([...(config.ignorePackages ?? []), ...(options.ignorePackages ?? [])].map((value) => String(value).toLowerCase()));
  const sourceIndex = buildSourceIndex(absoluteRoot, { ignored: config.ignorePaths ?? [] });
  const dependencies = detectDependencies(absoluteRoot)
    .filter((item) => includeDev || item.scope !== 'dev')
    .filter((item) => !ignoredNames.has(item.name.toLowerCase()))
    .map((item) => {
      const assessment = classifyLicense(item.license);
      const usageEvidence = findUsageEvidence(sourceIndex, item);
      return {
        ...item,
        usageEvidence,
        usageSummary: usageEvidence.length ? `${usageEvidence.length} source reference(s) found` : 'No source import reference found by the lightweight tracer',
        assessment,
        recommendations: assessment.level === 'allow' ? [] : recommendationsFor(item.name),
        nextReview: assessment.level === 'allow' ? [] : deploymentQuestions()
      };
    })
    .sort((a, b) => (LEVEL_ORDER[b.assessment.level] ?? 0) - (LEVEL_ORDER[a.assessment.level] ?? 0) || a.name.localeCompare(b.name));

  const counts = dependencies.reduce((acc, item) => {
    acc[item.assessment.level] = (acc[item.assessment.level] ?? 0) + 1;
    return acc;
  }, { allow: 0, review: 0, high: 0, critical: 0 });

  return {
    schemaVersion: '1.0',
    tool: 'parasite-cleaner',
    generatedAt: new Date().toISOString(),
    root: toPosix(absoluteRoot),
    profile: options.profile ?? config.profile ?? 'commercial-safe',
    summary: { total: dependencies.length, ...counts },
    notice: 'This report is an engineering triage aid, not legal advice. A license name alone cannot determine obligations. Confirm exact terms, distribution model, linking/bundling, modifications, and notices with qualified counsel before release.',
    dependencies
  };
}

export function shouldFail(report, threshold = 'high') {
  return report.dependencies.some((item) => isAtLeast(item.assessment.level, threshold));
}

export function toSarif(report) {
  const risky = report.dependencies.filter((item) => item.assessment.level !== 'allow');
  return {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [{
      tool: { driver: { name: 'parasite-cleaner', version: '0.1.0', informationUri: 'https://github.com/YOUR_GITHUB_ID/parasite-cleaner' } },
      results: risky.map((item) => ({
        ruleId: `license-${item.assessment.level}`,
        level: item.assessment.level === 'critical' || item.assessment.level === 'high' ? 'error' : 'warning',
        message: { text: `${item.name}@${item.version}: ${item.license}. ${item.assessment.reason}` },
        locations: item.source ? [{ physicalLocation: { artifactLocation: { uri: item.source } } }] : []
      }))
    }]
  };
}

export function renderHuman(report) {
  const lines = [];
  lines.push('ParasiteCleaner — commercial-safe dependency triage');
  lines.push(`Root: ${report.root}`);
  lines.push(`Summary: ${report.summary.total} dependencies | critical ${report.summary.critical} | high ${report.summary.high} | review ${report.summary.review} | allow ${report.summary.allow}`);
  lines.push('');
  for (const item of report.dependencies) {
    const marker = item.assessment.level === 'allow' ? '✓' : item.assessment.level === 'review' ? '!' : '✗';
    lines.push(`${marker} [${item.assessment.level.toUpperCase()}] ${item.ecosystem}:${item.name}@${item.version} — ${item.license}`);
    lines.push(`  scope: ${item.scope}; source: ${item.source}`);
    lines.push(`  ${item.assessment.reason}`);
    lines.push(`  usage: ${item.usageSummary}`);
    for (const usage of item.usageEvidence.slice(0, 5)) lines.push(`    - ${usage.file}:${usage.line} [${usage.kind}] ${usage.snippet}`);
    if (item.recommendations.length) {
      lines.push('  alternatives:');
      for (const recommendation of item.recommendations) lines.push(`    - ${recommendation.name} (${recommendation.license}) — ${recommendation.note}`);
    }
    if (item.notes.length) for (const note of item.notes) lines.push(`  note: ${note}`);
  }
  lines.push('');
  lines.push(`NOTICE: ${report.notice}`);
  return lines.join('\n');
}

export function writeReport(report, format, outputPath) {
  const value = format === 'sarif' ? JSON.stringify(toSarif(report), null, 2) : format === 'json' ? JSON.stringify(report, null, 2) : renderHuman(report);
  if (outputPath) {
    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    fs.writeFileSync(outputPath, `${value}\n`, 'utf8');
  }
  return value;
}
