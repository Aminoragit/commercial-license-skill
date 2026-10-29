import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpRequest } from '../src/mcp.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

test('MCP tools/list exposes scanner and recommender', async () => {
  const response = await handleMcpRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  assert.equal(response.result.tools.length, 2);
  assert.equal(response.result.tools[0].name, 'scan_project_licenses');
});

test('MCP ping responds', async () => {
  const response = await handleMcpRequest({ jsonrpc: '2.0', id: 2, method: 'ping' });
  assert.deepEqual(response.result, {});
});

test('MCP runtime rejects missing, mistyped and unsupported arguments', async () => {
  for (const args of [{}, { packageName: 42 }, { packageName: 'x', online: 'false' }, { packageName: 'x', size: 999 }, { packageName: 'x', allowedLicenses: [] }, { packageName: 'x', arbitrary: true }]) {
    const response = await handleMcpRequest({ id: 3, method: 'tools/call', params: { name: 'recommend_permissive_alternatives', arguments: args } });
    assert.equal(response.error.code, -32602);
  }
});

test('MCP scanner applies requested licenses and snippet privacy', async () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/node-risk');
  const response = await handleMcpRequest({ id: 4, method: 'tools/call', params: { name: 'scan_project_licenses', arguments: { path: root, allowedLicenses: ['MIT'], noSnippets: true } } });
  const report = JSON.parse(response.result.content[0].text);
  assert.deepEqual(report.policy.allowedLicenses, ['MIT']);
  assert.equal(report.dependencies[0].usageEvidence[0].snippet, '[REDACTED]');
});

test('MCP denies an existing root outside the allowlist', async () => {
  const response = await handleMcpRequest({ id: 5, method: 'tools/call', params: { name: 'scan_project_licenses', arguments: { path: path.parse(process.cwd()).root } } });
  assert.equal(response.error.code, -32602);
});

test('MCP real stdio round trip initializes, lists tools and scans with privacy', () => {
  const bin = fileURLToPath(new URL('../bin/commercial-license-skill.mjs', import.meta.url));
  const fixture = fileURLToPath(new URL('./fixtures/node-risk', import.meta.url));
  const requests = [
    { jsonrpc: '2.0', id: 10, method: 'initialize', params: { protocolVersion: '2025-06-18' } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 11, method: 'tools/list' },
    { jsonrpc: '2.0', id: 12, method: 'tools/call', params: { name: 'scan_project_licenses', arguments: { path: fixture, noSnippets: true, allowedLicenses: ['MIT'] } } }
  ];
  const child = spawnSync(process.execPath, [bin, 'mcp'], { encoding: 'utf8', input: requests.map(value => JSON.stringify(value)).join('\n') + '\n', timeout: 10000 });
  assert.equal(child.status, 0, child.stderr);
  const responses = child.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(responses.map(response => response.id), [10, 11, 12]);
  assert.equal(responses[0].result.serverInfo.version, '0.4.0');
  assert.equal(responses[1].result.tools.length, 2);
  const report = JSON.parse(responses[2].result.content[0].text);
  assert.equal(report.summary.high, 1);
  assert.equal(report.dependencies[0].usageEvidence[0].snippet, '[REDACTED]');
});

test('MCP canonical root validation denies a junction/symlink escape', async t => {
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'license-outside-'));
  const holder = fs.mkdtempSync(path.join(process.cwd(), '.license-mcp-test-'));
  t.after(() => { fs.rmSync(holder, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); });
  const link = path.join(holder, 'external');
  fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  const response = await handleMcpRequest({ id: 13, method: 'tools/call', params: { name: 'scan_project_licenses', arguments: { path: link } } });
  assert.equal(response.error.code, -32602);
});
