<p align="center">
  <img src="docs/assets/license-hero.png" alt="Commercial License Skill — 라이선스 문서와 돋보기, Know your licenses. Choose your terms." width="1200">
</p>

<h1 align="center">commercial-license-skill</h1>
<p align="center"><strong>라이선스 확인부터 대체재 선택까지.</strong><br>AI 코딩 어시스턴트를 위한 근거 중심 라이선스 검토·대체 후보 탐색 스킬</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-9fe5ce?style=flat-square" alt="Apache-2.0 라이선스"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-9fe5ce?style=flat-square" alt="Node.js 18.17 이상"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-9fe5ce?style=flat-square" alt="런타임 의존성 0개"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/0.4.0-unreleased-f2c078?style=flat-square" alt="0.4.0 미배포 개발 버전"></a>
</p>

<p align="center">
  <a href="README.md">English</a> · 한국어<br>
  <a href="#빠른-시작">빠른 시작</a> · <a href="#원하는-조건-설정">조건 설정</a> · <a href="#ai-어시스턴트에서-사용">플랫폼 연동</a> · <a href="#지원-범위와-한계">지원 범위</a> · <a href="docs/REVIEW.md">적대적 검토 기록</a>
</p>

프로젝트의 라이브러리와 구성 요소가 어떤 라이선스를 사용하는지 확인하고, **상업적 이용·소스 공개·배포 조건**에 맞춰 대체 후보를 조사합니다. 하나의 **에이전트 스킬**, **로컬 CLI**, **stdio MCP 서버**가 같은 검토 원칙을 사용합니다.

> [!IMPORTANT]
> **상업적 이용 가능 여부와 소스를 비공개로 유지할 수 있는지는 별개의 질문입니다.** GPL·AGPL도 상업적 이용을 허용할 수 있습니다. 실제 의무는 선택한 이용 허락, 수정, 결합, 배포 방식에 따라 검토해야 합니다. 이 도구는 법적 적합성을 인증하지 않습니다.

## 무엇을 할 수 있나요?

| 식별 | 조건 비교 | 대안 검토 |
|---|---|---|
| 패키지·버전·라이선스 선언·근거 경로·사용 위치 | 허용 목록·SPDX 분기·공개 의무의 발생 조건·미확인 사항 | 대체 후보·기능 차이·전이 의존성·이전 계획 |

- **원하는 라이선스 조건** — MIT만 허용하거나 MIT·Apache-2.0·BSD 계열로 범위를 지정합니다.
- **근거가 보이는 결과** — 누락·충돌·검토 제외 항목과 스캔 한계를 보고서에 남깁니다.
- **라이브러리 밖의 요소** — 폰트·아이콘·이미지·복사한 코드·모델·가중치·데이터셋은 스킬의 추가 검토 절차로 확인합니다.
- **기본은 로컬 실행** — 스캔 과정에서 패키지를 설치하거나 레지스트리에 접속하지 않습니다. 온라인 후보 탐색을 켜면 검색어만 npm으로 전송합니다.

## 빠른 시작

**Node.js 18.17 이상 · 별도의 의존성 설치 불필요.** 문서의 0.4.0 기능은 아직 배포하지 않은 개발 버전입니다. 아래처럼 저장소의 로컬 실행 파일을 사용하세요. 기존 npm 배포본은 동작과 옵션이 다를 수 있습니다.

```bash
git clone https://github.com/Aminoragit/commercial-license-skill.git
cd commercial-license-skill

# ../your-project를 검사할 프로젝트 경로로 바꾸세요.
node ./bin/commercial-license-skill.mjs scan ../your-project --format human

# 현재 작업 공간에 에이전트 스킬 설치
node ./bin/commercial-license-skill.mjs install --project --frameworks codex,claude-code,antigravity,gemini-cli --yes
```

`--dry-run`으로 설치 경로를 먼저 확인할 수 있습니다. 사용자 단위 설치는 `--global`을 사용합니다. 기존 스킬은 시간 정보가 붙은 폴더로 백업하고, 여러 플랫폼이 공유하는 경로에는 한 번만 복사합니다. `doctor --json`은 어댑터와 감지 정보를 보여주며 실제 플랫폼에서 로딩됐다는 뜻은 아닙니다.

이미 배포된 버전은 `npx commercial-license-skill help`로 지원 옵션을 확인하세요. 이번 변경은 npm 게시나 계정 연동 설정을 실행하지 않습니다.

## 원하는 조건 설정

```bash
# MIT·Apache-2.0만 허용. 미확인 항목부터 CI 실패 처리.
node ./bin/commercial-license-skill.mjs scan ../your-project --allowed-licenses MIT,Apache-2.0 --include-dev --no-snippets --fail-on review

# MIT 조건으로 내장 대체 후보 검색
node ./bin/commercial-license-skill.mjs recommend imagemagick --allowed-licenses MIT --json

# 필요한 기능을 검색어로 지정해 공개 npm 후보 탐색
node ./bin/commercial-license-skill.mjs recommend imagemagick --online --query "image processing" --allowed-licenses MIT --json
```

**검사 대상 프로젝트 루트**에 `commercial-license-skill.config.json`을 두어 조건을 저장할 수도 있습니다.

```json
{
  "allowedLicenses": ["MIT", "Apache-2.0", "BSD-3-Clause"],
  "includeDev": true,
  "noSnippets": true,
  "ignorePackages": []
}
```

명시한 CLI 옵션은 설정 파일보다 우선합니다. `OR`는 완전한 선택 분기 하나가, `AND`는 모든 항목이 조건에 맞아야 합니다. 예외·충돌·출처 미상은 검토 대상으로 남깁니다. 허용 목록은 메타데이터 조건이며, 소스 공개·고지·유료 이용권·배포 요건은 에이전트가 근거를 추가 조사합니다.

<p align="center">
  <img src="docs/assets/license-workflow.png" alt="구성 요소의 근거 확인, 라이선스 조건 선택, 대체 후보의 기능 적합성과 검증을 표현한 일러스트" width="1200">
  <br><sub>구성 요소 파악 → 조건 비교 → 검증한 후보 선택. AI로 생성한 콘셉트 일러스트이며 실제 제품 화면이 아닙니다.</sub>
</p>

## AI 어시스턴트에서 사용

진입점은 [`SKILL.md`](skills/commercial-license-skill/SKILL.md)입니다. 설치 후 다음처럼 요청할 수 있습니다.

```text
commercial-license-skill로 이 프로젝트의 라이선스를 검토해줘.
상업용 데스크톱 앱이고 우리 애플리케이션 소스는 비공개로 유지해야 해.
MIT, Apache-2.0, BSD-3-Clause만 허용해.
라이브러리, 네이티브 실행 파일, 폰트, 아이콘, 번들 자산도 포함해.
정확한 근거와 미확인 의무를 표시하고, 실제 사용 API를 충족하는 대체재를 비교해줘.
의존성을 변경하기 전에 후보의 검증 상태와 이전 작업량을 알려줘.
```

| 플랫폼 | 이 프로젝트의 연동 방식 |
|---|---|
| Codex | `--frameworks codex` → `.agents/skills/` |
| Claude Code | `--frameworks claude-code` → `.claude/skills/` |
| Antigravity / agy CLI | `--frameworks antigravity` → `.agents/skills/`; CLI 전용 전역 경로 사용 |
| Gemini CLI | `--frameworks gemini-cli` → `.gemini/skills/` |
| ChatGPT·Claude·Gemini 채팅 | 호스트가 제공하는 스킬·파일 가져오기 기능을 사용하거나 스킬과 근거 파일을 문맥으로 제공합니다. 파일·실행 접근 권한은 호스트에 따라 다릅니다. |
| OpenClaw·Hermes·GitHub Copilot | 추가 파일 시스템 어댑터 제공. [설치 경로와 기능 경계](skills/commercial-license-skill/references/framework-install-paths.md) 참고. |

어댑터 테스트는 경로·백업·중복 복사를 검사합니다. 모든 제품의 실제 로그인·실행 환경을 검증한 것은 아닙니다. 프로젝트나 셸에 접근할 수 없는 채팅에서는 제공한 자료 범위로 검토하고 그 한계를 명시합니다.

## 결과 읽기

| 등급 | 의미 | 다음 조치 |
|---|---|---|
| `allow` | 알려진 허용형 메타데이터가 적용 조건에 부합 | 실제 배포물의 허락과 고지 확인 |
| `review` | 미확인·모호한 선언, 파일·라이브러리 카피레프트, 예외 | 정확한 문구·권리·결합 방식 확인 |
| `high` | 카피레프트 검토 또는 사용자 허용 목록 불일치 | 준수·교체·제거 경로 검토 |
| `critical` | 서비스·네트워크·비상업·사용자 정의 조건 | 이용 허락과 보유 권리를 배포 전에 확인 |

`(MIT OR Apache-2.0) AND GPL-3.0-only`는 GPL 항목이 누적되므로 `high`입니다. `MIT OR GPL-3.0-only`는 해당 배포물에 MIT 선택권이 실제로 적용되는지 확인한 뒤 MIT를 선택할 수 있습니다. 사용 위치를 찾지 못했다고 미사용으로 단정하지 않습니다.

후보는 **`unverified`**(내장 목록) 또는 **`metadata-only`**(npm 검색)로 표시합니다. 저장소·배포물 라이선스, 유지보수, 전이 의존성과 API 호환성이 모두 검증됐다는 뜻이 아닙니다. 스킬은 호스트의 도구와 근거가 있으면 후속 검증을 수행합니다. 적합한 후보가 없다는 결론도 허용합니다.

## CLI와 MCP

<details>
<summary><strong>CLI 레퍼런스</strong> — 명령어·보고서·종료 코드</summary>

| 명령 | 용도 |
|---|---|
| `scan [path]` | 로컬 목록 수집. `--format human\|json\|sarif`, `--output file` 지원 |
| `recommend <package>` | 후보 필터. `--online --query "검색어"`로 npm 검색 추가 |
| `install` / `uninstall` | `--project` 또는 `--global`, `--frameworks`, `--dry-run` |
| `doctor --json` | 감지 정보와 지원 파일 시스템 어댑터 목록 |
| `mcp --allow-root <path>` | 현재 디렉터리와 추가 지정 경로를 허용한 stdio 서버 |

스캔 옵션: `--allowed-licenses`, `--include-dev`, `--ignore name1,name2`, `--no-snippets`, `--max-snippet-length`, `--fail-on review\|high\|critical`. `ignorePackages`는 승인된 라이선스가 아니라 검사 제외 항목입니다. JSON에 정책·범위·라이선스 선언·판정·사용 근거·후보가 포함됩니다.

종료 코드: **0** 실행 완료·설정한 실패 임계값 미도달, **1** 잘못된 입력·실행 오류, **2** `--fail-on` 임계값 도달. `--fail-on`이 없으면 발견 사항만으로 종료 코드를 바꾸지 않습니다. 미확인 라이선스도 막으려면 `review`를 사용하세요. `leechshield` 별칭도 유지됩니다.

```bash
node ./bin/commercial-license-skill.mjs scan ../your-project --format sarif --output reports/licenses.sarif --include-dev --no-snippets --fail-on review
```

</details>

MCP는 같은 라이선스 조건을 받는 `scan_project_licenses`, `recommend_permissive_alternatives`를 제공합니다. 저장소 실행 파일은 **절대 경로**로 지정하고 검사할 프로젝트를 허용 목록에 추가하세요.

```json
{
  "mcpServers": {
    "commercial-license-skill": {
      "command": "node",
      "args": ["/absolute/path/to/commercial-license-skill/bin/commercial-license-skill.mjs", "mcp", "--allow-root", "/absolute/path/to/your-project"]
    }
  }
}
```

클라이언트별 설정 위치와 지원 방식은 다릅니다. [MCP 연결 및 실제 도구 인자](docs/MCP_SETUP.ko.md)를 참고하세요. 로컬 stdio 서버와 원격 커넥터는 서로 다른 연결 방식입니다.

## 지원 범위와 한계

| 입력 | 로컬 스캐너가 처리하는 범위 |
|---|---|
| npm | 루트 `package.json`, v2/v3 `package-lock.json`, 제한된 깊이의 설치 메타데이터. 직접·개발·선택·peer 범위 |
| Python | 루트 requirements 파일과 로컬 `.dist-info/METADATA`; `License-Expression` 우선 |
| Rust / Go | 루트 `Cargo.lock`·`go.mod` 목록 수집. 라이선스는 별도 확인 전 `UNKNOWN` |
| 네이티브·벤더 코드 | 실행 명령의 휴리스틱 탐지와 vendor 경로의 라이선스 파일. 실제 빌드·출처 확인 필요 |
| 자산·모델·미지원 잠금 파일·워크스페이스·최종 배포물 | 에이전트의 추가 조사 필요. 전부 자동 검사하지 않음 |

소스 추적은 범위가 제한된 정규식 검색이며 전체 빌드·의존성 그래프가 아닙니다. pnpm·Yarn·uv·Poetry 잠금 파일은 해석하지 않습니다. 심볼릭 링크나 루트 밖 의존성도 별도 조사해야 합니다. 보고서는 항상 로컬 범위를 부분 검사로 표시합니다. 보고서 공유 전 `--no-snippets`로 소스 구문을 가릴 수 있습니다.

## 검증과 기여

```bash
npm test
npm run docs:check
npm run pack:check
```

[4회 적대적 검토 기록](docs/REVIEW.md)에 재현한 결함·수정·검증·남은 한계를 정리했습니다. [에이전트 평가 시나리오](skills/commercial-license-skill/evals/evals.json)는 수동 평가용 기준이며, 모든 모델이 통과했다는 의미는 아닙니다. 기여 시에는 일차 라이선스 근거, 실제 실패 사례, 관찰 가능한 동작을 검증하는 테스트를 포함해주세요.

[구조](docs/ARCHITECTURE.md) · [보안](SECURITY.md) · [배포](docs/PUBLISHING.ko.md) · [변경 이력](CHANGELOG.md)

## 디자인과 라이선스

[Ollama](https://github.com/ollama/ollama), [uv](https://github.com/astral-sh/uv), [bat](https://github.com/sharkdp/bat)의 시각적 헤더·빠른 시작·탐색·상세 정보 구성을 참고했습니다. 해당 프로젝트의 로고나 이미지를 재사용하지 않았습니다. [이미지 생성 프롬프트와 출처 기록](docs/assets/ARTWORK.md)에서 전용 비주얼의 제작 내용을 확인할 수 있습니다.

코드·문서·새로 생성한 일러스트는 보유한 권리의 범위에서 [Apache-2.0](LICENSE)으로 제공합니다. 검토 대상인 외부 구성 요소에는 각각의 라이선스가 적용됩니다.
