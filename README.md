# BOOL 웹 대시보드 (소방서용)

소방서 관리자를 위한 화재 신고 관리 웹 대시보드입니다.

## 🌐 기술 스택

- React 19.1.1
- Vite 7.1.7
- React Router DOM 7.9.3
- CSS Modules

## 🚀 설치 및 실행

### 1. 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 2. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd Bool_pj/web
npm install
```

### 3. 환경 변수 설정 ⚠️ 중요!

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# AWS 클라우드 서버
VITE_API_BASE=http://13.125.225.201:3000/api
VITE_FILE_BASE=http://13.125.225.201:3000/
```

또는 `.env.example` 파일을 복사하세요:

```bash
cp .env.example .env
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 Vite가 알려주는 주소)로 접속

### 5. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📂 프로젝트 구조

```
web/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # 소방서 로그인
│   │   ├── FireStationRegister.jsx # 소방서 회원가입
│   │   ├── DashBoard.jsx          # 메인 대시보드
│   │   ├── FireStationInfo.jsx    # 화재 신고 상세
│   │   └── CompleteModal.jsx      # 완료 모달
│   ├── utils/
│   │   └── api.js                 # API 통신 유틸리티 ⚠️
│   ├── App.jsx                    # 라우터 설정
│   └── main.jsx                   # 앱 엔트리 포인트
├── .env                           # 환경 변수 ⚠️
└── vite.config.js                 # Vite 설정
```

## 🔧 주요 기능

### 소방서 관리자 기능

1. **로그인/회원가입**
   - 소방서 계정 생성 및 로그인
   - JWT 기반 인증

2. **대시보드**
   - 실시간 화재 신고 목록 (pending, dispatched)
   - 처리 완료된 신고 내역 (resolved)
   - 통계 정보

3. **신고 관리**
   - 신고 상세 정보 조회
   - 상태 변경 (pending → dispatched → resolved)
   - 출동 중/처리 완료 처리

## 🐛 문제 해결

### "서버에 연결할 수 없습니다" 오류

1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 API 주소가 올바른지 확인
3. 브라우저 콘솔에서 네트워크 에러 확인

### 환경 변수 변경이 적용되지 않을 때

Vite 개발 서버를 재시작하세요:

```bash
# Ctrl+C로 중지 후
npm run dev
```

### CORS 에러

백엔드에서 웹 도메인을 CORS 허용 목록에 추가해야 합니다.

### 빌드 오류

캐시를 정리하고 재빌드:

```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📡 API 연동

### API 베이스 URL 확인

개발자 도구 콘솔에서:

```javascript
console.log(import.meta.env.VITE_API_BASE)
```

### API 테스트

```javascript
fetch('http://13.125.225.201:3000/api')
  .then(r => r.text())
  .then(console.log)
```

## 🔐 인증

- JWT 토큰을 localStorage에 저장
- 토큰은 자동으로 API 요청 헤더에 포함됨
- 토큰 만료 시 자동 로그아웃

## 📚 관련 문서

- 백엔드 API: `../backend/README.md`
- API 문서 (Swagger): `http://13.125.225.201:3000/api-docs`
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)

## 🚀 배포

### Netlify / Vercel

1. GitHub에 푸시
2. Netlify/Vercel에 프로젝트 연결
3. 환경 변수 설정:
   - `VITE_API_BASE`
   - `VITE_FILE_BASE`
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 직접 배포

```bash
npm run build
# dist 폴더를 웹 서버에 업로드
```

## 🔒 보안

- 프로덕션 환경에서는 HTTPS 사용 권장
- API 키나 민감한 정보를 `.env`에 저장하지 마세요
- `.env` 파일은 Git에 커밋되지 않습니다 (.gitignore)

## 🤝 기여

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다
