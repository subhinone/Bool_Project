import React, { useState } from "react";
import "./Login.css";
import logo119 from "../assets/bool119logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailLocal: "", password: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const email = form.emailLocal.trim()
      ? `${form.emailLocal.trim()}@fire.go.kr`
      : "";
    console.log("LOGIN ::", { email, password: form.password });
    navigate("/dashboard");
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
