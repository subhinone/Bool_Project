import React from "react";
import "./FireStationInfo.css";
import fireLogo from "../assets/fire-icon.png";
import Bool119Logo from "../assets/bool119logo.png";

const FireStationInfo = () => {
  return (
    <div className="register-container">
      <img src={Bool119Logo} alt="Bool 119" className="logo" />
      <h2>소방서를 등록해주세요</h2>
      <p>
        등록된 소방서는 화재 애플리케이션과 연결되어 <br />
        실시간으로 산불 정보를 확인할 수 있습니다.
      </p>

      <div className="steps">
        <div className="step">
          <img src={fireLogo} alt="기관" className="step-icon" />
          <p>기관 정보 입력</p>
        </div>
        <span className="arrow">—</span>
        <div className="step">
          <img src={fireLogo} alt="인증" className="step-icon" />
          <p>대표 이메일 인증</p>
        </div>
        <span className="arrow">—</span>
        <div className="step">
          <img src={fireLogo} alt="완료" className="step-icon" />
          <p>등록 완료</p>
        </div>
      </div>

      <button className="register-btn">소방서 등록 &gt;</button>
    </div>
  );
};

export default FireStationInfo;
