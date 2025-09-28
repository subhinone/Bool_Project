import React from "react";
import { useNavigate } from "react-router-dom";
import "./FireStationInfo.css";
import logo119 from "../assets/bool119logo.png";
import fireBg from "../assets/fire-icon.png";

const Step = ({ icon, label }) => (
  <div className="fs-step">
    <div className="fs-step-icon">{icon}</div>
    <div className="fs-step-label">{label}</div>
  </div>
);

export default function FireStationInfo() {
  const Navigate = useNavigate();

  return (
    <div className="fs-wrap">
      <main className="fs-card" role="main">
        <img className="fs-logo" src={logo119} alt="불119 로고" />

        <h1 className="fs-title">소방서를 등록해주세요</h1>

        <p className="fs-desc">
          등록된 소방서는 화재 애플리케이션과 연결되어 <br />
          실시간으로 산불 정보를 확인할 수 있습니다.
        </p>

        <div className="fs-steps">
          <Step
            label="기관 정보 입력"
            icon={
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="3"
                  width="16"
                  height="18"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M4 19h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            }
          />
          <div className="fs-step-connector" aria-hidden="true" />
          <Step
            label="대표 이메일 인증"
            icon={
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                aria-hidden="true"
              >
                <path
                  d="M3 7l9 6 9-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M9.5 16l2 2 3.5-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            }
          />
          <div className="fs-step-connector" aria-hidden="true" />
          <Step
            label="등록 완료"
            icon={
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 12.5l2.5 2.5L16 9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            }
          />
        </div>

        <button
          type="button"
          className="fs-cta"
          onClick={() => Navigate("/register")}
          aria-label="소방서 등록 페이지로 이동"
        >
          소방서 등록 &gt;
        </button>
      </main>
    </div>
  );
}
