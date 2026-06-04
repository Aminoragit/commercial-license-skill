# 🧼 commercial-license-skill

> 상업적으로 안전한 허용형 라이선스 필터링 및 대체재 추천을 지원하는 에이전트 스킬 및 CLI 도구입니다.

[![npm version](https://img.shields.io/npm/v/commercial-license-skill.svg?style=flat-square)](https://www.npmjs.com/package/commercial-license-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node Compatibility](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg?style=flat-square)](https://nodejs.org)

---

## 📦 설치 방법 (Installation)

CLI 도구를 전역 설치하려면:

```bash
npm install -g commercial-license-skill
```

대화형 마법사를 통해 에이전트 스킬로 등록하려면 (Claude Code, OpenAI Codex, Gemini CLI 등 지원):

```bash
npx commercial-license-skill install
```

---

## 🔍 사용 방법 (Usage)

프로젝트 내 카피레프트 라이선스 위험성을 검사하고 허용형 대체재를 검색하려면:

```bash
npx commercial-license-skill scan
```

---

## 📂 상세 문서 목록 (Documentation)

*   MCP 서버 연동 방법은 [docs/MCP_SETUP.ko.md](docs/MCP_SETUP.ko.md) 문서를 참고하세요.
*   패키지 빌드 및 배포 체크리스트는 [docs/PUBLISHING.ko.md](docs/PUBLISHING.ko.md) 문서를 참고하세요.
*   개발 로드맵 및 스태틱 아키텍처 상세는 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 문서를 참고하세요.
