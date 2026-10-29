import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { uniqueValues } from '../docs/examples/after/src/unique.mjs';

// Documentation rendering only. Point README_RENDER_MODULES at an existing
// node_modules containing Playwright; the product stays dependency-free.
const root = fileURLToPath(new URL('../', import.meta.url));
const modules = process.env.README_RENDER_MODULES;
const require = createRequire(modules ? path.join(path.resolve(modules), '__docs_renderer__.cjs') : import.meta.url);
const { chromium } = require('playwright');
const out = path.join(root, 'docs/assets/examples');
const transcripts = path.join(root, 'docs/examples/transcripts');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(transcripts, { recursive: true });
const cli = path.join(root, 'bin/commercial-license-skill.mjs');
const run = args => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
const scanArgs = state => ['scan', `docs/examples/${state}`, '--allowed-licenses', 'MIT,Apache-2.0', '--no-snippets', '--fail-on', 'review'];
const before = run(scanArgs('before'));
const after = run(scanArgs('after'));
assert.equal(before.status, 2, before.stderr);
assert.equal(after.status, 0, after.stderr);
const beforeJson = run(['scan', 'docs/examples/before', '--allowed-licenses', 'MIT,Apache-2.0', '--no-snippets', '--format', 'json']);
assert.equal(beforeJson.status, 0, beforeJson.stderr);
const report = JSON.parse(beforeJson.stdout);
assert.equal(report.summary.high, 1);
const candidate = run(['recommend', 'imagemagick', '--allowed-licenses', 'MIT', '--json']);
assert.equal(candidate.status, 0, candidate.stderr);
assert.deepEqual(JSON.parse(candidate.stdout).curated.map(item => item.name), ['jimp']);

const sampleRuns = [
  ['first occurrence order', ['b', 'a', 'b'], ['b', 'a']],
  ['empty input', [], []],
  ['number values', [3, 1, 3, 2], [3, 1, 2]],
  ['SameValueZero', [NaN, NaN, 0, -0], [NaN, 0]]
];
for (const [, values, expected] of sampleRuns) assert.deepEqual(uniqueValues(values), expected);
const verification = sampleRuns.map(([name]) => `PASS  ${name}`).join('\n');
const diff = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--', 'docs/examples/before', 'docs/examples/after'], { cwd: root, encoding: 'utf8' });
assert.equal(diff.status, 1, diff.stderr);
fs.writeFileSync(path.join(transcripts, 'scan-before.txt'), before.stdout);
fs.writeFileSync(path.join(transcripts, 'scan-after.txt'), after.stdout);
fs.writeFileSync(path.join(transcripts, 'recommend.json'), candidate.stdout);
fs.writeFileSync(path.join(transcripts, 'migration.diff'), diff.stdout);
fs.writeFileSync(path.join(transcripts, 'verification.txt'), `${verification}\n`);

const installRoot=path.join(root,'.commercial-license-skill/qa/installer-demo');
fs.mkdirSync(installRoot,{recursive:true});
const installer=spawnSync(process.execPath,[cli,'install','--project'],{cwd:installRoot,encoding:'utf8',input:'1,2,3,6\n',timeout:15000});
assert.equal(installer.status,0,installer.stderr);
for(const folder of ['.claude/skills','.agents/skills','.gemini/skills']) assert.ok(fs.existsSync(path.join(installRoot,folder,'commercial-license-skill/SKILL.md')));
fs.writeFileSync(path.join(transcripts,'installer.txt'),installer.stdout.replace(/\x1b\[[0-9;]*m/g,'').replace(/[ \t]+$/gm,'').trimEnd()+'\n');

const escape = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lines = text => text.trimEnd().split(/\r?\n/).map(line => `<div class="line ${line.startsWith('+') && !line.startsWith('+++') ? 'added' : line.startsWith('-') && !line.startsWith('---') ? 'removed' : line.includes('[HIGH]') ? 'danger' : line.startsWith('PASS') ? 'success' : ''}">${escape(line) || '&nbsp;'}</div>`).join('');
const css = `*{box-sizing:border-box}html,body{margin:0;background:#0b1018;color:#e7edf5;font-family:"Segoe UI",sans-serif}main{padding:38px;width:1320px;min-height:680px}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}.eyebrow{color:#8ca0ba;letter-spacing:2px;font-size:15px;font-weight:600}.stamp{border:1px solid #345343;color:#a9e7c9;background:#11291f;padding:8px 12px;border-radius:7px;font-size:13px;letter-spacing:1px}h1{font-size:37px;font-weight:600;letter-spacing:-1px;margin:7px 0 0}.subtitle{color:#a9b5c6;font-size:18px;margin-top:10px}.window{background:#111925;border:1px solid #2c394d;border-radius:13px;overflow:hidden}.bar{display:flex;align-items:center;gap:10px;background:#1a2534;border-bottom:1px solid #2c394d;padding:15px 20px;color:#b7c4d6;font:16px Consolas,monospace}.dot{width:10px;height:10px;background:#536579;border-radius:50%}.bar span:last-child{margin-left:8px}.terminal{padding:24px;font:18px/1.6 Consolas,"Cascadia Code",monospace}.command{color:#a9e7c9;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 21px}.line{white-space:pre-wrap;overflow-wrap:anywhere;min-height:1.6em}.danger,.removed{color:#ffb6b6}.success,.added{color:#a9e7c9}.removed{background:#2d1b25}.added{background:#152b25}.muted{color:#8292a7}.foot{color:#91a2b8;font-size:15px;margin:20px 0 0;display:flex;justify-content:space-between;gap:20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.pill{font:15px Consolas,monospace;border:1px solid #344252;padding:6px 10px;border-radius:6px;color:#b6c5d9}.label{color:#90a4bd;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}.code{font:22px/1.65 Consolas,"Cascadia Code",monospace}.panel{border:1px solid #2c394d;border-radius:12px;padding:24px;background:#111925}.panel h2{font-size:22px;font-weight:500;margin:0 0 12px}.row{margin-top:18px}.prompt{font-size:22px;line-height:1.65;margin:0;color:#e0e9f4}.host{--accent:#a9e7c9}.host .stamp{border-color:var(--accent);color:var(--accent);background:transparent}.host h1{font-size:42px}.host main{min-height:745px}.host .command{font-size:18px}.host .code{font-size:24px}.patch-title{font:17px Consolas,monospace;color:#becde0;padding-bottom:14px;margin-bottom:15px;border-bottom:1px solid #2a384c}.host .grid{grid-template-columns:1.05fr 1fr}.host .foot{font-size:14px}.step{display:inline-block;color:var(--accent);margin-right:12px}.compact{font-size:17px;line-height:1.55}`;
const frame = (title, stamp, body, foot, subtitle = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><main><header><div><div class="eyebrow">COMMERCIAL LICENSE SKILL / EXAMPLES</div><h1>${title}</h1>${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}</div><div class="stamp">${stamp}</div></header>${body}<div class="foot">${foot}</div></main></body></html>`;
const terminal = (title, command, body) => `<section class="window"><div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span>${title}</span></div><div class="terminal">${command ? `<div class="command">$ ${escape(command)}</div>` : ''}${body}</div></section>`;
const shots = [];
function ansi(text) {
  const colors={30:'#0b1018',31:'#ffb6b6',32:'#a9e7c9',33:'#edcf8e',34:'#a9c9ff',35:'#d0b4fa',36:'#a0dce5',37:'#e7edf5',90:'#94a4b8'};
  let color='#e7edf5',weight=400,result='',offset=0;
  for(const match of text.matchAll(/\x1b\[([0-9;]*)m/g)) {
    result+=`<span style="color:${color};font-weight:${weight}">${escape(text.slice(offset,match.index))}</span>`;
    for(const value of match[1].split(';').map(Number)) {
      if(value===0){color='#e7edf5';weight=400;}
      else if(value===1) weight=700;
      else if(value===2) color='#94a4b8';
      else if(colors[value]) color=colors[value];
    }
    offset=match.index+match[0].length;
  }
  return result+`<span style="color:${color};font-weight:${weight}">${escape(text.slice(offset))}</span>`;
}
shots.push(['installer.png',frame('Install once. Choose your assistants.','ACTUAL INTERACTIVE INSTALLER',terminal('install · recorded selection: 1,2,3,6','node <checkout>/bin/commercial-license-skill.mjs install --project',`<div style="white-space:pre-wrap;overflow-wrap:anywhere;font:19px/1.55 Consolas,\"Malgun Gothic\",monospace">${ansi(installer.stdout)}</div>`),'<span>Actual local installer · ANSI colors preserved · isolated demo workspace</span><span>Codex and agy share one project directory.</span>')]);
const beforeExcerpt = before.stdout.split(/\r?\n/).filter(line => !line.startsWith('  Does not') && !line.startsWith('  note:') && !line.startsWith('COVERAGE:') && !line.startsWith('NOTICE:')).join('\n');
shots.push(['scan.png', frame('01 / Find the license & its usage', 'ACTUAL CLI OUTPUT · EXCERPT', terminal('scan · synthetic demo fixture', 'node bin/commercial-license-skill.mjs scan docs/examples/before\n  --allowed-licenses MIT,Apache-2.0 --no-snippets --fail-on review', lines(beforeExcerpt)), '<span>Synthetic metadata · gpl-demo is not a real recommendation</span><span>Exit 2 · Full report: scan-before.txt</span>')]);
const oldSource = fs.readFileSync(path.join(root, 'docs/examples/before/src/unique.mjs'), 'utf8');
const newSource = fs.readFileSync(path.join(root, 'docs/examples/after/src/unique.mjs'), 'utf8');
shots.push(['patch.png', frame('02 / Review the actual file changes', 'EXECUTABLE DOCUMENTATION FIXTURE', `<div class="grid"><section class="panel"><div class="label">Before · src/unique.mjs</div><div class="code">${lines(oldSource)}</div></section><section class="panel"><div class="label">After · src/unique.mjs</div><div class="code">${lines(newSource)}</div></section></div><div class="grid row"><section class="panel"><div class="label">package.json + package-lock.json</div><div class="code">${lines('- "gpl-demo": "1.0.0"\n+ "dependencies": {}')}</div><p class="subtitle">Remove the import and the locked dependency.</p></section><section class="panel"><div class="label">Executed checks</div><div class="code">${lines(verification)}</div></section></div>`, '<span>Requirement: deduplicate primitive values, preserving first appearance.</span><span>No third-party implementation copied.</span>')]);
const afterExcerpt = after.stdout.split(/\r?\n/).filter(line=>!line.startsWith('COVERAGE:')&&!line.startsWith('NOTICE:')).join('\n');
shots.push(['rescan.png', frame('03 / Re-scan the changed project', 'ACTUAL CLI OUTPUT · EXCERPT', terminal('scan · after the example patch', 'node bin/commercial-license-skill.mjs scan docs/examples/after\n  --allowed-licenses MIT,Apache-2.0 --no-snippets --fail-on review', lines(afterExcerpt)) + `<section class="panel row"><div class="code success">Exit 0 · No dependency findings in this fixture.</div><div class="subtitle">Coverage stays partial. This is not release clearance.</div></section>`, '<span>Actual local run · current CLI · synthetic fixture</span><span>Full report: scan-after.txt</span>')]);
shots.push(['candidates.png', frame('04 / Filter candidates to your terms', 'ACTUAL CLI JSON', terminal('recommend · MIT-only discovery', 'node bin/commercial-license-skill.mjs recommend imagemagick\n  --allowed-licenses MIT --json', lines(candidate.stdout)), '<span>Catalog lead, not a verified or drop-in replacement.</span><span>Source: recommend.json</span>')]);

const hosts = [
  { id:'codex', title:'Codex', accent:'#a9e7c9', install:'--frameworks codex', location:'.agents/skills/commercial-license-skill/', request:'Use $commercial-license-skill.\nReview this project for MIT / Apache-2.0.\nReplace the demo call with native Set.\nShow the diff and run the checks.', action:'Review the workspace patch', result:'File changes + command/test results', mode:'workspace files', edit:true },
  { id:'claude-code', title:'Claude Code', accent:'#efbda7', install:'--frameworks claude-code', location:'.claude/skills/commercial-license-skill/', request:'/commercial-license-skill\nReview this project for MIT / Apache-2.0.\nRemove the demo dependency using Set.\nShow changes and verify the behavior.', action:'Review the source and lockfile diff', result:'Source edits + verification output', mode:'workspace files', edit:true },
  { id:'agy', title:'Antigravity / agy CLI', accent:'#bed1ff', install:'--frameworks antigravity', location:'.agents/skills/commercial-license-skill/', request:'Use commercial-license-skill.\nCheck the license and the import.\nUse native Set for this demo.\nShow changed files and check the result.', action:'Review changed workspace files', result:'Proposed edits + scan results', mode:'workspace files', edit:true },
  { id:'gemini-cli', title:'Gemini CLI', accent:'#b0c8ff', install:'--frameworks gemini-cli', location:'.gemini/skills/commercial-license-skill/', request:'Use commercial-license-skill.\nAllow MIT and Apache-2.0.\nReplace the demo dependency with Set.\nShow the patch and verification output.', action:'Inspect the proposed patch', result:'File changes + local checks', mode:'workspace files', edit:true },
  { id:'chatgpt', title:'ChatGPT', accent:'#b1e6db', location:'SKILL.md + manifests + license evidence', request:'Use the attached commercial-license-skill.\nReview these supplied project files.\nAccept MIT / Apache-2.0.\nReturn the evidence and a proposed diff.', action:'Receive a suggested diff', result:'Apply locally, then run the scanner', mode:'supplied files', edit:false },
  { id:'claude', title:'Claude', accent:'#e9cbb6', location:'SKILL.md + manifests + license evidence', request:'Follow the attached commercial-license-skill.\nReview the provided license declarations.\nAccept MIT / Apache-2.0.\nSuggest a native Set replacement.', action:'Receive a suggested source patch', result:'Apply locally, then verify behavior', mode:'supplied files', edit:false }
];
for (const host of hosts) {
  const setup = host.install ? `<div class="command compact">${escape(`node bin/commercial-license-skill.mjs install\n  --project ${host.install} --yes`)}</div>` : '<p class="subtitle">Provide the skill and the relevant project files.</p>';
  const body = `<div class="grid"><section class="panel"><div class="label"><span class="step">01</span>${host.edit?'Install in the target project':'Provide context'}</div>${setup}<div class="pill">${escape(host.location)}</div><div class="label row"><span class="step">02</span>Suggested request</div><p class="prompt">${escape(host.request).replace(/\n/g,'<br>')}</p></section><section class="panel"><div class="label"><span class="step">03</span>${host.action}</div><div class="patch-title">${host.edit?'workspace diff':'suggested diff'} · src/unique.mjs</div><div class="code">${lines("- import unique from 'gpl-demo';\n\n  export function uniqueValues(values) {\n-   return unique(values);\n+   return [...new Set(values)];\n  }")}</div><div class="label row">Also update</div><div class="pill">package.json · package-lock.json</div><p class="subtitle">${host.result}</p></section></div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="host" style="--accent:${host.accent}"><main><header><div><div class="eyebrow">PLATFORM WORKFLOW / ${host.mode.toUpperCase()}</div><h1>${host.title}</h1></div><div class="stamp">WORKFLOW EXAMPLE</div></header>${body}<div class="foot"><span>Illustrated usage · not a native app screenshot or a recorded model run.</span><span>${host.edit?'File edits require the host\'s workspace access.':'Chat-only example: no direct local file modification.'}</span></div></main></body></html>`;
  shots.push([`${host.id}.png`,html]);
}

const browser = await chromium.launch({ headless:true, ...(process.env.README_BROWSER ? {executablePath:process.env.README_BROWSER} : {}) });
try {
  const dimensions=[];
  for (const [name, html] of shots) {
    const page=await browser.newPage({viewport:{width:1320,height:900},deviceScaleFactor:1.5});
    await page.setContent(html);
    const main=page.locator('main');
    const clipping=await page.evaluate(()=>[...document.querySelectorAll('main,section')].some(el=>el.scrollWidth>el.clientWidth+1));
    assert.equal(clipping,false,`Overflow in ${name}`);
    await main.screenshot({path:path.join(out,name)});
    dimensions.push({name,...await main.boundingBox()});
    await page.close();
  }
  console.log(JSON.stringify({screenshots:dimensions,verifiedDemoChecks:sampleRuns.length,beforeExit:before.status,afterExit:after.status},null,2));
} finally { await browser.close(); }
