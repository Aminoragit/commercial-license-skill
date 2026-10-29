import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/commercial-license-skill.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/node-safe', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('CLI enforces requested licenses with exit 2 and rejects misspelled fail thresholds', () => {
  const result = run('scan', fixture, '--allowed-licenses', 'Apache-2.0', '--format', 'json', '--fail-on', 'high');
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).summary.high, 1);
  assert.equal(run('scan', fixture, '--fail-on', 'hihg').status, 1);
  assert.equal(run('scan', fixture, '--allowed-licences', 'MIT').status, 1);
  assert.equal(run('recommend', 'no-catalog-entry', '--allowed-licenses=').status, 1);
});

test('boolean CLI flags do not consume the scan path and reject invalid values', () => {
  assert.equal(run('--help').status, 0);
  assert.equal(run('--version').stdout.trim(), '0.4.0');
  const result = run('scan', '--no-snippets', fixture, '--format', 'json');
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).summary.allow, 1);
  assert.equal(run('scan', fixture, '--include-dev=maybe').status, 1);
  assert.equal(run('scan', fixture, '--max-snippet-length', '-1').status, 1);
});

test('CLI honors config privacy and includeDev unless explicitly overridden', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'license-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ devDependencies: { dev: '1' } }));
  fs.writeFileSync(path.join(root, 'commercial-license-skill.config.json'), JSON.stringify({ includeDev: true, noSnippets: true, allowedLicenses: ['MIT'] }));
  const result = run('scan', root, '--format', 'json');
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.total, 1);
  assert.deepEqual(report.policy.allowedLicenses, ['MIT']);
});
