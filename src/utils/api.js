// src/utils/api.js
// 백엔드 API와 통신하기 위한 유틸리티 파일

// 백엔드 서버 주소 (환경에 따라 변경)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3001/bool";

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

// 회원가입
export const registerFireStation = async (formData) => {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// 로그인
export const login = async (credentials) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// 로그아웃
export const logout = async () => {
  return apiRequest("/logout", {
    method: "POST",
  });
};

// ==================== 화재 신고 관련 API ====================

// 활성 화재 목록 조회
export const getActiveFires = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `/fires/active?${queryString}`
    : "/fires/active";
  return apiRequest(endpoint);
};

// 처리 완료 화재 목록 조회
export const getCompletedFires = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `/fires/completed?${queryString}`
    : "/fires/completed";
  return apiRequest(endpoint);
};

// 특정 화재 정보 조회
export const getFireById = async (fireId) => {
  return apiRequest(`/fires/${fireId}`);
};

// 화재 처리 완료 처리
export const completeFire = async (fireId) => {
  return apiRequest(`/fires/${fireId}/complete`, {
    method: "PATCH",
  });
};

// ==================== 사용자 정보 관련 API ====================

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = async () => {
  return apiRequest("/user/me");
};

// 소방서 정보 업데이트
export const updateStationInfo = async (data) => {
  return apiRequest("/user/station", {
    method: "PUT",
    body: JSON.stringify(data),
  });
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
