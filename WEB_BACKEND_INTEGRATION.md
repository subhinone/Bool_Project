# 🔗 웹 앱 - 백엔드 API 연동 가이드

## 📋 개요

Bool_Project (소방서 대시보드) 웹 앱이 NestJS 백엔드 API와 연동되었습니다.

---

## ✅ 변경 사항

### 1. API Base URL 변경

**이전**: `http://localhost:3001/bool`
**현재**: `http://localhost:3000/api`

**파일**: `src/.env`
```env
# Backend API URL (NestJS)
VITE_API_BASE=http://localhost:3000/api
VITE_FILE_BASE=http://localhost:3000/
```

---

### 2. API 엔드포인트 매핑

#### 🔐 인증 API

| 기능 | 이전 엔드포인트 | 현재 엔드포인트 | 메서드 |
|------|----------------|----------------|--------|
| 소방서 회원가입 | `/register` | `/auth/station/register` | POST |
| 소방서 로그인 | `/auth/login` | `/auth/station/login` | POST |
| 로그아웃 | `/logout` | 로컬에서 처리 | - |

**Request Body (회원가입)**:
```json
{
  "stationCode": "FS-001",
  "stationName": "서울중앙소방서",
  "email": "station@fire.go.kr",
  "password": "password123",
  "jurisdiction": "서울시 중구"
}
```

**Request Body (로그인)**:
```json
{
  "email": "station@fire.go.kr",
  "password": "password123"
}
```

**Response (로그인 성공)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "station": {
    "id": 1,
    "stationCode": "FS-001",
    "stationName": "서울중앙소방서"
  }
}
```

---

#### 🔥 화재 신고 API

| 기능 | 이전 엔드포인트 | 현재 엔드포인트 | 메서드 |
|------|----------------|----------------|--------|
| 활성 화재 목록 | `/fires/active` | `/station/reports` | GET |
| 완료 화재 목록 | `/fires/completed` | `/station/reports?status=resolved` | GET |
| 화재 상세 조회 | `/fires/:id` | `/reports/:id` | GET |
| 화재 상태 업데이트 | `/fires/:id/complete` | `/station/reports/:id/status` | PATCH |

**Response (신고 목록)**:
```json
{
  "reports": [
    {
      "id": 123,
      "user_id": 1,
      "user_name": "홍길동",
      "user_phone": "010-1234-5678",
      "fire_type": "wildfire",
      "confidence": 0.92,
      "address": "서울시 중구 명동",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "has_fire": true,
      "has_smoke": true,
      "status": "pending",
      "transmission_status": "success",
      "created_at": "2025-01-01T12:00:00.000Z",
      "annotated_image": "data:image/jpeg;base64,..."
    }
  ]
}
```

**Request Body (상태 업데이트)**:
```json
{
  "status": "dispatched"  // 또는 "resolved"
}
```

**Response (상태 업데이트 성공)**:
```json
{
  "message": "신고 상태가 업데이트되었습니다",
  "report_id": 123,
  "new_status": "dispatched"
}
```

---

#### 📊 통계 API

| 기능 | 이전 엔드포인트 | 현재 엔드포인트 | 메서드 |
|------|----------------|----------------|--------|
| 통계 조회 | 없음 (새로 추가) | `/station/statistics` | GET |

**Response (통계)**:
```json
{
  "total_reports": 150,
  "by_fire_type": {
    "wildfire": 80,
    "urban_fire": 70
  },
  "by_status": {
    "pending": 20,
    "dispatched": 30,
    "resolved": 100
  }
}
```

---

## 🔑 인증 처리

### JWT Token 사용

모든 소방서 API는 JWT 인증이 필요합니다.

**자동 처리됨** (src/utils/api.js):
```javascript
const token = localStorage.getItem("authToken");
if (token) {
  config.headers["Authorization"] = `Bearer ${token}`;
}
```

### 로그인 플로우

1. 사용자가 이메일/비밀번호 입력
2. `POST /api/auth/station/login` 호출
3. 응답으로 받은 `access_token`을 localStorage에 저장
4. 이후 모든 API 요청에 자동으로 토큰 포함

**코드 예시**:
```javascript
import { login, saveToken } from './utils/api';

const handleLogin = async (email, password) => {
  try {
    const response = await login({ email, password });

    // 토큰 저장
    saveToken(response.access_token);

    // 소방서 정보 저장 (선택)
    localStorage.setItem('userInfo', JSON.stringify(response.station));

    // 대시보드로 이동
    navigate('/dashboard');
  } catch (error) {
    console.error('로그인 실패:', error);
  }
};
```

---

## 📝 데이터 필드 매핑

### 화재 신고 객체

| 백엔드 필드 | 웹 앱 예상 필드 | 타입 | 설명 |
|------------|---------------|------|------|
| `id` | `id` | number | 신고 ID |
| `user_name` | `reporterName` | string | 신고자 이름 |
| `user_phone` | `reporterPhone` | string | 신고자 전화번호 |
| `fire_type` | `fireType` | string | 화재 유형 (wildfire/urban_fire) |
| `confidence` | `confidence` | number | AI 신뢰도 (0~1) |
| `address` | `address` | string | 주소 |
| `latitude` | `latitude` | number | 위도 |
| `longitude` | `longitude` | number | 경도 |
| `status` | `status` | string | 상태 (pending/dispatched/resolved) |
| `created_at` | `reportedAt` | string | 신고 시각 (ISO 8601) |
| `annotated_image` | `imageUrl` | string | AI 분석 이미지 (base64) |

---

## 🚀 실행 방법

### 1. 백엔드 서버 시작

```bash
cd /Users/leeyushin/BOOL/bool_backend
npm run start:dev
```

**확인**: http://localhost:3000/api

### 2. 웹 앱 시작

```bash
cd /Users/leeyushin/BOOL/Bool_Project
npm run dev
```

**확인**: http://localhost:5173

---

## 🔧 API 함수 사용 예시

### 로그인
```javascript
import { login, saveToken } from '../utils/api';

const handleLogin = async () => {
  const response = await login({
    email: 'station@fire.go.kr',
    password: 'password123'
  });
  saveToken(response.access_token);
};
```

### 활성 화재 목록 조회
```javascript
import { getActiveFires } from '../utils/api';

const loadActiveFires = async () => {
  const data = await getActiveFires();
  console.log(data.reports); // 활성 화재 배열
};
```

### 화재 상태 업데이트
```javascript
import { dispatchFire, completeFire } from '../utils/api';

// 출동 중으로 변경
const handleDispatch = async (fireId) => {
  await dispatchFire(fireId);
};

// 처리 완료로 변경
const handleComplete = async (fireId) => {
  await completeFire(fireId);
};
```

### 통계 조회
```javascript
import { getStatistics } from '../utils/api';

const loadStatistics = async () => {
  const stats = await getStatistics();
  console.log(stats.total_reports);
  console.log(stats.by_status);
};
```

---

## ⚠️ 주의사항

### 1. CORS 설정

백엔드에서 웹 앱의 URL을 허용해야 합니다.

**backend/src/main.ts**:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',  // React Web
    'http://localhost:5173',  // Vite 기본 포트 ⭐
  ],
  credentials: true,
});
```

### 2. 환경 변수

`.env` 파일은 Git에 올리지 마세요!

**Git에 올릴 것**: `.env.example`
```env
# Backend API URL (NestJS)
VITE_API_BASE=http://localhost:3000/api
VITE_FILE_BASE=http://localhost:3000/
```

**실제 사용**: `.env`
```env
VITE_API_BASE=http://localhost:3000/api
VITE_FILE_BASE=http://localhost:3000/
```

### 3. 토큰 만료

JWT 토큰은 7일 후 만료됩니다. 만료 시 다시 로그인 필요.

---

## 🐛 문제 해결

### CORS 에러
```
Access to fetch at 'http://localhost:3000/api/...' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**해결**: backend/src/main.ts의 CORS 설정에 `http://localhost:5173` 추가

---

### 401 Unauthorized
```
{
  "statusCode": 401,
  "message": "인증이 필요합니다"
}
```

**해결**:
1. 로그인 확인
2. localStorage에 토큰이 있는지 확인
3. 토큰이 만료되지 않았는지 확인

---

### 404 Not Found
```
{
  "statusCode": 404,
  "message": "Cannot GET /api/..."
}
```

**해결**: API 엔드포인트 경로 확인. Swagger 문서 참고:
- http://localhost:3000/api-docs

---

## 📚 추가 리소스

- **Backend API 명세**: `bool_backend/API_SPECIFICATION.md`
- **Swagger UI**: http://localhost:3000/api-docs
- **백엔드 README**: `bool_backend/README.md`

---

## 🔄 API 변경 사항 요약

### ✅ 연동 완료
- ✅ 소방서 회원가입
- ✅ 소방서 로그인
- ✅ 화재 신고 목록 조회 (활성/완료)
- ✅ 화재 상태 업데이트
- ✅ 통계 조회

### ⚠️ 추가 개발 필요 (백엔드)
- ⚠️ 소방서 프로필 조회 API
- ⚠️ 소방서 정보 업데이트 API
- ⚠️ 화재 신고 상세 조회 시 소방서 권한 확인

### 💡 권장 사항
1. 로그인 응답에 소방서 정보 포함 → localStorage 저장
2. 화재 신고 데이터에 이미지 URL 대신 base64 사용
3. 실시간 업데이트를 위한 WebSocket 고려

---

## 🎯 다음 단계

1. **테스트**
   - 백엔드 서버 실행
   - 웹 앱 실행
   - 로그인 테스트
   - 화재 목록 조회 테스트

2. **추가 기능**
   - 실시간 알림 (WebSocket)
   - 지도에 화재 위치 표시
   - 신고 검색/필터링

3. **배포**
   - 프로덕션 환경 변수 설정
   - API URL 변경 (배포 서버 주소)

