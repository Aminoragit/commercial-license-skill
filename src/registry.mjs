import { classifyLicense } from './license-policy.mjs';
import { CLI_VERSION } from './scan.mjs';

function normalizeRepository(repository) {
  if (!repository) return null;
  const value = typeof repository === 'string' ? repository : repository.url;
  if (!value) return null;
  return String(value).replace(/^git\+/, '').replace(/\.git$/, '');
}

export async function searchNpmCandidates(query, options = {}) {
  const size = Math.max(1, Math.min(Number(options.size ?? 12), 30));
  const endpoint = new URL('https://registry.npmjs.org/-/v1/search');
  endpoint.searchParams.set('text', String(query));
  endpoint.searchParams.set('size', String(size));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(options.timeoutMs ?? 5000));
  try {
    const response = await fetch(endpoint, {
      headers: { accept: 'application/json', 'user-agent': `commercial-license-skill/${CLI_VERSION}` },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}`);
    const body = await response.json();
    return (body.objects ?? [])
      .map((item) => {
        const pkg = item.package ?? {};
        const assessment = classifyLicense(pkg.license);
        return {
          name: pkg.name,
          version: pkg.version,
          license: pkg.license ?? 'UNKNOWN',
          description: pkg.description ?? '',
          repository: normalizeRepository(pkg.links?.repository ?? pkg.repository),
          npm: pkg.links?.npm ?? null,
          score: Number(item.score?.final ?? 0),
          assessment,
          source: 'npm-registry-search',
          note: 'Discovery candidate only. Verify exact repository license, transitive dependencies, maintenance activity, API fit, and migration tests before adoption.'
        };
      })
      .filter((item) => item.name && item.assessment.level === 'allow')
      .sort((a, b) => b.score - a.score);
  } finally {
    clearTimeout(timer);
  }
}

