import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendationsFor } from '../src/catalog.mjs';
import { searchNpmCandidates } from '../src/registry.mjs';

test('curated candidates respect requested licenses and state verification limits', () => {
  const candidates = recommendationsFor('imagemagick', { allowedLicenses: ['MIT'] });
  assert.deepEqual(candidates.map(item => item.name), ['jimp']);
  assert.equal(candidates[0].verification, 'unverified');
  assert.deepEqual(recommendationsFor('ghostscript', { allowedLicenses: ['Apache-2.0'] }), []);
  assert.deepEqual(recommendationsFor('ffmpeg'), []);
  assert.deepEqual(recommendationsFor('mysql'), []);
  assert.deepEqual(recommendationsFor('chart.js', { ecosystem: 'python' }), []);
});

test('online discovery filters self, unknown and disallowed candidates', async t => {
  const previous = globalThis.fetch;
  t.after(() => { globalThis.fetch = previous; });
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ objects: [
    { package: { name: 'original', version: '1', license: 'MIT' } },
    { package: { name: 'good', version: '2', license: 'MIT' } },
    { package: { name: 'other', license: 'Apache-2.0' } },
    { package: { name: 'unclear' } },
    { package: { name: 'trick', license: '(MIT OR Apache-2.0) AND GPL-3.0-only' } }
  ] }) });
  const candidates = await searchNpmCandidates('image processing', { excludeName: 'original', allowedLicenses: ['MIT'] });
  assert.deepEqual(candidates.map(item => item.name), ['good']);
  assert.equal(candidates[0].verification, 'metadata-only');
});
