import React, { useState } from "react";
import "./FireStationRegister.css";
import logo119 from "../assets/119_bool.png";
import { useNavigate } from "react-router-dom";
import RegisterSuccessModal from "./RegisterSuccessModal";
import { registerFireStation } from "../utils/api";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyEmail = () => {
    if (!form.emailLocal.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    alert("이메일 인증 안내를 보냈습니다. (데모)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (form.password !== form.password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    const email = form.emailLocal.trim()
      ? `${form.emailLocal.trim()}@fire.go.kr`
      : "";

    if (!form.orgCode.trim() || !form.district.trim() || !email) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const payload = {
      orgCode: form.orgCode.trim(),
      district: form.district.trim(),
      email,
      password: form.password,
    };

    setIsLoading(true);

    try {
      // API 유틸리티 함수 사용
      const result = await registerFireStation(payload);

      console.log("회원가입 성공:", result);

      // 성공 시 localStorage에 저장
      localStorage.setItem("stationName", payload.district);
      localStorage.setItem("district", payload.district);

      // 모달에 표시할 정보 설정
      setSubmitted({
        stationName: payload.district,
        email,
      });

      // 성공 모달 표시
      setModalOpen(true);
    } catch (error) {
      console.error("회원가입 오류:", error);

      if (error.status === 0) {
        // 서버 연결 실패
        alert(
          "서버에 연결할 수 없습니다.\n" +
            "백엔드 서버가 실행 중인지 확인해주세요.\n" +
            "(http://localhost:3000)\n\n" +
            "테스트를 위해 계속 진행하시겠습니까?"
        );

        // 테스트 모드: localStorage 저장 후 모달 표시
        localStorage.setItem("stationName", payload.district);
        localStorage.setItem("district", payload.district);
        setSubmitted({
          stationName: payload.district,
          email,
        });
        setModalOpen(true);
      } else if (error.status === 409) {
        // 이미 존재하는 이메일
        alert("이미 등록된 이메일입니다.");
      } else {
        // 기타 오류
        alert(error.message || "회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span id="email-suffix" className="fsr-email-suffix">
                  @fire.go.kr
                </span>
              </div>
              <button
                type="button"
                className="fsr-btn fsr-btn-verify"
                onClick={handleVerifyEmail}
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </label>

          <div className="fsr-actions">
            <button
              type="button"
              className="fsr-btn fsr-btn-ghost"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="fsr-btn fsr-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </main>

      <RegisterSuccessModal
        open={modalOpen}
        stationName={submitted.stationName}
        email={submitted.email}
        primaryText="대시보드로 이동"
        onPrimary={() => navigate("/dashboard")}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
