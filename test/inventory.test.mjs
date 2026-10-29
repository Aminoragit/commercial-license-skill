import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanProject, shouldFail } from '../src/scan.mjs';

function project(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'license-inventory-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, data] of Object.entries(files)) {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data));
  }
  return root;
}

test('lock resolution preserves direct scope and excludes dev transitives by default', t => {
  const root = project(t, {
    'package.json': { dependencies: { widget: '^1.0.0' }, devDependencies: { tester: '^2.0.0' } },
    'package-lock.json': { lockfileVersion: 3, packages: { '': {}, 'node_modules/widget': { version: '1.2.0', license: 'MIT' }, 'node_modules/tester': { version: '2.0.0', license: 'GPL-3.0-only', dev: true } } }
  });
  const report = scanProject(root);
  assert.equal(report.summary.total, 1);
  assert.equal(report.dependencies[0].version, '1.2.0');
  assert.equal(report.dependencies[0].scope, 'runtime');
  assert.equal(scanProject(root, { includeDev: true }).summary.total, 2);
});

test('conflicting installed and locked declarations cannot become allow', t => {
  const root = project(t, {
    'package.json': { dependencies: { widget: '1.0.0' } },
    'node_modules/widget/package.json': { name: 'widget', version: '1.0.0', license: 'MIT' },
    'package-lock.json': { packages: { 'node_modules/widget': { version: '1.0.0', license: 'GPL-3.0-only' } } },
    'node_modules/widget/examples/package.json': { name: 'not-installed', version: '1.0.0', license: 'MIT' }
  });
  const report = scanProject(root);
  assert.equal(report.summary.total, 1);
  assert.equal(report.dependencies[0].licenseConflict, true);
  assert.notEqual(report.dependencies[0].assessment.level, 'allow');
  assert.equal(shouldFail(report, 'high'), true);
  assert.equal(report.dependencies[0].licenseDeclarations.some(item => item.license === 'GPL-3.0-only'), true);
  assert.equal(report.dependencies[0].licenseDeclarations.find(item => item.license === 'GPL-3.0-only').source, 'package-lock.json');
});

test('a different installed version cannot provide the locked artifact license', t => {
  const root = project(t, {
    'package.json': { dependencies: { widget: '^1.0.0' } },
    'package-lock.json': { packages: { 'node_modules/widget': { version: '1.0.0' } } },
    'node_modules/widget/package.json': { name: 'widget', version: '2.0.0', license: 'MIT' }
  });
  const dependencies = scanProject(root).dependencies;
  assert.equal(dependencies.find(item => item.version === '1.0.0').assessment.level, 'review');
  assert.equal(dependencies.find(item => item.version === '1.0.0').license, 'UNKNOWN');
  assert.equal(dependencies.find(item => item.version === '2.0.0').assessment.level, 'allow');
});

test('installed direct dev dependencies stay excluded without a lockfile', t => {
  const root = project(t, {
    'package.json': { devDependencies: { tester: '2.0.0' } },
    'node_modules/tester/package.json': { name: 'tester', version: '2.0.0', license: 'GPL-3.0-only' }
  });
  assert.equal(scanProject(root).summary.total, 0);
  assert.equal(scanProject(root, { includeDev: true }).summary.high, 1);
});

test('partial coverage and exclusions remain visible even when no findings survive', t => {
  const root = project(t, {
    'package.json': { dependencies: { widget: '1' } },
    'pnpm-lock.yaml': 'lockfileVersion: 9',
    'commercial-license-skill.config.json': { ignorePackages: ['widget'] }
  });
  const report = scanProject(root);
  assert.equal(report.coverage.complete, false);
  assert.equal(report.coverage.excluded[0].name, 'widget');
  assert.equal(report.coverage.warnings.some(value => value.includes('pnpm-lock.yaml')), true);
  assert.equal(report.summary.total, 0);
  assert.throws(() => scanProject(path.join(root, 'missing')), /ENOENT/);
});

test('Python modern License-Expression takes priority and Cargo handles CRLF', t => {
  const root = project(t, {
    'requirements.txt': 'widget==1.0.0\n',
    '.venv/lib/widget.dist-info/METADATA': 'Name: widget\nVersion: 1.0.0\nLicense: UNKNOWN\nLicense-Expression: MIT\n',
    'Cargo.lock': 'version = 3\r\n\r\n[[package]]\r\nname = "crate"\r\nversion = "2.0.0"\r\n'
  });
  const report = scanProject(root);
  assert.equal(report.dependencies.find(item => item.ecosystem === 'python').assessment.level, 'allow');
  assert.equal(report.dependencies.find(item => item.ecosystem === 'cargo').name, 'crate');
});

test('unrecognized vendored terms are visible and malformed manifests fail visibly', t => {
  const root = project(t, { 'third_party/asset/LICENSE': 'Custom font terms: contact the owner.' });
  assert.equal(scanProject(root).summary.review, 1);
  fs.writeFileSync(path.join(root, 'package.json'), '{broken');
  assert.throws(() => scanProject(root), /Cannot read JSON/);
});
