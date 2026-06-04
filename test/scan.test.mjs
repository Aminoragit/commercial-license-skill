import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanProject, shouldFail, toSarif } from '../src/scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('flags GPL runtime dependency and recommends curated replacement', () => {
  const report = scanProject(path.join(here, 'fixtures', 'node-risk'));
  assert.equal(report.summary.high, 1);
  assert.equal(report.dependencies[0].name, 'gpl-demo');
  assert.equal(report.dependencies[0].recommendations[0].name, 'mit-demo');
  assert.equal(shouldFail(report, 'high'), true);
});

test('allows MIT dependency', () => {
  const report = scanProject(path.join(here, 'fixtures', 'node-safe'));
  assert.equal(report.summary.allow, 1);
  assert.equal(shouldFail(report, 'high'), false);
});

test('emits SARIF results for risky dependencies', () => {
  const report = scanProject(path.join(here, 'fixtures', 'node-risk'));
  const sarif = toSarif(report);
  assert.equal(sarif.version, '2.1.0');
  assert.equal(sarif.runs[0].results.length, 1);
});

test('detects actual system executable invocation without matching plain catalog strings', () => {
  const signalReport = scanProject(path.join(here, 'fixtures', 'system-signal'));
  assert.equal(signalReport.dependencies.some((item) => item.name === 'ffmpeg'), true);
  const selfReport = scanProject(path.resolve(here, '..'));
  assert.equal(selfReport.dependencies.some((item) => item.ecosystem === 'system' && item.source === 'src/catalog.mjs'), false);
});

test('attaches lightweight source usage evidence for npm imports', () => {
  const report = scanProject(path.join(here, 'fixtures', 'node-risk'));
  assert.equal(report.dependencies[0].usageEvidence[0].file, 'src/index.ts');
  assert.equal(report.dependencies[0].usageEvidence[0].kind, 'js-import');
});

test('detects restricted license text in vendored third-party code', () => {
  const report = scanProject(path.join(here, 'fixtures', 'vendored-risk'));
  assert.equal(report.summary.critical, 1);
  assert.equal(report.dependencies[0].ecosystem, 'vendored');
});
