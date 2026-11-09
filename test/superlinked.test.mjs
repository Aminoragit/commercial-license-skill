import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CLAUSES, MAX_QUERY_LENGTH, cosineSimilarity, embedTexts, getSieConfig, searchClauses } from '../src/superlinked.mjs';

const bin = fileURLToPath(new URL('../bin/commercial-license-skill.mjs', import.meta.url));
const noKeyEnv = { ...process.env, SUPERLINKED_API_KEY: '', SIE_API_KEY: '' };
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env: noKeyEnv });

test('getSieConfig reads SUPERLINKED_API_KEY first and falls back to SIE_API_KEY', () => {
  assert.equal(getSieConfig({ SUPERLINKED_API_KEY: 'key-a', SIE_API_KEY: 'key-b' }).apiKey, 'key-a');
  assert.equal(getSieConfig({ SIE_API_KEY: 'key-b' }).apiKey, 'key-b');
  assert.equal(getSieConfig({}).available, false);
  assert.equal(getSieConfig({ SUPERLINKED_API_KEY: 'key-a' }).baseUrl, 'https://api.superlinked.com');
});

test('clause corpus has 12 licenses times 3 kinds', () => {
  assert.equal(CLAUSES.length, 36);
  assert.equal(new Set(CLAUSES.map((clause) => clause.licenseId)).size, 12);
  assert.deepEqual([...new Set(CLAUSES.map((clause) => clause.kind))].sort(), ['commercial', 'notice', 'source']);
  for (const clause of CLAUSES) assert.ok(clause.text.length > 0);
});

test('cosineSimilarity returns 1 for identical vectors and 0 for orthogonal ones', () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.ok(Math.abs(cosineSimilarity([1, 1], [1, 1]) - 1) < 1e-9);
  assert.equal(cosineSimilarity([0, 0], [1, 0]), 0);
  assert.equal(cosineSimilarity([1], [1, 2]), 0);
});

test('local fallback ranks the AGPL source clause first for a SaaS source question', async () => {
  const result = await searchClauses('SaaS로 제공하면 소스 공개해야 하나?', { config: getSieConfig({}) });
  assert.equal(result.mode, 'local');
  assert.equal(result.results.length, 5);
  assert.equal(result.results[0].licenseId, 'AGPL-3.0-only');
  assert.equal(result.results[0].kind, 'source');
  assert.equal(result.usage, null);
});

test('SIE mode embeds query and clauses in one batch and ranks by similarity', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const body = JSON.parse(init.body);
    const vectors = body.input.map((text, index) => {
      if (index === 0) return [1, 0];
      if (text.includes('AGPL-3.0-only — 소스 공개')) return [1, 0];
      if (text.includes('AGPL-3.0-only')) return [0.9, 0.4359];
      if (text.includes('GPL-3.0-only')) return [0.8, 0.6];
      return [0, 1];
    });
    return {
      ok: true,
      json: async () => ({ data: vectors.map((embedding) => ({ embedding })), usage: { prompt_tokens: 17, credits_charged: 1 } }),
    };
  };
  const config = getSieConfig({ SUPERLINKED_API_KEY: 'test-key' });
  const result = await searchClauses('SaaS로 제공하면 소스 공개해야 하나?', { fetchImpl, config });
  assert.equal(result.mode, 'sie');
  assert.equal(result.model, 'BAAI/bge-m3');
  assert.equal(result.results[0].id, 'AGPL-3.0-only:source');
  assert.equal(result.usage.credits_charged, 1);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.endsWith('/v1/embeddings'));
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-key');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.model, 'BAAI/bge-m3');
  assert.equal(body.input.length, 37);
});

test('embedTexts without a key throws instead of calling the network', async () => {
  let called = false;
  await assert.rejects(
    embedTexts(['hello'], { fetchImpl: async () => { called = true; return { ok: true, json: async () => ({}) }; }, config: getSieConfig({}) }),
    /SIE API key is not set/,
  );
  assert.equal(called, false);
});

test('empty and over-long questions are rejected', async () => {
  const config = getSieConfig({});
  await assert.rejects(searchClauses('   ', { config }), /Usage: commercial-license-skill ask/);
  await assert.rejects(searchClauses('a'.repeat(MAX_QUERY_LENGTH + 1), { config }), /500 characters or fewer/);
});

test('CLI ask requires a question and works in local mode without a key', () => {
  assert.equal(run('ask').status, 1);
  const result = run('ask', '상용 배포 가능한가?');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Mode: local/);
  assert.match(result.stdout, /not legal advice/);
  const json = run('ask', '상용 배포 가능한가?', '--json');
  assert.equal(json.status, 0);
  const parsed = JSON.parse(json.stdout);
  assert.equal(parsed.mode, 'local');
  assert.equal(parsed.results.length, 5);
  assert.equal(parsed.results[0].kind, 'commercial');
});
