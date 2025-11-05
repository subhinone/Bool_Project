import React, { useState } from 'react';
import './Login.css';
import logo119 from '../assets/119_bool.png';
import { useNavigate } from 'react-router-dom';
import { login, saveToken } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailLocal: '', password: '' });
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
      : '';

    if (!email || !form.password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식을 입력해주세요. (예: user@fire.go.kr)');
        setIsLoading(false);
        return;
      }

      // API 유틸리티 함수 사용
      // 백엔드는 email과 password만 받음 (username 필드 사용하지 않음)
      const userData = await login({
        email: email.trim().toLowerCase(), // 완전한 이메일 주소 전송
        password: form.password,
      });

      // 토큰 저장 (백엔드는 access_token을 반환)
      if (userData.access_token) {
        saveToken(userData.access_token);
      }

      // 사용자 정보 저장 (백엔드는 station 객체 안에 정보를 반환)
      localStorage.setItem(
        'stationName',
        userData.station?.station_name || '소방서'
      );
      localStorage.setItem(
        'jurisdiction',
        userData.station?.jurisdiction || ''
      );
      localStorage.setItem('userId', userData.station?.id || '');

      console.log('로그인 성공:', userData);
      alert('로그인 성공!');
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 오류:', error);

      if (error.status === 0) {
        // 서버 연결 실패
        alert(
          '서버에 연결할 수 없습니다.\n' +
            '백엔드 서버가 실행 중인지 확인해주세요.\n'
        );
      } else if (error.status === 400) {
        // Validation 에러 (400 Bad Request)
        const errorMessages = error.data?.message || error.message;
        if (Array.isArray(errorMessages)) {
          alert('입력 오류:\n' + errorMessages.join('\n'));
        } else {
          alert(errorMessages || '입력한 정보를 확인해주세요.');
        }
      } else if (error.status === 401) {
        // 인증 실패
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        // 기타 오류
        alert(error.message || '로그인 중 오류가 발생했습니다.');
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
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="login-btn login-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
