# 🚀 Bool_Project (소방서 웹 대시보드) 설정 가이드

## 📋 개요

이 프로젝트는 소방서용 화재 신고 관리 웹 대시보드입니다.

---

## 🔧 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd Bool_Project
```

### 2. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 생성
cp src/.env.example src/.env

# 필요시 .env 파일 수정
nano src/.env
```

**src/.env**:
```env
# Backend API URL (NestJS)
VITE_API_BASE=http://localhost:3000/api
VITE_FILE_BASE=http://localhost:3000/
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면:
- **URL**: http://localhost:5173

---

## 🔗 백엔드 연동

### 백엔드 서버 실행 필수!

웹 앱을 사용하려면 **반드시 백엔드 서버가 실행 중이어야 합니다**.

```bash
# 백엔드 서버 실행 (별도 터미널)
cd ../bool_backend
npm run start:dev
```

백엔드 확인:
- **API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api-docs

---

## 📱 페이지 구조

### 1. 소방서 정보 페이지
- **경로**: `/`
- **설명**: 소방서 소개 및 안내 페이지

### 2. 회원가입 페이지
- **경로**: `/register`
- **설명**: 소방서 계정 생성
- **필수 정보**:
  - 소방서 코드 (예: FS-001)
  - 소방서 이름
  - 이메일 (반드시 @fire.go.kr 도메인)
  - 비밀번호
  - 관할 구역

### 3. 로그인 페이지
- **경로**: `/login`
- **설명**: 소방서 계정 로그인
- **입력**:
  - 이메일
  - 비밀번호

### 4. 대시보드
- **경로**: `/dashboard`
- **설명**: 화재 신고 관리 및 통계
- **기능**:
  - 활성 화재 신고 목록
  - 완료된 화재 신고 목록
  - 화재 상태 업데이트 (출동 중, 처리 완료)
  - 통계 확인

---

## 🔑 인증 흐름

### 1. 회원가입
1. `/register` 페이지로 이동
2. 소방서 정보 입력
3. 회원가입 버튼 클릭
4. 성공 시 로그인 페이지로 이동

### 2. 로그인
1. `/login` 페이지로 이동
2. 이메일, 비밀번호 입력
3. 로그인 버튼 클릭
4. 성공 시 JWT 토큰이 localStorage에 저장됨
5. 대시보드로 자동 이동

### 3. 로그아웃
- 토큰을 localStorage에서 제거
- 로그인 페이지로 이동

---

## 📊 데이터 구조

### 화재 신고 객체

```javascript
{
  id: 123,
  user_name: "홍길동",
  user_phone: "010-1234-5678",
  fire_type: "wildfire",        // 또는 "urban_fire"
  confidence: 0.92,              // AI 신뢰도 (0~1)
  address: "서울시 중구 명동",
  latitude: 37.5665,
  longitude: 126.9780,
  has_fire: true,
  has_smoke: true,
  status: "pending",             // "pending", "dispatched", "resolved"
  transmission_status: "success",
  created_at: "2025-01-01T12:00:00.000Z",
  annotated_image: "data:image/jpeg;base64,..."
}
```

### 상태 코드

- **pending**: 신고 접수됨, 처리 대기 중
- **dispatched**: 출동 중
- **resolved**: 처리 완료

---

## 🛠 사용 가능한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint
```

---

## 📁 프로젝트 구조

```
Bool_Project/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── Login.jsx       # 로그인
│   │   ├── FireStationRegister.jsx  # 회원가입
│   │   ├── DashBoard.jsx   # 대시보드
│   │   └── ...
│   ├── utils/
│   │   └── api.js          # API 통신 함수
│   ├── assets/             # 이미지, 아이콘 등
│   ├── .env                # 환경 변수 (Git 제외)
│   ├── App.jsx             # 메인 앱
│   └── main.jsx            # 진입점
├── index.html
├── package.json
├── vite.config.js
└── WEB_BACKEND_INTEGRATION.md  # API 연동 가이드
```

---

## 🔧 개발 가이드

### API 함수 사용

**파일**: `src/utils/api.js`

```javascript
import {
  login,
  registerFireStation,
  getActiveFires,
  getCompletedFires,
  completeFire,
  dispatchFire,
  getStatistics
} from '../utils/api';

// 로그인
const handleLogin = async () => {
  const response = await login({
    email: 'station@fire.go.kr',
    password: 'password123'
  });
  saveToken(response.access_token);
  localStorage.setItem('userInfo', JSON.stringify(response.station));
};

// 활성 화재 목록
const activeFires = await getActiveFires();

// 출동 중으로 상태 변경
await dispatchFire(fireId);

// 처리 완료로 상태 변경
await completeFire(fireId);

// 통계 조회
const stats = await getStatistics();
```

---

## ⚠️ 주의사항

### 1. 환경 변수
- `.env` 파일은 **절대 Git에 올리지 마세요**
- 대신 `.env.example`을 올리세요

### 2. CORS 이슈
백엔드에서 웹 앱의 URL(`http://localhost:5173`)을 허용해야 합니다.

이미 설정되어 있음:
```typescript
// bool_backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:5173',  // ✅
  ]
});
```

### 3. 토큰 만료
JWT 토큰은 7일 후 만료됩니다. 만료 시 다시 로그인 필요.

---

## 🐛 문제 해결

### "서버에 연결할 수 없습니다"
```
해결: 백엔드 서버가 실행 중인지 확인
cd bool_backend && npm run start:dev
```

### CORS 에러
```
해결: 백엔드의 CORS 설정 확인
bool_backend/src/main.ts에서 origin에 http://localhost:5173 추가
```

### 401 Unauthorized
```
해결:
1. 로그인 다시 하기
2. localStorage의 authToken 확인
3. 토큰 만료 여부 확인
```

---

## 📚 추가 문서

- **API 연동 가이드**: `WEB_BACKEND_INTEGRATION.md`
- **백엔드 API 명세**: `../bool_backend/API_SPECIFICATION.md`
- **Swagger UI**: http://localhost:3000/api-docs

---

## 🎯 향후 개발 계획

### 추가 기능
- [ ] 실시간 알림 (WebSocket)
- [ ] 화재 위치 지도 표시
- [ ] 신고 검색 및 필터링
- [ ] 소방서 정보 수정 기능
- [ ] 신고 내역 Excel 다운로드

### 개선 사항
- [ ] 반응형 디자인 개선
- [ ] 다크 모드 지원
- [ ] 접근성(A11y) 향상

---

## 📞 문제가 있나요?

- **백엔드 API 문제**: `bool_backend/API_SPECIFICATION.md` 참고
- **Git 관련**: `GIT_GUIDE.md` 참고
- **빠른 시작**: `QUICK_START.md` 참고

