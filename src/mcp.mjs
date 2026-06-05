import readline from 'node:readline';
import path from 'node:path';
import { scanProject, CLI_VERSION } from './scan.mjs';
import { recommendationsFor } from './catalog.mjs';
import { searchNpmCandidates } from './registry.mjs';

const CLI_VERSION_FALLBACK = CLI_VERSION;
const SERVER_INFO = { name: 'commercial-license-skill', version: CLI_VERSION_FALLBACK };

const ALLOW_ROOTS = [path.resolve(process.cwd())];
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--allow-root' && process.argv[i + 1]) {
    ALLOW_ROOTS.push(path.resolve(process.argv[i + 1]));
  }
}

function isPathAllowed(targetPath) {
  const resolvedTarget = path.resolve(targetPath);
  return ALLOW_ROOTS.some(allowedRoot => {
    const relative = path.relative(allowedRoot, resolvedTarget);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  });
}

const TOOLS = [
  {
    name: 'scan_project_licenses',
    description: 'Scan a local software project and return conservative commercial-safe license triage with notices and curated replacement candidates.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Local project directory. Defaults to current working directory.' },
        includeDev: { type: 'boolean', description: 'Include development-only dependencies.' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'recommend_permissive_alternatives',
    description: 'Return curated and optionally npm-registry-discovered permissive-license replacement candidates. Candidates still require repository-license and API-fit verification.',
    inputSchema: {
      type: 'object',
      required: ['packageName'],
      properties: {
        packageName: { type: 'string' },
        online: { type: 'boolean', description: 'When true, query the public npm registry for discovery candidates.' },
        size: { type: 'integer', minimum: 1, maximum: 30 }
      },
      additionalProperties: false
    }
  }
];

function result(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

export async function handleMcpRequest(message) {
  const { id, method, params = {} } = message;
  if (method === 'initialize') {
    return { jsonrpc: '2.0', id, result: { protocolVersion: params.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: SERVER_INFO } };
  }
  if (method === 'notifications/initialized') return null;
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  if (method === 'tools/call') {
    const name = params.name;
    const args = params.arguments ?? {};
    if (name === 'scan_project_licenses') {
      const targetPath = args.path ?? '.';
      if (!isPathAllowed(targetPath)) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: `Access denied. Target path '${targetPath}' is outside allowed roots.` } };
      }
      return { jsonrpc: '2.0', id, result: result(scanProject(targetPath, { includeDev: Boolean(args.includeDev) })) };
    }
    if (name === 'recommend_permissive_alternatives') {
      const curated = recommendationsFor(args.packageName);
      let discovered = [];
      let onlineError = null;
      if (args.online) {
        try { discovered = await searchNpmCandidates(args.packageName, { size: args.size ?? 12 }); }
        catch (error) { onlineError = error?.message ?? String(error); }
      }
      return { jsonrpc: '2.0', id, result: result({ packageName: args.packageName, curated, discovered, onlineError }) };
    }
    return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } };
  }
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

export async function runMcpServer() {
  const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    let message;
    try { message = JSON.parse(line); }
    catch (error) {
      process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: `Parse error: ${error?.message ?? error}` } })}\n`);
      continue;
    }
    try {
      const response = await handleMcpRequest(message);
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    } catch (error) {
      process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message.id ?? null, error: { code: -32603, message: error?.message ?? String(error) } })}\n`);
    }
  }
}

