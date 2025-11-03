import { useEffect } from 'react';
import './App.css';
import FireStationInfo from './components/FireStationInfo';
import FireStationRegister from './components/FirestationRegister';
import Login from './components/Login';
import DashBoard from './components/DashBoard';
import { Routes, Route } from 'react-router-dom';

function App() {
  useEffect(() => {
    // 카카오맵 스크립트 동적 로드
    // 환경 변수는 import.meta.env를 사용 (Vite) 또는 직접 키 입력
    const kakaoMapKey =
      import.meta.env?.VITE_KAKAOMAP_KEY || 'YOUR_KAKAOMAP_KEY';

    if (!kakaoMapKey || kakaoMapKey === 'YOUR_KAKAOMAP_KEY') {
      console.error('카카오맵 API 키를 입력해주세요.');
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('✅ 카카오맵 로드 완료');
        });
      }
    };

    script.onerror = () => {
      console.error('카카오맵 스크립트 로드 실패');
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector(
        `script[src*="dapi.kakao.com"]`
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<FireStationInfo />} />
      <Route path="/register" element={<FireStationRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
  );
}

export default App;
