import React, { useState } from "react";
import "./Login.css";
import logo119 from "../assets/119_bool.png"; // <--- 이 부분은 올바르게 수정하셨네요!
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailLocal: "", password: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // [수정] onSubmit 함수를 'async'로 변경해야 await를 사용할 수 있습니다.
  const onSubmit = async (e) => {
    e.preventDefault();
    const email = form.emailLocal.trim()
      ? `${form.emailLocal.trim()}@fire.go.kr`
      : "";

    // [추가] API 요청에 필요한 payload 변수를 정의합니다. (기존 코드에 누락됨)
    const payload = { email, password: form.password };

    // --- [수정] 서버 통신 로직 (try...catch)을 onSubmit 함수 *내부*로 이동시켰습니다. ---
    try {
      // 실제 백엔드 서버의 로그인 엔드포인트 URL로 변경해야 합니다.
      const API_URL = "http://localhost:3000/api/login";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // [수정] 정의된 payload 사용
      });

      if (response.ok) {
        // 로그인 성공 처리
        const userData = await response.json();

        // [수정] API 응답에서 실제 데이터를 저장합니다. (기존 더미 코드 대체)
        localStorage.setItem("stationName", userData.stationName || "용인시 소방서");
        localStorage.setItem("authToken", userData.token); // 예: 토큰 저장

        console.log("Login Success. User Data/Token:", userData);
        alert("로그인 성공!");
        navigate("/dashboard");
      } else {
        // 인증 실패 (예: 비밀번호 불일치, 사용자 없음)
        const errorData = await response.json();
        alert(
          `로그인 실패: ${
            errorData.message || "이메일 또는 비밀번호를 확인해주세요."
          }`
        );
      }
    } catch (error) {
      // 네트워크 오류 처리
      console.error("Login Error:", error);
      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    // --- 서버 통신 로직 끝 ---
  }; // <--- [수정] onSubmit 함수가 여기서 닫힙니다. (기존 코드는 이 괄호가 잘못된 위치에 있었습니다)

  return (
    <div className="login-wrap">
      <main className="login-card" role="main" aria-labelledby="login-title">
        {/* 로고 경로가 올바르게 반영되었습니다. */}
        <img className="login-logo" src={logo119} alt="불119 로고" />

        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-field">
            <div className="login-email-wrap">
              <input
                className="login-input login-email-input"
                type="text"
                name="emailLocal"
                placeholder="이메일"
                value={form.emailLocal}
                onChange={onChange}
                aria-describedby="login-email-suffix"
              />
              <span id="login-email-suffix" className="login-email-suffix">
                @fire.go.kr
              </span>
            </div>
          </label>

          <label className="login-field">
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
            />
          </label>

          <div className="login-actions">
            <button
              type="button"
              className="login-btn login-btn-ghost"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" className="login-btn login-btn-primary">
              로그인
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}