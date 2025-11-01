import React, { useState } from "react";
import "./FireStationRegister.css";
import logo119 from "../assets/119_bool.png";
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

  // [수정] 1. handleSubmit을 'async' 함수로 변경
  const handleSubmit = async (e) => { 
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

    // [수정] 2. 서버 없이 테스트하기 위해, API 호출 '전'에 localStorage에 저장
    localStorage.setItem("stationName", payload.district); // '근무 관할지'를 'stationName'으로 저장
    localStorage.setItem("district", payload.district);   // '근무 관할지'를 'district'로도 저장

    // [수정] 3. console.log 대신 모달에 표시될 정보를 'district' 기준으로 설정
    setSubmitted({
      stationName: payload.district, // 모달에도 '근무 관할지' 표시
      email,
    });
    
    // [수정] 4. 서버 통신 로직 추가
    try {
      // 실제 백엔드 서버의 회원가입 엔드포인트 URL
      const API_URL = "http://localhost:3000/api/register"; 
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // payload 전송
      });

      if (response.ok) {
        // 서버 통신 성공 시 (실제 운영 환경)
        setModalOpen(true);
      } else {
        // 서버 통신 실패 시 (서버가 켜져있으나 오류 발생)
        console.warn("서버 응답 실패. (테스트 모드)");
        setModalOpen(true); // 테스트를 위해 모달 열기
      }
    } catch (error) {
      // 네트워크 오류 (서버가 꺼져있음)
      console.error("Registration Error (무시 가능):", error);
      setModalOpen(true); // 테스트를 위해 모달 열기
    }
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
        onPrimary={() => navigate("/Dashboard")}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}