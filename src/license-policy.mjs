import { normalizeLicense } from './utils.mjs';

export const LEVEL_ORDER = { allow: 0, info: 1, review: 2, high: 3, critical: 4 };
export const DEFAULT_ALLOWED_LICENSES = ['MIT', 'MIT-0', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'Zlib', 'BSL-1.0', 'CC0-1.0', 'Unlicense'];
const PERMISSIVE = new Set(DEFAULT_ALLOWED_LICENSES.map(id => id.toUpperCase()));

// Bounded grammar parser, not SPDX License List validation. Unknown IDs stay review.
// Precedence: WITH > AND > OR. Never strip parentheses before parsing.
export function parseLicenseExpression(input) {
  const text = normalizeLicense(input);
  if (text.length > 4096) throw new Error('License expression is too long');
  const tokens = text.match(/\(|\)|[^\s()]+/g) ?? [];
  if (!tokens.length || tokens.length > 256) throw new Error('Invalid expression size');
  let cursor = 0;
  const take = () => tokens[cursor++];
  function atom() {
    if (tokens[cursor] === '(') {
      take();
      const node = expression();
      if (take() !== ')') throw new Error('Unbalanced parentheses');
      return node;
    }
    const id = take();
    if (!id || ['AND', 'OR', 'WITH', ')'].includes(id) || !/^(?:DOCUMENTREF-[A-Z0-9.-]+:)?[A-Z0-9][A-Z0-9.-]*\+?$/.test(id)) throw new Error('Expected a license identifier');
    let node = { type: 'license', id };
    if (tokens[cursor] === 'WITH') {
      take();
      const exception = take();
      if (!exception || ['AND', 'OR', 'WITH'].includes(exception) || !/^[A-Z0-9][A-Z0-9.-]*$/.test(exception)) throw new Error('Expected an exception identifier');
      node = { type: 'exception', license: node, exception };
    }
    return node;
  }
  function conjunction() {
    let node = atom();
    while (tokens[cursor] === 'AND') { take(); node = { type: 'and', left: node, right: atom() }; }
    return node;
  }
  function expression() {
    let node = conjunction();
    while (tokens[cursor] === 'OR') { take(); node = { type: 'or', left: node, right: conjunction() }; }
    return node;
  }
  const tree = expression();
  if (cursor !== tokens.length) throw new Error('Unexpected expression token');
  return tree;
}

function classifySingle(id) {
  if (PERMISSIVE.has(id)) return { level: 'allow', reason: 'Permissive metadata; preserve applicable license texts, attribution, notices and patent conditions. This is not release clearance.' };
  if (/^(?:AGPL|SSPL)(?:-|$)/.test(id)) return { level: 'critical', reason: 'Network or service-related source obligations need review against the exact terms and deployment facts. Commercial use is not automatically prohibited.' };
  if (/^(?:BUSL|BSL-1\.1|POLYFORM|ELASTIC|CC-BY-NC|CC-BY-NC-SA|CC-BY-NC-ND)|COMMONS.CLAUSE|NON.COMMERCIAL|PROPRIETARY|COMMERCIAL.LICENSE/.test(id)) return { level: 'critical', reason: 'Custom, source-available or non-commercial terms may conflict with the requested use. Inspect the exact grant and any purchased entitlement.' };
  if (/^(?:GPL|EUPL)(?:-|$)/.test(id)) return { level: 'high', reason: 'Copyleft review: distribution, modifications and combination can impose source obligations. A manifest entry alone does not establish those obligations.' };
  if (/^(?:LGPL|MPL|EPL|CDDL)(?:-|$)/.test(id)) return { level: 'review', reason: 'Library or file-level copyleft: inspect covered files, modifications, linking/relinking and distribution terms.' };
  return { level: 'review', reason: 'Missing, custom or unrecognized license metadata. Verify exact versioned license text and provenance.' };
}

function evaluate(tree) {
  if (tree.type === 'license') return { ...classifySingle(tree.id), selectedLicense: tree.id };
  if (tree.type === 'exception') {
    const base = evaluate(tree.license);
    return { ...base, level: LEVEL_ORDER[base.level] < LEVEL_ORDER.review ? 'review' : base.level, selectedLicense: `${tree.license.id} WITH ${tree.exception}`, reason: `Exception '${tree.exception}' requires exact-text review; no automatic downgrade. ${base.reason}` };
  }
  const left = evaluate(tree.left), right = evaluate(tree.right);
  const selected = tree.type === 'or'
    ? (LEVEL_ORDER[left.level] <= LEVEL_ORDER[right.level] ? left : right)
    : (LEVEL_ORDER[left.level] >= LEVEL_ORDER[right.level] ? left : right);
  return { level: selected.level, selectedLicense: tree.type === 'or' ? selected.selectedLicense : `(${left.selectedLicense} AND ${right.selectedLicense})`, reason: tree.type === 'or' ? `License choice: record the selected grant '${selected.selectedLicense}' and verify it covers this artifact. ${selected.reason}` : `Cumulative AND obligations apply. ${selected.reason}` };
}

export function validateAllowedLicenses(allowedLicenses) {
  if (allowedLicenses === undefined) return undefined;
  if (!Array.isArray(allowedLicenses) || !allowedLicenses.length || allowedLicenses.some(id => typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9.+-]*$/.test(id) || ['AND', 'OR', 'WITH', 'UNKNOWN', 'NONE', 'NOASSERTION'].includes(id.toUpperCase()))) {
    throw new Error('allowedLicenses must be a non-empty array of individual license identifiers');
  }
  return [...new Set(allowedLicenses.map(id => id.trim()))];
}

function policyMatch(tree, allowed) {
  if (tree.type === 'license') return ['UNKNOWN', 'NONE', 'NOASSERTION'].includes(tree.id) ? null : allowed.has(tree.id);
  if (tree.type === 'exception') return null;
  const a = policyMatch(tree.left, allowed), b = policyMatch(tree.right, allowed);
  if (tree.type === 'or') return a === true || b === true ? true : a === null || b === null ? null : false;
  return a === false || b === false ? false : a === null || b === null ? null : true;
}

function restrictChoices(tree, allowed) {
  if (tree.type === 'or') {
    const left = policyMatch(tree.left, allowed), right = policyMatch(tree.right, allowed);
    if (left === true && right !== true) return restrictChoices(tree.left, allowed);
    if (right === true && left !== true) return restrictChoices(tree.right, allowed);
  }
  if (tree.type === 'or' || tree.type === 'and') return { ...tree, left: restrictChoices(tree.left, allowed), right: restrictChoices(tree.right, allowed) };
  return tree;
}

export function classifyLicense(rawLicense, options = {}) {
  const license = normalizeLicense(rawLicense);
  const allowedList = validateAllowedLicenses(options.allowedLicenses);
  try {
    const tree = parseLicenseExpression(license);
    const allowed = allowedList && new Set(allowedList.map(id => id.toUpperCase()));
    const match = allowed ? policyMatch(tree, allowed) : null;
    const assessment = evaluate(allowed && match === true ? restrictChoices(tree, allowed) : tree);
    if (allowed && match === false) {
      return { license, ...assessment, level: LEVEL_ORDER[assessment.level] < LEVEL_ORDER.high ? 'high' : assessment.level, policyMatch: false, reason: `Does not match requested license allowlist (${allowedList.join(', ')}). ${assessment.reason}` };
    }
    return { license, ...assessment, policyMatch: match };
  } catch (error) {
    const fallback = classifySingle(license);
    return { license, level: fallback.level === 'allow' ? 'review' : fallback.level, policyMatch: null, reason: `Unparsed license declaration (${error.message}); verify the exact text. ${fallback.reason}` };
  }
}

export function isAtLeast(level, threshold) {
  if (!(threshold in LEVEL_ORDER)) throw new Error(`Unknown risk threshold: ${threshold}`);
  return (LEVEL_ORDER[level] ?? LEVEL_ORDER.review) >= LEVEL_ORDER[threshold];
}
