# MCP 연결

로컬 체크아웃의 0.4.0 stdio 서버는 현재 작업 디렉터리와 `--allow-root`로 명시한 경로를 검사할 수 있습니다. 아직 게시하지 않은 기능을 사용하려면 기존 npm 배포본 대신 로컬 실행 파일의 절대 경로를 지정하세요.

```json
{
  "mcpServers": {
    "commercial-license-skill": {
      "command": "node",
      "args": ["/absolute/path/to/commercial-license-skill/bin/commercial-license-skill.mjs", "mcp", "--allow-root", "/absolute/path/to/project"]
    }
  }
}
```

Windows 경로는 JSON에서 `D:/projects/...` 또는 `D:\\projects\\...`로 표현할 수 있습니다. 클라이언트마다 설정 위치와 지원 형식이 다릅니다. 웹 채팅의 원격 MCP 연결에는 로컬 stdio 설정을 그대로 사용할 수 없습니다.

## 스캔 인자

도구 이름: `scan_project_licenses`

```json
{
  "path": "/absolute/path/to/project",
  "includeDev": true,
  "noSnippets": true,
  "allowedLicenses": ["MIT", "Apache-2.0"]
}
```

`path`가 실제 인자입니다. 생략하면 현재 디렉터리를 사용합니다. 다른 옵션을 생략하면 프로젝트 설정 파일을 적용합니다. 보고서에는 정책, 제외 목록, 부분 검사 경고, 선언 근거, 사용 위치와 후보의 검증 상태가 포함됩니다. 라이선스 조건이 맞지 않더라도 MCP 도구 호출 자체는 보고서를 반환하며, 판정은 `assessment`에서 확인합니다.

## 추천 인자

도구 이름: `recommend_permissive_alternatives`

```json
{
  "packageName": "imagemagick",
  "allowedLicenses": ["MIT"],
  "online": false
}
```

온라인 탐색을 사용하려면 `online: true`, 기능 검색어 `query`, 결과 수 `size`(1–30)를 지정할 수 있습니다. 검색어만 공개 npm 레지스트리로 전송합니다. 검색 결과는 메타데이터 수준의 후보이며 실제 교체를 승인한 결과가 아닙니다.

잘못된 타입·필수 인자 누락·미지원 인자는 `-32602` 오류로 반환합니다. 루트 허용 여부는 실제 경로로 확인하므로 외부 경로로 향하는 프로젝트 루트 링크가 단순 문자열 경로 검사로 우회되지 않습니다. 다만 이 서버는 OS 샌드박스가 아니므로 신뢰할 수 있는 로컬 프로젝트에서 실행하세요.

## 확인

MCP 클라이언트에서 초기화 후 `tools/list`로 두 도구를 확인하고 작은 검토용 프로젝트를 호출합니다. 서버 stdout은 JSON-RPC 메시지 전용입니다. 코드 수준 테스트는 `npm test`에 포함되며, 사용자별 호스트 설정·계정·승인은 별도 확인이 필요합니다.
