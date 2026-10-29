import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyLicense } from '../src/license-policy.mjs';

test('SPDX grouping and operator precedence preserve cumulative obligations', () => {
  for (const expression of ['(MIT OR Apache-2.0) AND GPL-3.0-only', 'MIT AND (Apache-2.0 OR GPL-3.0-only) AND GPL-3.0-only', '(MIT OR Apache-2.0) AND (GPL-3.0-only OR AGPL-3.0-only)']) {
    assert.equal(classifyLicense(expression).level, 'high', expression);
  }
  assert.equal(classifyLicense('MIT OR Apache-2.0 AND GPL-3.0-only').level, 'allow');
  assert.equal(classifyLicense('MIT AND Apache-2.0').level, 'allow');
});

test('exceptions, malformed expressions and legacy arrays never silently allow', () => {
  for (const expression of ['MIT WITH invented-exception', 'MIT OR', '(MIT', 'MIT)', 'MIT OR (Apache-2.0 AND)', 'MIT / Apache-2.0', 'MIT AND', ['MIT', 'GPL-3.0-only'], 'MIT AND '.repeat(300) + 'MIT']) {
    assert.notEqual(classifyLicense(expression).level, 'allow', String(expression));
  }
});

test('requested license conditions evaluate entire branches and selected grants', () => {
  const options = { allowedLicenses: ['MIT'] };
  assert.equal(classifyLicense('Apache-2.0', options).level, 'high');
  assert.equal(classifyLicense('MIT OR GPL-3.0-only', options).policyMatch, true);
  assert.equal(classifyLicense('MIT AND Apache-2.0', options).policyMatch, false);
  assert.equal(classifyLicense('(MIT OR Apache-2.0) AND ISC', options).policyMatch, false);
  assert.equal(classifyLicense('MIT WITH custom', options).policyMatch, null);
  const selected = classifyLicense('MIT OR GPL-3.0-only', { allowedLicenses: ['GPL-3.0-only'] });
  assert.equal(selected.selectedLicense, 'GPL-3.0-ONLY');
  assert.equal(selected.level, 'high');
  assert.throws(() => classifyLicense('MIT', { allowedLicenses: [] }));
});
