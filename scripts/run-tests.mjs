import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Explicit files avoid shell glob differences and executing synthetic fixtures.
const root = fileURLToPath(new URL('../', import.meta.url));
const files = fs.readdirSync(new URL('../test/', import.meta.url)).filter(name => name.endsWith('.test.mjs')).sort().map(name => `test/${name}`);
const result = spawnSync(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
