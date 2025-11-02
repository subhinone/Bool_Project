import React, { useState } from "react";
import "./Login.css";
import logo119 from "../assets/119_bool.png";
import { useNavigate } from "react-router-dom";
import { login, saveToken } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailLocal: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const emailLocal = form.emailLocal.trim();

    const email = form.emailLocal.trim()
      ? `${form.emailLocal.trim()}@fire.go.kr`
      : "";

    if (!email || !form.password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // API 유틸리티 함수 사용
      const userData = await login({
        username: emailLocal,
        password: form.password,
      });

      // 토큰 저장
      if (userData.accessToken) {
        saveToken(userData.token);
      }

      // 사용자 정보 저장
      localStorage.setItem("stationName", userData.stationName || "소방서");
      localStorage.setItem("district", userData.district || "");
      localStorage.setItem("userId", userData.id || "");

      console.log("로그인 성공:", userData);
      alert("로그인 성공!");
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 오류:", error);

      if (error.status === 0) {
        // 서버 연결 실패
        alert(
          "서버에 연결할 수 없습니다.\n" +
            "백엔드 서버가 실행 중인지 확인해주세요.\n" +
            "(http://localhost:3000)"
        );
      } else if (error.status === 401) {
        // 인증 실패
        alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        // 기타 오류
        alert(error.message || "로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <main className="login-card" role="main" aria-labelledby="login-title">
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
                disabled={isLoading}
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
              disabled={isLoading}
            />
          </label>

          <div className="login-actions">
            <button
              type="button"
              className="login-btn login-btn-ghost"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="login-btn login-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
