import { normalizeLicense } from './utils.mjs';

const RULES = [
  { match: /^(MIT|MIT-0|APACHE-2\.0|BSD-2-CLAUSE|BSD-3-CLAUSE|ISC|0BSD|ZLIB|BSL-1\.0|CC0-1\.0|UNLICENSE)$/, level: 'allow', reason: 'Permissive or public-domain style license. Usually suitable for commercial use without source-disclosure obligations for your own code.' },
  { match: /^(MPL-2\.0|EPL-2\.0|CDDL-1\.0|CDDL-1\.1)$/, level: 'review', reason: 'Weak or file-level copyleft. Commercial use may be possible, but modified covered files and distribution details need review.' },
  { match: /^(LGPL-2\.0|LGPL-2\.0-ONLY|LGPL-2\.0-OR-LATER|LGPL-2\.1|LGPL-2\.1-ONLY|LGPL-2\.1-OR-LATER|LGPL-3\.0|LGPL-3\.0-ONLY|LGPL-3\.0-OR-LATER)$/, level: 'review', reason: 'Library copyleft. Linking mode, relinking rights, modifications, and distribution method matter.' },
  { match: /^(GPL-2\.0|GPL-2\.0-ONLY|GPL-2\.0-OR-LATER|GPL-3\.0|GPL-3\.0-ONLY|GPL-3\.0-OR-LATER)$/, level: 'high', reason: 'Strong copyleft. Distribution and combination details can create source-disclosure obligations.' },
  { match: /^(AGPL-3\.0|AGPL-3\.0-ONLY|AGPL-3\.0-OR-LATER|SSPL-1\.0|SERVER SIDE PUBLIC LICENSE.*)$/, level: 'critical', reason: 'Network-service or service-side source obligations may be triggered. Escalate for legal review before production use.' },
  { match: /(BUSL|BSL-1\.1|BUSINESS SOURCE|COMMONS CLAUSE|POLYFORM|ELASTIC LICENSE|SOURCE AVAILABLE|NON-COMMERCIAL|NC-|PROPRIETARY|COMMERCIAL LICENSE)/, level: 'critical', reason: 'Source-available, non-commercial, or custom terms can restrict commercial use. Read the exact license text.' },
  { match: /(GPL|AGPL|SSPL)/, level: 'high', reason: 'Copyleft or service-side terms detected in a compound expression. Review the exact SPDX expression and usage.' }
];

export const LEVEL_ORDER = { allow: 0, info: 1, review: 2, high: 3, critical: 4 };

function classifySingle(license) {
  const normalized = license.trim().toUpperCase().replace(/[()]/g, '');
  if (normalized === 'UNKNOWN' || normalized === '') {
    return { level: 'review', reason: 'License metadata is missing or ambiguous.' };
  }
  for (const rule of RULES) {
    if (rule.match.test(normalized)) return { level: rule.level, reason: rule.reason };
  }
  return { level: 'review', reason: 'License is not in the built-in allowlist.' };
}

export function classifyLicense(rawLicense) {
  const normalized = normalizeLicense(rawLicense);
  if (normalized === 'UNKNOWN' || normalized === '') {
    return { license: 'UNKNOWN', level: 'review', reason: 'License metadata is missing or ambiguous. Inspect the package repository and bundled license file before commercial use.' };
  }

  // Handle WITH exception
  if (/\s+WITH\s+/i.test(normalized)) {
    const parts = normalized.split(/\s+WITH\s+/i);
    const base = classifySingle(parts[0]);
    return {
      license: normalized,
      level: base.level,
      reason: `${base.reason} (Includes exception: ${parts[1]})`
    };
  }

  // Handle OR expression
  if (/\s+OR\s+/i.test(normalized)) {
    const parts = normalized.split(/\s+OR\s+/i);
    const classifications = parts.map(p => ({ name: p.trim(), ...classifySingle(p) }));
    const allowedOption = classifications.find(c => c.level === 'allow');
    if (allowedOption) {
      return {
        license: normalized,
        level: 'allow',
        reason: `Dual/Multi-licensed. Permissive choice '${allowedOption.name}' is available. (Other options: ${classifications.filter(c => c !== allowedOption).map(c => `${c.name} [${c.level}]`).join(', ')})`
      };
    }
    const sorted = classifications.sort((a, b) => (LEVEL_ORDER[a.level] ?? 0) - (LEVEL_ORDER[b.level] ?? 0));
    return {
      license: normalized,
      level: sorted[0].level,
      reason: `Dual/Multi-licensed expression. The lowest risk option is '${sorted[0].name}' [${sorted[0].level}].`
    };
  }

  // Handle AND expression
  if (/\s+AND\s+/i.test(normalized)) {
    const parts = normalized.split(/\s+AND\s+/i);
    const classifications = parts.map(p => ({ name: p.trim(), ...classifySingle(p) }));
    const sorted = classifications.sort((a, b) => (LEVEL_ORDER[b.level] ?? 0) - (LEVEL_ORDER[a.level] ?? 0));
    return {
      license: normalized,
      level: sorted[0].level,
      reason: `Combined license requirements (AND). Highest risk option is '${sorted[0].name}' [${sorted[0].level}].`
    };
  }

  const base = classifySingle(normalized);
  return { license: normalized, level: base.level, reason: base.reason };
}

export function isAtLeast(level, threshold) {
  return (LEVEL_ORDER[level] ?? 0) >= (LEVEL_ORDER[threshold] ?? 0);
}
