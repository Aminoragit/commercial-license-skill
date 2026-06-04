import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installSkill, uninstallSkill } from '../src/install.mjs';

test('installs and removes project-local universal skill', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'parasite-cleaner-'));
  const installed = await installSkill({ cwd, project: true, frameworks: 'universal', yes: true });
  const destination = path.join(cwd, '.agents', 'skills', 'parasite-cleaner', 'SKILL.md');
  assert.equal(installed.results[0].status, 'installed');
  assert.equal(fs.existsSync(destination), true);
  const removed = uninstallSkill({ cwd, project: true, frameworks: 'universal' });
  assert.equal(removed.results[0].status, 'removed');
  assert.equal(fs.existsSync(destination), false);
});
