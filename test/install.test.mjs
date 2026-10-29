import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installSkill, uninstallSkill } from '../src/install.mjs';

test('installs and removes project-local universal skill', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'commercial-license-skill-'));
  const installed = await installSkill({ cwd, project: true, frameworks: 'universal', yes: true });
  const destination = path.join(cwd, '.agents', 'skills', 'commercial-license-skill', 'SKILL.md');
  assert.equal(installed.results[0].status, 'installed');
  assert.equal(fs.existsSync(destination), true);
  const removed = uninstallSkill({ cwd, project: true, frameworks: 'universal' });
  assert.equal(removed.results[0].status, 'removed');
  assert.equal(fs.existsSync(destination), false);
});

test('shared Codex, agy and universal paths are installed once and edits are backed up', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'license-install-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const installed = await installSkill({ cwd, project: true, frameworks: 'codex,antigravity,universal', yes: true });
  assert.equal(installed.results.filter(item => item.status === 'installed').length, 1);
  const destination = installed.results[0].destination;
  fs.writeFileSync(path.join(destination, 'personal.txt'), 'keep me');
  const updated = await installSkill({ cwd, project: true, frameworks: 'codex', yes: true });
  assert.equal(fs.readFileSync(path.join(updated.results[0].backedUp, 'personal.txt'), 'utf8'), 'keep me');
});

test('invalid framework sets fail before writing and dry-run makes no files', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'license-install-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  await assert.rejects(installSkill({ cwd, project: true, frameworks: 'codex,missing', yes: true }), /Unsupported/);
  assert.deepEqual(fs.readdirSync(cwd), []);
  await installSkill({ cwd, project: true, frameworks: 'antigravity', yes: true, dryRun: true });
  assert.deepEqual(fs.readdirSync(cwd), []);
});

test('backup failure preserves existing user files', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'license-backup-'));
  const destination = path.join(cwd, '.agents/skills/commercial-license-skill');
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'personal.txt'), 'do not remove');
  const rename = fs.renameSync;
  t.after(() => { fs.renameSync = rename; fs.rmSync(cwd, { recursive: true, force: true }); });
  fs.renameSync = () => { throw new Error('simulated permission failure'); };
  await assert.rejects(installSkill({ cwd, project: true, frameworks: 'codex', yes: true }), /Cannot back up/);
  assert.equal(fs.readFileSync(path.join(destination, 'personal.txt'), 'utf8'), 'do not remove');
});

test('copy failure restores a successfully backed-up skill', async t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'license-rollback-'));
  const destination = path.join(cwd, '.agents/skills/commercial-license-skill');
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'personal.txt'), 'restore me');
  const copy = fs.cpSync;
  t.after(() => { fs.cpSync = copy; fs.rmSync(cwd, { recursive: true, force: true }); });
  fs.cpSync = () => { throw new Error('simulated copy failure'); };
  await assert.rejects(installSkill({ cwd, project: true, frameworks: 'codex', yes: true }), /copy failure/);
  assert.equal(fs.readFileSync(path.join(destination, 'personal.txt'), 'utf8'), 'restore me');
});

