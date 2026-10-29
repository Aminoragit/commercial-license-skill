# npm 배포 체크리스트

## 1. 로컬 버전과 배포본 구분

현재 0.4.0은 미배포 개발 버전입니다. README의 새 옵션을 이전 npm 배포본으로 테스트하지 마세요. 이 문서는 배포 절차 설명이며 배포 권한을 자동으로 부여하지 않습니다.

공개 npm 레지스트리에서 `commercial-license-skill` 이름 사용 가능 여부를 배포 직전에 확인합니다. 이미 사용 중이면 scope를 사용합니다.

```json
{
  "name": "@YOUR_NPM_SCOPE/commercial-license-skill"
}
```

## 2. 저장소와 메타데이터 확인

다음 파일의 저장소 주소가 실제 배포 대상과 일치하는지 확인합니다. 기존 `Aminoragit` 값을 임의의 placeholder로 간주해 바꾸지 않습니다.

- `package.json`
- `src/scan.mjs`
- `.claude-plugin/plugin.json`

## 3. 검증

```bash
npm test
npm run docs:check
npm run pack:check
node ./bin/commercial-license-skill.mjs install --project --frameworks universal --dry-run
node ./bin/commercial-license-skill.mjs scan ./test/fixtures/node-risk --format human --no-snippets --allowed-licenses MIT
```

패키지의 버전·스킬 메타데이터·플러그인 메타데이터를 함께 맞추고, tarball 안에 실행 파일·src·스킬 참조 문서·README 이미지가 포함되는지 확인합니다. 테스트 fixture와 로컬 검증 산출물은 배포하지 않습니다. 자세한 검증 범위는 [검토 기록](REVIEW.md)을 참고하세요.

## 4. 권한이 있는 릴리스 담당자의 배포

```bash
npm login
npm publish --access public
```

scope를 사용한다면 다음처럼 실행합니다.

```bash
npm publish --access public
npx @YOUR_NPM_SCOPE/commercial-license-skill install
```

## 5. GitHub 릴리스 권장 항목

- `commercial-license-skill-<version>.tgz`
- SHA-256 체크섬
- 변경 이력
- 지원 프레임워크 표
- 법률 자문이 아닌 엔지니어링 선별 도구라는 고지


