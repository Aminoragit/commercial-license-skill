# 🧼 commercial-license-skill

> 상업적으로 안전한 허용형 라이선스 필터링 및 대체재 추천을 지원하는 에이전트 스킬 및 CLI 도구입니다.

[![npm version](https://img.shields.io/npm/v/commercial-license-skill.svg?style=flat-square)](https://www.npmjs.com/package/commercial-license-skill)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)
[![Node Compatibility](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg?style=flat-square)](https://nodejs.org)

`commercial-license-skill`은 소프트웨어 프로젝트의 의존성 목록을 분석하여 카피레프트 및 상업적 사용이 제한된 라이선스(GPL, AGPL, SSPL 등)를 탐지하고, 상업적으로 안전한 허용형 대체재(MIT, Apache-2.0, BSD 등)를 제안합니다. 이 도구는 **npm CLI**, **Model Context Protocol (MCP) 서버**, 그리고 AI 코딩 어시스턴트를 위한 **휴대용 에이전트 스킬 (Agent Skill)**로 동작합니다.

> [!NOTE]
> 이 프로젝트는 **Zero-Dependency**로 설계되었습니다. 속도, 보안성 및 가벼운 설치 용량을 위해 Node.js의 내장 API만을 활용합니다.

---

## 📦 설치 방법 (Installation)

CLI 도구를 전역 설치하려면:

```bash
npm install -g commercial-license-skill
```

대화형 마법사를 통해 에이전트 스킬로 등록하려면 (Claude Code, OpenAI Codex, Gemini CLI, GitHub Copilot 등 지원):

```bash
npx commercial-license-skill install
```

---

## 🔍 사용 방법 (Usage)

프로젝트 내 카피레프트 라이선스 위험성을 검사하고 허용형 대체재를 검색하려면:

```bash
npx commercial-license-skill scan
```

![commercial-license-skill CLI scan screenshot](commercial_license_skill_tui.png)

### 별칭 (Alias): `leechshield`

`leechshield`는 `commercial-license-skill`을 보다 간편하게 입력할 수 있는 단축 별칭입니다. GPL/AGPL의 전염성 독소 조항 및 소스 코드 공개 의무로부터 내 코드를 차단(shield)하여 보호한다는 의미에서 명명되었습니다.

```bash
leechshield scan .
# commercial-license-skill scan . 명령과 동일하게 동작합니다.
```

---

## ⚙️ CLI 레퍼런스 (CLI Reference)

### `scan [path]`
지정한 경로 이하의 의존성 라이선스를 스캔합니다.

| 플래그 | 기본값 | 설명 |
| :--- | :--- | :--- |
| `--format` | `human` | 출력 형식: `human` \| `json` \| `sarif` |
| `--output` | stdout | 스캔 보고서를 파일로 직접 저장 |
| `--include-dev` | `false` | 개발 의존성(devDependencies)도 함께 스캔할지 여부 |
| `--fail-on` | `null` | 위험도가 지정 수준 이상일 경우 프로세스 종료 코드 2 반환: `review` \| `high` \| `critical` |
| `--ignore` | `null` | 스캔에서 제외할 패키지 이름을 쉼표(,)로 구분하여 입력 |

### `recommend <package>`
지정한 패키지의 허용형 대체재를 추천합니다.

| 플래그 | 기본값 | 설명 |
| :--- | :--- | :--- |
| `--online` | `false` | npm 레지스트리를 실시간으로 쿼리하여 추천 후보군을 탐색 |
| `--json` | `false` | 추천 결과를 JSON 형태로 출력 |

### `mcp`
Claude Desktop 및 Claude Code 연동을 위한 stdio 기반 MCP 서버를 실행합니다.

### `install`
에이전트 스킬 등록을 위한 대화형 설치 프로그램을 시작합니다.

---

## 📊 지원 에코시스템 및 개발 상태

| 에코시스템 | 분석 대상 파일 | 상태 |
| :--- | :--- | :--- |
| **Node.js (npm)** | `package.json` / `package-lock.json` | ✅ 지원함 |
| **Python** | `requirements.txt` / `requirements-dev.txt` | ✅ 지원함 |
| **Rust (Cargo)** | `Cargo.lock` | ✅ 지원함 |
| **Go** | `go.mod` | ✅ 지원함 |
| **Node.js (pnpm)** | `pnpm-lock.yaml` | 🚧 예정 |
| **Node.js (yarn)** | `yarn.lock` | 🚧 예정 |
| **Python (uv)** | `uv.lock` | 🚧 예정 |

---

## 📄 출력 형식 예시 (Output Examples)

### `human` (기본값)
```text
CommercialLicenseSkill — commercial-safe dependency triage
Root: /path/to/project
Summary: 142 dependencies | critical 1 | high 1 | review 0 | allow 140

✗ [CRITICAL] npm:lodash-gpl@4.17.21 — GPL-3.0
  scope: runtime; source: package.json
  Strong copyleft license. Requires source-disclosure of combined works.
  usage: 2 source reference(s) found
    - src/index.js:5 [import] import _ from 'lodash-gpl';
  alternatives:
    - lodash (MIT) — Drop-in replacement with permissive terms.
```

### `json`
```json
{
  "schemaVersion": "1.0",
  "tool": "commercial-license-skill",
  "generatedAt": "2026-06-04T12:00:00.000Z",
  "summary": {
    "total": 1,
    "allow": 0,
    "review": 0,
    "high": 0,
    "critical": 1
  },
  "dependencies": [
    {
      "ecosystem": "npm",
      "name": "lodash-gpl",
      "version": "4.17.21",
      "license": "GPL-3.0",
      "assessment": {
        "level": "critical",
        "reason": "Strong copyleft license. Requires source-disclosure of combined works."
      },
      "recommendations": [
        {
          "name": "lodash",
          "license": "MIT",
          "note": "Drop-in replacement with permissive terms."
        }
      ]
    }
  ]
}
```

### `sarif` (CI/CD 통합용)
```json
{
  "version": "2.1.0",
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "commercial-license-skill",
          "version": "0.3.0",
          "informationUri": "https://github.com/Aminoragit/commercial-license-skill"
        }
      },
      "results": [
        {
          "ruleId": "license-critical",
          "level": "error",
          "message": {
            "text": "lodash-gpl@4.17.21: GPL-3.0. Strong copyleft license. Requires source-disclosure of combined works."
          }
        }
      ]
    }
  ]
}
```

---

## 🚀 CI/CD 파이프라인 연동

GitHub Actions 워크플로우에 `commercial-license-skill`을 통합하여, 카피레프트 라이선스를 포함한 풀 리퀘스트를 차단할 수 있습니다.

```yaml
# .github/workflows/license-check.yml
name: License Compliance Check

on: [push, pull_request]

jobs:
  license-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Scan Dependencies
        run: npx commercial-license-skill scan . --format sarif --output results.sarif --fail-on high

      - name: Upload SARIF report
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

---

## 🛠️ MCP 서버 설정

Claude Desktop의 `claude_desktop_config.json`에 `commercial-license-skill`을 MCP 서버로 연동하는 예시입니다:

```json
{
  "mcpServers": {
    "commercial-license-skill": {
      "command": "npx",
      "args": ["-y", "commercial-license-skill", "mcp"]
    }
  }
}
```

보다 자세한 정보는 [docs/MCP_SETUP.ko.md](docs/MCP_SETUP.ko.md) 문서를 참고하세요.

---

## 🤝 기여 안내 (Contributing)

본 프로젝트는 커뮤니티 기여를 적극 환영합니다. 아래 규칙을 준수해 주세요:
- **Clean-room 재작성 규칙**을 준수해 주세요. (제한된 소스 코드를 복사하거나 역엔지니어링하여 작성하지 마세요.)
- 새로운 리졸버를 개발하는 경우 자동화 테스트 코드를 추가해야 합니다.
- 외부 라이브러리 의존성 없이 순수 Node.js 기능만 활용해 주십시오.

---

## 📄 라이선스 (License)

이 프로젝트는 Apache License 2.0 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하십시오.
