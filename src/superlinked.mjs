// Semantic license-clause search backed by Superlinked SIE (optional).
// Zero-dependency: uses the global fetch only. No generation model is used.
// The API key is read from the environment only (SUPERLINKED_API_KEY,
// falling back to SIE_API_KEY) and is never stored in a file.
// Without a key the search falls back to a local keyword scorer, so the
// `ask` command always works offline.
//
// Clause summaries below are copied from the license-checker corpus
// (~/workspace/license-checker/lib/licenses.ts) and are summaries only:
// they are not legal advice and do not invent obligations. Check the
// license text before relying on an answer.

export const EMBED_MODEL = 'BAAI/bge-m3';
export const SIE_BASE_URL_DEFAULT = 'https://api.superlinked.com';
export const MAX_QUERY_LENGTH = 500;
// 36 clauses + the query fit in a single embeddings call.
export const MAX_EMBED_BATCH = 40;

const SUMMARIES = [
  {
    id: 'MIT',
    commercial: '상용 이용·판매·수정이 모두 가능합니다. 가장 관대한 라이선스. 저작권 표시만 지키면 상용 배포가 자유롭습니다.',
    source: '소스 공개 의무가 없습니다. 배포할 때는 저작권 표시와 라이선스 전문을 함께 포함해야 합니다.',
    notice: '저작권 표시와 라이선스 전문을 모든 복사본에 포함해야 합니다.',
    keywords: ['mit', '상용', '판매', '저작권 표시', '관대', 'commercial', 'sell'],
  },
  {
    id: 'Apache-2.0',
    commercial: '상용 이용·판매·수정이 가능합니다. 특허 허용이 명시돼 있어 상용에 많이 쓰입니다. MIT와 비슷하지만 특허 허용과 NOTICE 의무, 변경 표시가 추가된 관대한 라이선스입니다.',
    source: '소스 공개 의무가 없습니다. 배포할 때는 저작권 표시 유지, NOTICE 파일이 있으면 그대로 포함, 변경한 부분 표시가 필요합니다.',
    notice: '저작권 표시 유지 + NOTICE 파일 포함 + 변경 사실 표시가 필요합니다.',
    keywords: ['apache', '아파치', '특허', 'notice', '노티스', '상용', 'patent'],
  },
  {
    id: 'BSD-2-Clause',
    commercial: '상용 이용·판매·수정이 가능합니다. MIT와 비슷한 관대한 라이선스. 표시만 지키면 됩니다.',
    source: '소스 공개 의무가 없습니다. 배포할 때는 저작권 표시와 라이선스 전문, 면책 조항을 포함해야 합니다.',
    notice: '저작권 표시 + 라이선스 전문 + 면책 조항을 포함해야 합니다.',
    keywords: ['bsd', 'bsd-2', '상용', '저작권 표시'],
  },
  {
    id: 'BSD-3-Clause',
    commercial: '상용 이용·판매·수정이 가능합니다. BSD-2절에 원저작자 이름을 홍보에 쓰지 말 것이라는 조건이 추가된 관대한 라이선스입니다.',
    source: '소스 공개 의무가 없습니다. 배포할 때는 저작권 표시를 유지하고 원저작자나 기관 이름을 홍보에 쓰지 말아야 합니다.',
    notice: '저작권 표시 + 라이선스 전문을 포함해야 합니다.',
    keywords: ['bsd', 'bsd-3', '상용', '홍보', '저작권 표시', 'endorsement'],
  },
  {
    id: 'ISC',
    commercial: '상용 이용·판매·수정이 가능합니다. MIT를 더 짧게 다듬은 관대한 라이선스. 표시만 지키면 됩니다.',
    source: '소스 공개 의무가 없습니다. 배포할 때는 저작권 표시와 허가 문구를 포함해야 합니다.',
    notice: '저작권 표시 + 허가 문구를 포함해야 합니다.',
    keywords: ['isc', '상용', '저작권 표시'],
  },
  {
    id: 'GPL-2.0-only',
    commercial: '조건부 가능. 돈을 받고 파는 것 자체는 가능하지만, 배포하면 전체를 GPL-2.0으로 공개해야 합니다. 강한 카피레프트. 폐쇄형 배포와는 맞지 않습니다.',
    source: '배포하면 전체 소스를 공개해야 합니다. 결합한 전체 저작물을 GPL-2.0으로 배포하고, 소스 코드(또는 소스 제공 약속)를 함께 줘야 합니다.',
    notice: '저작권 표시 유지 + GPL 전문 포함 + 변경 사실 표시가 필요합니다.',
    keywords: ['gpl', 'gpl-2', '카피레프트', '소스 공개', 'copyleft', 'source', '배포'],
  },
  {
    id: 'GPL-3.0-only',
    commercial: '조건부 가능. 돈을 받고 파는 것 자체는 가능하지만, 배포하면 전체를 GPL-3.0으로 공개해야 합니다. GPL-2.0에 특허 허용과 설치 정보 의무가 추가된 강한 카피레프트입니다. 폐쇄형 배포와는 맞지 않습니다.',
    source: '배포하면 전체 소스를 공개해야 합니다. 결합한 전체 저작물을 GPL-3.0으로 배포하고 Corresponding Source를 함께 줘야 합니다. 사용자 제품에는 설치 정보도 함께 줘야 합니다.',
    notice: '저작권 표시 유지 + GPL 전문 포함 + 변경 사실 표시가 필요합니다.',
    keywords: ['gpl', 'gpl-3', '카피레프트', '소스 공개', 'copyleft', 'source', '배포', '특허'],
  },
  {
    id: 'LGPL-2.1-only',
    commercial: '조건부 가능. 상용 이용이 가능하지만, 라이브러리를 바꾸는 방식을 지켜야 합니다. 약한 카피레프트로, 내 프로그램 전체까지 공개하진 않아도 됩니다. 정적 연결은 주의하세요.',
    source: '라이브러리 수정분만 공개합니다. LGPL 라이브러리 자체는 LGPL로 남겨두고, 사용자가 라이브러리를 교체할 수 있게 해야 합니다(동적 연결 권장).',
    notice: '저작권 표시 유지 + LGPL 전문을 포함해야 합니다.',
    keywords: ['lgpl', 'lgpl-2', '라이브러리', '동적 연결', '소스 공개', 'library'],
  },
  {
    id: 'LGPL-3.0-only',
    commercial: '조건부 가능. 상용 이용이 가능하지만, 라이브러리를 바꾸는 방식을 지켜야 합니다. LGPL-2.1에 특허 허용이 추가된 약한 카피레프트입니다. 내 프로그램 전체 공개는 필요 없지만 연결 방식은 주의하세요.',
    source: '라이브러리 수정분만 공개합니다. LGPL 라이브러리 자체는 LGPL로 남겨두고, 사용자가 라이브러리를 교체할 수 있게 해야 합니다.',
    notice: '저작권 표시 유지 + LGPL 전문을 포함해야 합니다.',
    keywords: ['lgpl', 'lgpl-3', '라이브러리', '동적 연결', '소스 공개', 'library', '특허'],
  },
  {
    id: 'AGPL-3.0-only',
    commercial: '조건부 가능. 돈을 받고 쓰는 것 자체는 가능하지만, 네트워크로 제공하면 소스를 공개해야 합니다. SaaS로 제공하면 소스 공개 의무가 생깁니다.',
    source: '네트워크 제공 시 전체 소스를 공개해야 합니다. 네트워크로 서비스를 제공하면, 이용자가 소스를 받을 수 있게 해야 합니다. 배포하지 않고 내부에서만 쓰면 의무가 생기지 않습니다.',
    notice: '저작권 표시 유지 + AGPL 전문 포함 + 변경 사실 표시가 필요합니다.',
    keywords: ['agpl', 'saas', '네트워크', '서버', '소스 공개', 'network', 'source'],
  },
  {
    id: 'MPL-2.0',
    commercial: '상용 이용이 가능합니다. 수정한 MPL 파일만 공개하면 됩니다. 파일 단위 카피레프트로, 전체 공개는 필요 없습니다.',
    source: '수정한 MPL 파일의 소스만 공개합니다. MPL로 된 파일을 수정하면 그 파일의 소스를 MPL-2.0으로 공개해야 합니다.',
    notice: '저작권 표시 유지 + MPL 전문 포함 + 변경 사실 표시가 필요합니다.',
    keywords: ['mpl', '모질라', '파일', '수정', '소스 공개', 'file'],
  },
  {
    id: 'EPL-2.0',
    commercial: '상용 이용·배포가 가능합니다. 수정한 EPL 코드만 공개하면 됩니다. MPL과 비슷한 약한 카피레프트입니다.',
    source: '수정한 EPL 코드의 소스만 공개합니다. EPL 코드를 수정해 배포하면 그 수정분을 EPL-2.0으로 공개해야 합니다.',
    notice: '저작권 표시 유지 + EPL 전문을 포함해야 합니다.',
    keywords: ['epl', '이클립스', '수정', '소스 공개', 'file'],
  },
];

const KIND_LABELS = {
  commercial: '상용 이용',
  source: '소스 공개',
  notice: '고지 의무',
};

const KIND_KEYWORDS = {
  commercial: ['상용', 'commercial', '판매', 'sell', '배포', 'distribution'],
  source: ['소스', '공개', 'source', '배포', 'distribution', '네트워크', 'network'],
  notice: ['고지', '표시', 'notice', '저작권', 'copyright'],
};

export const CLAUSES = SUMMARIES.flatMap((entry) =>
  ['commercial', 'source', 'notice'].map((kind) => ({
    id: `${entry.id}:${kind}`,
    licenseId: entry.id,
    kind,
    title: `${entry.id} — ${KIND_LABELS[kind]}`,
    text: entry[kind],
    keywords: [...new Set([...entry.keywords, ...KIND_KEYWORDS[kind]])],
  })),
);

export function getSieConfig(env = process.env) {
  const apiKey = env.SUPERLINKED_API_KEY?.trim() || env.SIE_API_KEY?.trim() || '';
  return {
    apiKey,
    baseUrl: env.SIE_BASE_URL?.trim() || SIE_BASE_URL_DEFAULT,
    embedModel: EMBED_MODEL,
    available: apiKey.length > 0,
  };
}

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function validateQuery(query) {
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Usage: commercial-license-skill ask "<question>" [--json]');
  }
  if (query.trim().length > MAX_QUERY_LENGTH) {
    throw new Error(`Question must be ${MAX_QUERY_LENGTH} characters or fewer.`);
  }
  return query.trim();
}

function clauseSearchText(clause) {
  return `${clause.title} ${clause.text} ${clause.keywords.join(' ')}`.toLowerCase();
}

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/u)
    .filter((token) => token.length > 0);
}

// Intent words in the question favour the matching clause kind, so a
// "do I have to disclose source?" question ranks source clauses first
// instead of tying with the same license's commercial clause.
const KIND_INTENT_TOKENS = {
  commercial: ['상용', 'commercial', '판매', 'sell'],
  source: ['소스', '공개', 'source', 'disclosure'],
  notice: ['고지', '표시', 'notice', 'copyright', '저작권'],
};

function localSearch(query, topN) {
  const tokens = tokenize(query);
  const lowerQuery = query.toLowerCase();
  const scored = CLAUSES.map((clause, index) => {
    const haystack = clauseSearchText(clause);
    const hits = tokens.filter((token) => haystack.includes(token)).length;
    const intentBonus = KIND_INTENT_TOKENS[clause.kind].some((token) => lowerQuery.includes(token)) ? 0.5 : 0;
    return { clause, score: (tokens.length ? hits / tokens.length : 0) + intentBonus, index };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  // Scores are ordered by the raw keyword score, then clamped to 1 so the
  // local fallback reads on the same 0–1 scale as SIE cosine similarity.
  return scored.slice(0, topN).map(({ clause, score }) => ({ ...clause, score: Math.min(1, score) }));
}

export async function embedTexts(texts, { fetchImpl = globalThis.fetch, config = getSieConfig() } = {}) {
  if (!config.available) {
    throw new Error('SIE API key is not set. Set SUPERLINKED_API_KEY (or SIE_API_KEY) to use SIE embeddings.');
  }
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > MAX_EMBED_BATCH) {
    throw new Error(`embedTexts expects 1 to ${MAX_EMBED_BATCH} texts in one batch.`);
  }
  const response = await fetchImpl(`${config.baseUrl.replace(/\/$/, '')}/v1/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: config.embedModel, input: texts }),
  });
  if (!response.ok) {
    throw new Error(`SIE embeddings request failed: ${response.status}`);
  }
  const payload = await response.json();
  const vectors = payload?.data?.map((item) => item?.embedding);
  if (!Array.isArray(vectors) || vectors.length !== texts.length || vectors.some((vector) => !Array.isArray(vector))) {
    throw new Error('SIE embeddings response has an unexpected shape.');
  }
  return { vectors, usage: payload?.usage ?? null };
}

export async function searchClauses(query, { fetchImpl = globalThis.fetch, config = getSieConfig(), topN = 5 } = {}) {
  const trimmed = validateQuery(query);
  const limit = Math.max(1, Math.min(Number(topN) || 5, 10));
  if (!config.available) {
    return { mode: 'local', model: 'local-keyword', query: trimmed, results: localSearch(trimmed, limit), usage: null };
  }
  const texts = [trimmed, ...CLAUSES.map((clause) => `${clause.title}. ${clause.text}`)];
  const { vectors, usage } = await embedTexts(texts, { fetchImpl, config });
  const queryVector = vectors[0];
  const scored = CLAUSES.map((clause, index) => ({
    ...clause,
    score: cosineSimilarity(queryVector, vectors[index + 1]),
  }));
  scored.sort((a, b) => b.score - a.score);
  return { mode: 'sie', model: config.embedModel, query: trimmed, results: scored.slice(0, limit), usage };
}
