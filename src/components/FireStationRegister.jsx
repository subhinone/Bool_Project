import React, { useState } from "react";
import "./FireStationRegister.css";
import logo119 from "../assets/bool119logo.png";
import { useNavigate } from "react-router-dom";
import RegisterSuccessModal from "./RegisterSuccessModal";

export default function FireStationRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    orgCode: "",
    district: "",
    emailLocal: "",
    password: "",
    password2: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState({
    stationName: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyEmail = () => {
    alert("이메일 인증 안내를 보냈습니다. (데모)");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const email =
      form.emailLocal.trim() === ""
        ? ""
        : `${form.emailLocal.trim()}@fire.go.kr`;

    const payload = {
      orgCode: form.orgCode.trim(),
      district: form.district.trim(),
      email,
      password: form.password,
    };

    console.log("REGISTER ::", payload);

    setSubmitted({
      stationName: form.district.trim() || form.orgCode.trim(),
      email,
    });
    setModalOpen(true);
  };

  return (
    <div className="fsr-wrap">
      <main className="fsr-card" role="main" aria-labelledby="fsr-title">
        <img className="fsr-logo" src={logo119} alt="불119 로고" />
        <h1 id="fsr-title" className="fsr-title">
          소방서 등록하기
        </h1>
        <form className="fsr-form" onSubmit={handleSubmit}>
          <label className="fsr-field">
            <input
              className="fsr-input"
              type="text"
              name="orgCode"
              placeholder="소방서 기관 코드"
              value={form.orgCode}
              onChange={handleChange}
              required
            />
          </label>

          <label className="fsr-field">
            <input
              className="fsr-input"
              type="text"
              name="district"
              placeholder="근무 관할지"
              value={form.district}
              onChange={handleChange}
              required
            />
          </label>

          <div className="fsr-field">
            <div className="fsr-email-row">
              <div className="fsr-email-wrap">
                <input
                  className="fsr-input fsr-email-input"
                  type="text"
                  name="emailLocal"
                  placeholder="대표 이메일"
                  value={form.emailLocal}
                  onChange={handleChange}
                  aria-describedby="email-suffix"
                />
                <span id="email-suffix" className="fsr-email-suffix">
                  @fire.go.kr
                </span>
              </div>
              <button
                type="button"
                className="fsr-btn fsr-btn-verify"
                onClick={handleVerifyEmail}
              >
                인증
              </button>
            </div>
          </div>

          <label className="fsr-field">
            <input
              className="fsr-input"
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          <label className="fsr-field">
            <input
              className="fsr-input"
              type="password"
              name="password2"
              placeholder="비밀번호 확인"
              value={form.password2}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          <div className="fsr-actions">
            <button
              type="button"
              className="fsr-btn fsr-btn-ghost"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" className="fsr-btn fsr-btn-primary">
              등록하기
            </button>
          </div>
        </form>
      </main>

      <RegisterSuccessModal
        open={modalOpen}
        stationName={submitted.stationName}
        email={submitted.email}
        primaryText="대시보드로 이동"
        onPrimary={() => navigate("/")}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
