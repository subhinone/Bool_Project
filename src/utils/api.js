// src/utils/api.js
// 백엔드 API와 통신하기 위한 유틸리티 파일

// 백엔드 서버 주소 (환경에 따라 변경)
// NestJS Backend: http://localhost:3000/api
const API_BASE_URL =
  import.meta.env.VITE_API_BASE;

// API 요청을 위한 공통 함수
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // 저장된 토큰이 있으면 헤더에 추가
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // 응답이 JSON인지 확인
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || "요청 처리 중 오류가 발생했습니다.",
        data,
      };
    }

    return data;
  } catch (error) {
    // 네트워크 오류 또는 서버 연결 실패
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw {
        status: 0,
        message: "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.",
      };
    }
    throw error;
  }
};

// ==================== 인증 관련 API ====================

// 소방서 회원가입
// Backend: POST /api/auth/station/register
export const registerFireStation = async (formData) => {
  return apiRequest("/auth/station/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// 소방서 로그인
// Backend: POST /api/auth/station/login
export const login = async (credentials) => {
  return apiRequest("/auth/station/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// 로그아웃 (토큰 제거만 수행, 백엔드 엔드포인트 없음)
export const logout = async () => {
  removeToken();
  return { message: "로그아웃되었습니다" };
};

// ==================== 화재 신고 관련 API ====================

// 활성 화재 목록 조회 (pending, dispatched 상태)
// Backend: GET /api/station/reports?status=pending
export const getActiveFires = async (params = {}) => {
  // status가 없으면 pending과 dispatched 둘 다 가져오기 위해 status 파라미터 제외
  const queryParams = { ...params };
  if (!queryParams.status) {
    // 활성 화재는 pending 또는 dispatched 상태
    // 백엔드는 status 파라미터 없으면 모든 신고를 반환하므로, 프론트에서 필터링
    delete queryParams.status;
  }
  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = queryString
    ? `/station/reports?${queryString}`
    : "/station/reports";

  const response = await apiRequest(endpoint);

  // 활성 화재만 필터링 (pending, dispatched)
  if (response.reports) {
    response.reports = response.reports.filter(
      report => report.status === 'pending' || report.status === 'dispatched'
    );
  }

  return response;
};

// 처리 완료 화재 목록 조회
// Backend: GET /api/station/reports?status=resolved
export const getCompletedFires = async (params = {}) => {
  const queryParams = { ...params, status: 'resolved' };
  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = `/station/reports?${queryString}`;
  return apiRequest(endpoint);
};

// 특정 화재 정보 조회
// Backend: GET /api/reports/:id (JWT 필요)
export const getFireById = async (fireId) => {
  return apiRequest(`/reports/${fireId}`);
};

// 화재 상태 업데이트
// Backend: PATCH /api/station/reports/:id/status
export const updateFireStatus = async (fireId, status) => {
  return apiRequest(`/station/reports/${fireId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// 화재 처리 완료 (resolved로 상태 변경)
export const completeFire = async (fireId) => {
  return updateFireStatus(fireId, 'resolved');
};

// 화재 출동 중으로 변경 (dispatched로 상태 변경)
export const dispatchFire = async (fireId) => {
  return updateFireStatus(fireId, 'dispatched');
};

// ==================== 사용자 정보 관련 API ====================

// 현재 로그인한 소방서 정보 조회
// Note: 백엔드에 소방서 프로필 조회 API가 없으므로 로그인 응답에서 받은 정보 사용
// 또는 추가 API 개발 필요
export const getCurrentUser = async () => {
  // 임시: localStorage에서 사용자 정보 가져오기
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  throw new Error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
};

// 소방서 정보 업데이트
// Note: 백엔드에 소방서 정보 업데이트 API가 없으므로 추가 개발 필요
export const updateStationInfo = async (data) => {
  console.warn("소방서 정보 업데이트 API가 아직 구현되지 않았습니다.");
  throw new Error("이 기능은 아직 지원되지 않습니다.");
};

// ==================== 통계 관련 API ====================

// 화재 신고 통계 조회
// Backend: GET /api/station/statistics
export const getStatistics = async () => {
  return apiRequest("/station/statistics");
};

// ==================== 기타 유틸리티 ====================

// API 베이스 URL 가져오기 (디버깅용)
export const getApiBaseUrl = () => API_BASE_URL;

// 토큰 저장
export const saveToken = (token) => {
  localStorage.setItem("authToken", token);
};

// 토큰 제거
export const removeToken = () => {
  localStorage.removeItem("authToken");
};

// 토큰 확인
export const getToken = () => {
  return localStorage.getItem("authToken");
};
