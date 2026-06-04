import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpRequest } from '../src/mcp.mjs';

test('MCP tools/list exposes scanner and recommender', async () => {
  const response = await handleMcpRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  assert.equal(response.result.tools.length, 2);
  assert.equal(response.result.tools[0].name, 'scan_project_licenses');
});

test('MCP ping responds', async () => {
  const response = await handleMcpRequest({ jsonrpc: '2.0', id: 2, method: 'ping' });
  assert.deepEqual(response.result, {});
});
