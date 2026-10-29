const CATALOG = {
  'pdfjs-dist': [
    { name: '@opendocsg/pdf2md', license: 'MIT', note: 'Consider when your actual need is PDF-to-Markdown extraction; verify feature coverage.' },
    { name: 'pdf-lib', license: 'MIT', note: 'Useful for PDF creation and editing; not a universal parser replacement.' }
  ],
  'ghostscript': [
    { name: 'pdf-lib', license: 'MIT', note: 'For JavaScript PDF manipulation where rendering is not required.' },
    { name: 'mupdf', license: 'AGPL/commercial', note: 'Not automatically commercial-safe; shown only to prevent unsafe blind substitution.', blocked: true }
  ],
  'imagemagick': [
    { name: 'sharp', license: 'Apache-2.0', note: 'Node image processing backed by libvips; map only the operations your project uses.' },
    { name: 'jimp', license: 'MIT', note: 'Pure-JavaScript image processing for simpler workloads.' }
  ],
  'chart.js': [
    { name: 'echarts', license: 'Apache-2.0', note: 'Alternative charting library; API migration required.' },
    { name: 'recharts', license: 'MIT', note: 'React-oriented alternative; suitable only for React applications.' }
  ]
};

import { classifyLicense, validateAllowedLicenses } from './license-policy.mjs';

export function recommendationsFor(name, options = {}) {
  validateAllowedLicenses(options.allowedLicenses);
  if (options.ecosystem && !['npm', 'system', 'vendored'].includes(options.ecosystem)) return [];
  const direct = CATALOG[String(name).toLowerCase()] ?? [];
  return direct.filter(item => !item.blocked && classifyLicense(item.license, options).level === 'allow').map(item => ({
    ...item,
    ecosystem: 'npm',
    source: 'curated-discovery',
    verification: 'unverified',
    version: null,
    note: `${item.note} Discovery only: verify the selected version, artifact LICENSE/NOTICE, transitives and actual API fit.`
  }));
}

export function catalogEntries() {
  return CATALOG;
}
