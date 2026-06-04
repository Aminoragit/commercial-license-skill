# npm 배포 체크리스트

## 1. 이름 확정

공개 npm 레지스트리에서 `commercial-license-skill` 이름 사용 가능 여부를 배포 직전에 확인합니다. 이미 사용 중이면 scope를 사용합니다.

```json
{
  "name": "@YOUR_NPM_SCOPE/commercial-license-skill"
}
```

## 2. 저장소 placeholder 교체

다음 두 파일의 `YOUR_GITHUB_ID`를 실제 GitHub ID 또는 조직명으로 교체합니다.

- `package.json`
- `src/scan.mjs`

## 3. 검증

```bash
npm test
npm run pack:check
node ./bin/commercial-license-skill.mjs install --project --frameworks universal --dry-run
node ./bin/commercial-license-skill.mjs scan ./test/fixtures/node-risk --format human
```

## 4. 배포

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

