# MCP 연결 예시

ParasiteCleaner는 표준 입출력(stdio) MCP 서버로 실행됩니다.

```bash
npx -y commercial-license-skill mcp
```

MCP 클라이언트의 서버 설정에 아래와 같은 항목을 추가합니다. 클라이언트마다 설정 파일 위치와 최상위 키 이름은 다를 수 있습니다.

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

로컬에서 수정 중인 패키지를 직접 연결할 때에는 `npx` 대신 Node.js로 진입점을 실행할 수 있습니다.

```json
{
  "mcpServers": {
    "commercial-license-skill-local": {
      "command": "node",
      "args": ["/absolute/path/to/commercial-license-skill/bin/commercial-license-skill.mjs", "mcp"]
    }
  }
}
```

## 제공 도구

### `scan_project_licenses`

인자:

```json
{
  "root": "/absolute/path/to/project",
  "includeDev": false
}
```

프로젝트 의존성, 라이선스 등급, 감지 출처, 사용 위치, 알려진 대체 후보를 반환합니다.

### `recommend_permissive_alternatives`

인자:

```json
{
  "packageName": "some-package",
  "online": false
}
```

내장 카탈로그 또는 선택적으로 공개 npm 레지스트리를 사용하여 허용형 라이선스 대체 후보를 반환합니다.

