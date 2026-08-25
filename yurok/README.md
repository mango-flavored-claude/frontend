# 유록 프론트엔드 실행·배포 안내

React 19, TypeScript, Vite 기반의 유록 프론트엔드입니다. 화면 디자인과 스타일은 유지하면서 로컬 PC, GitHub Pages, 일반 정적 호스팅, Docker에서 같은 소스로 빌드되도록 설정되어 있습니다.

## 1. 개발 PC에서 실행

필수 환경은 Node.js 20.19 이상이며 Node.js 22 LTS를 권장합니다. 저장소 루트가 아니라 `yurok` 폴더에서 명령을 실행해야 합니다.

```bash
cd yurok
npm ci
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다. 같은 네트워크의 휴대폰이나 다른 PC에서도 확인하려면 아래 명령을 사용하고, 터미널에 표시되는 Network 주소로 접속합니다.

```bash
npm run dev:network
```

설치가 안 될 때는 먼저 `node --version`으로 버전을 확인하세요. `npm install` 대신 잠금 파일을 그대로 재현하는 `npm ci`를 사용합니다.

## 2. 환경변수

필요한 경우 `.env.example`을 `.env.local`로 복사해 값을 입력합니다. `.env.local`은 Git에 올라가지 않습니다.

```dotenv
VITE_API_URL=https://api.example.com
VITE_BASE_PATH=/
```

- `VITE_API_URL`: 백엔드 주소입니다. 빈 값이면 현재 프론트엔드와 같은 도메인의 `/api/...`를 사용합니다. 끝에 `/`는 붙이지 않습니다.
- `VITE_BASE_PATH`: 앱이 서비스될 URL 경로입니다. 루트 도메인은 `/`, 하위 경로는 `/frontend/`처럼 앞뒤 `/`를 포함합니다.

환경변수는 Vite 빌드 시 결과물에 포함됩니다. 값이 바뀌면 다시 빌드해야 합니다. 공개되면 안 되는 비밀키는 `VITE_` 변수에 넣으면 안 됩니다.

## 3. 빌드 확인

```bash
npm run check
npm run preview
```

성공하면 배포용 결과물이 `dist`에 생성됩니다. `dist/404.html`은 GitHub Pages의 하위 라우트 새로고침을, `dist/_redirects`는 Netlify와 Cloudflare Pages의 SPA 라우팅을 처리합니다.

대표 확인 주소:

- `/` — 메인 화면
- `/park/demo` — `src/routes/memorialPark` 화면
- `/intro/{초대키}` — 백엔드 API가 필요한 초대 화면

## 4. GitHub Pages 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 빌드·배포합니다.

1. GitHub 저장소의 **Settings → Pages → Source**를 **GitHub Actions**로 설정합니다.
2. 별도 백엔드를 사용하면 **Settings → Secrets and variables → Actions → Variables**에 `VITE_API_URL`을 등록합니다.
3. `main`에 push한 뒤 Actions의 `Deploy React App to GitHub Pages`가 성공했는지 확인합니다.

배포 경로는 저장소 이름에서 자동 계산되므로 저장소 이름이 바뀌어도 `/frontend/`를 코드에서 직접 수정할 필요가 없습니다.

## 5. 다른 정적 호스팅

도메인 루트에 배포하는 경우 기본 설정 그대로 빌드합니다.

```bash
npm ci
npm run build
```

`dist` 폴더 전체를 업로드합니다. Vercel은 `vercel.json`, Netlify와 Cloudflare Pages는 빌드 때 생성되는 `_redirects`를 사용합니다. 그 밖의 서버는 존재하지 않는 URL을 `index.html`로 돌려주는 SPA fallback을 설정해야 `/park/demo` 같은 주소를 새로고침해도 404가 나지 않습니다.

하위 경로에 올릴 때는 빌드 전에 경로를 지정합니다.

PowerShell:

```powershell
$env:VITE_BASE_PATH='/my-app/'
npm run build
```

macOS/Linux:

```bash
VITE_BASE_PATH=/my-app/ npm run build
```

하위 경로 빌드를 `npm run preview`로 확인할 때도 같은 `VITE_BASE_PATH` 값을 지정해야 합니다. 실제 배포 주소도 반드시 `/my-app/` 아래여야 합니다.

## 6. Docker로 실행

Node.js 설정이 없는 PC에서도 Docker만 있으면 실행할 수 있습니다.

```bash
docker build -t yurok-frontend .
docker run --rm -p 8080:80 yurok-frontend
```

백엔드 주소가 따로 있으면 빌드 인자로 전달합니다.

```bash
docker build --build-arg VITE_API_URL=https://api.example.com -t yurok-frontend .
```

접속 주소는 `http://localhost:8080`입니다. Docker 이미지는 도메인 루트(`/`) 배포용입니다.

## 배포 전 체크리스트

- `npm ci`와 `npm run check`가 깨끗한 환경에서 성공하는지 확인
- `VITE_API_URL`이 실제 HTTPS 백엔드 주소인지 확인
- 백엔드 CORS에 실제 프론트엔드 도메인이 허용되어 있는지 확인
- `/`, `/park/demo`, API가 필요한 초대 링크를 각각 직접 접속·새로고침해 확인
- `dist` 일부가 아니라 폴더 전체를 배포
