import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
let files = 0, links = 0;
function visit(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.agents', '.commercial-license-skill'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) visit(full);
    else if (item.isFile() && item.name.endsWith('.md')) check(full);
  }
}
function check(file) {
  files++;
  const source = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  const targets = [...source.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(?:href|src)="([^"]+)"/g)].map(match => match[1] ?? match[2]);
  for (const target of targets) {
    if (/^(?:https?:|mailto:|data:)/i.test(target)) continue;
    const [local, fragment] = target.split('#');
    const resolved = local ? path.resolve(path.dirname(file), decodeURIComponent(local)) : file;
    links++;
    if (!fs.existsSync(resolved)) { failures.push(`${path.relative(root, file)}: missing ${target}`); continue; }
    if (fragment && resolved.endsWith('.md')) {
      const headings = [...fs.readFileSync(resolved, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-'));
      if (!headings.includes(decodeURIComponent(fragment))) failures.push(`${path.relative(root, file)}: unknown heading ${target}`);
    }
  }
}
visit(root);
for (const evaluation of JSON.parse(fs.readFileSync(path.join(root, 'skills/commercial-license-skill/evals/evals.json'), 'utf8')).evals) {
  if (evaluation.fixture && !fs.existsSync(path.join(root, evaluation.fixture))) failures.push(`Evaluation ${evaluation.id}: missing fixture ${evaluation.fixture}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${files} Markdown files, ${links} local links and evaluation fixture paths.`);
