# 🧼 ParasiteCleaner

> 상업적으로 안전한 허용형 라이선스 필터링 및 대체재 추천을 지원하는 Agent Skill, npm CLI, 그리고 MCP 서버입니다.

[![npm version](https://img.shields.io/npm/v/parasite-cleaner.svg?style=flat-square)](https://www.npmjs.com/package/parasite-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node Compatibility](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg?style=flat-square)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-cross--platform-lightgrey.svg?style=flat-square)](#)

---

**ParasiteCleaner**는 프로젝트 의존성을 검사하여 상업 배포 시 위험할 수 있는 카피레프트(Copyleft) 라이선스를 분류하고, 보다 안전한 허용형(Permissive) 라이선스 대체 패키지를 추천하는 개발 선별 도구입니다. **Agent Skill**, **npm CLI**, **stdio MCP 서버** 형태로 연동되어, Claude Code, OpenAI Codex, OpenClaw, Gemini CLI 등 다양한 AI 에이전트 및 CLI 환경에 호환됩니다.

> [!WARNING]
> **법률적 고지 (Disclaimer):** 이 도구는 법률 자문이 아닌 엔지니어링 선별 및 사전 위험 검토용 도구입니다. 의존성 내에 GPL, AGPL 등의 라이선스가 발견되었다고 해서 반드시 소스 전체의 공개 의무가 자동으로 귀결되지는 않으며, 실제 링킹 방식, SaaS 배포 모델, 시스템 격리 여부 등에 따라 결론이 달라질 수 있습니다. 정식 릴리스 전에 법무 검토를 병행할 것을 강력히 권장합니다.

---

## 🚀 주요 기능

*   **다양한 연동성**: 인터랙티브 설치 지원 및 에이전트 호환 스킬 디렉토리 자동 탐색.
*   **하이브리드 아키텍처**: CLI 커맨드라인 도구와 MCP 서버 모드를 동시에 지원.
*   **에이전트 스킬 통합**: Claude Code, Gemini CLI 등 프레임워크의 `.agents/skills` 경로를 감지하고 설치.
*   **보안 및 프라이버시**: 스캔 프로세스가 로컬에서만 실행되어 소스 코드가 외부 서버로 유출되지 않습니다.

---

## 📦 설치 방법

아래 명령어를 통해 대화형 프레임워크 탐색 및 설치 마법사를 실행할 수 있습니다:

```bash
npx parasite-cleaner install
```

> [!TIP]
> 조직 전체 배포나 일관된 버전 검토를 보증하려면 버전을 고정하여 설치하는 방식을 권장합니다:
> ```bash
> npx parasite-cleaner@0.1.0 install
> ```

### 고급 설치 옵션

*   **전역 설치** (선택한 프레임워크 에이전트에 일괄 등록):
    ```bash
    npx parasite-cleaner install --global --frameworks claude-code,codex,openclaw,hermes,gemini-cli,copilot
    ```
*   **프로젝트별 설치** (현재 디렉토리 전용 범용 스킬 폴더):
    ```bash
    npx parasite-cleaner install --project --frameworks universal
    ```
*   **설치 미리보기** (설치 예정 경로만 시뮬레이션):
    ```bash
    npx parasite-cleaner install --global --all --dry-run
    ```

---

## 🔍 프로젝트 스캔

프로젝트 내 의존성 및 라이선스 현황을 스캔하고 사람이 읽기 편한 형식으로 리포트를 보려면 다음과 같이 실행합니다:

```bash
npx parasite-cleaner scan . --format human
```

### CI/CD 연동 (JSON / SARIF)

CI 파이프라인이나 정적 검사 도구에 연동하여 검사를 자동화할 수 있습니다:

```bash
# 결과를 JSON 파일로 출력
npx parasite-cleaner scan . --format json --output .parasite-cleaner/report.json

# 위험 등급 high 이상일 시 빌드를 실패 처리하고 SARIF 포맷 리포트 생성
npx parasite-cleaner scan . --format sarif --output reports/parasite-cleaner.sarif --fail-on high
```

---

## ⚙️ MVP 탐지 범위

본 검사기는 다음 영역을 입체적으로 탐지합니다:

*   **npm**: `package.json`, `package-lock.json` 및 `node_modules/*/package.json` 파일의 라이선스 정보.
*   **Python**: `requirements.txt` 목록 및 로컬 `.dist-info/METADATA` 파일.
*   **Rust**: `Cargo.lock` 의존성 인벤토리.
*   **Go**: `go.mod` 의존성 인벤토리.
*   **로컬 파일**: `vendor/`, `third_party/`, `deps/` 등 관례적인 라이선스 선언 파일들.
*   **소스 코드 호출 패턴**: `require` / `import` 구문 분석 및 셸을 통한 Ghostscript, FFmpeg, ImageMagick 등 카피레프트 의심 시스템 실행파일 호출 흔적(`spawn` / `exec`).

> [!NOTE]
> 의존성 라이선스 메타데이터가 누락된 경우에는 안전하다고 가이드하지 않고 보수적으로 `review` 등급으로 표기합니다.

---

## ⚠️ 라이선스 위험 등급 분류

| 등급 | 대응 정책 | 대표 라이선스 예시 |
| :--- | :--- | :--- |
| **`allow`** | 허용형 라이선스 (대체로 안전) | MIT, Apache-2.0, BSD, ISC |
| **`review`** | 결합 방식 및 라이선스 세부 조항 재검토 필요 | MPL, EPL, CDDL, LGPL, UNKNOWN |
| **`high`** | 강한 카피레프트 라이선스 (소스 공개 위험성) | GPL |
| **`critical`** | 네트워크 서비스(SaaS) 공급 시 전면 소스 공개 가능성 | AGPL, SSPL, BUSL, Commons Clause, 커스텀 제한 등 |

---

## 🔌 Model Context Protocol (MCP) 서버 연동

표준 입출력(stdio) 기반의 MCP 서버를 구동하여 에이전트와 도구를 직접 통합합니다:

```bash
npx parasite-cleaner mcp
```

### 제공되는 도구 (Tools)

1.  `scan_project_licenses`
    *   **매개변수**: `{"root": "/절대경로/프로젝트", "includeDev": false}`
    *   **반환 내용**: 스캔된 의존성 목록, 매칭된 위험 등급, 유입 경로, 그리고 1차 대체제 목록.
2.  `recommend_permissive_alternatives`
    *   **매개변수**: `{"packageName": "대상패키지명", "online": false}`
    *   **반환 내용**: 내장 데이터베이스 또는 npm 레지스트리 검색 기반의 허용형 라이선스 대체 패키지 후보 정보.

상세 MCP 연동 설명은 [docs/MCP_SETUP.ko.md](docs/MCP_SETUP.ko.md) 문서를 참고하세요.

---

## 🛠️ CLI 명령어 목록

```text
parasite-cleaner install                  # 대화형으로 에이전트 스킬 폴더에 설치
parasite-cleaner uninstall                # 등록된 에이전트 스킬 제거
parasite-cleaner doctor                   # 로컬 에이전트 설정 및 실행 환경 점검
parasite-cleaner scan [path]              # 특정 디렉토리 내 라이선스 위험성 스캔
parasite-cleaner recommend <pkg> [--online] # 허용형 라이선스 대체 패키지 추천
parasite-cleaner mcp                      # MCP 서버 구동
```
*더 많은 옵션과 상세한 옵션은 `parasite-cleaner --help` 명령어로 확인할 수 있습니다.*

---

## 📂 지원 스킬 경로

| 프레임워크 에이전트 | 프로젝트 전용 경로 | 사용자 전역(Home) 경로 |
| :--- | :--- | :--- |
| **Claude Code** | `.claude/skills` | `~/.claude/skills` |
| **Codex** | `.agents/skills` | `~/.agents/skills` |
| **OpenClaw** | `skills` | `~/.openclaw/skills` |
| **Hermes Agent** | *(지원 안 함)* | `~/.hermes/skills` |
| **Gemini CLI** | `.gemini/skills` | `~/.gemini/skills` |
| **GitHub Copilot** | `.github/skills` | `~/.copilot/skills` |
| **범용 Fallback** | `.agents/skills` | `~/.agents/skills` |

---

## 🏷️ 배포 체크리스트

1.  `package.json` 및 `src/scan.mjs` 내의 `YOUR_GITHUB_ID` 플레이스홀더를 사용자의 GitHub ID로 수정합니다.
2.  로컬 테스트 및 패키지 번들 빌드 확인:
    ```bash
    npm test
    npm run pack:check
    ```
3.  npm 레지스트리 배포:
    ```bash
    npm login
    npm publish --access public
    ```

자세한 세부 배포 가이드는 [docs/PUBLISHING.ko.md](docs/PUBLISHING.ko.md)를 참고하세요.

---

## 🛡️ 클린룸(Clean-Room) 엔지니어링 원칙

*   **코드 세탁 금지**: 타사의 카피레프트(GPL 등) 라이브러리 코드를 기계적으로 재작성하여 MIT/Apache 라이선스로 변환하지 않습니다.
*   **블랙박스 구현**: 추천 대체재 및 브릿지 코드 생성은 사용자 고유의 호출 파라미터, 공개 표준 API 사양 및 개발자가 직접 작성한 테스트 시나리오를 바탕으로 설계됩니다.
*   **엔지니어 검증 책임**: 추천 시스템은 단지 후보군을 선별할 뿐이며, 프로덕션 적용 전에 대상 패키지의 라이선스 조항과 하위 의존성을 법률적으로 재확인할 것을 의무화합니다.
