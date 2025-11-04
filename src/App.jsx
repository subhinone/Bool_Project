import { useEffect } from 'react';
import './App.css';
import FireStationInfo from './components/FireStationInfo';
import FireStationRegister from './components/FirestationRegister';
import Login from './components/Login';
import DashBoard from './components/DashBoard';
import { Routes, Route } from 'react-router-dom';

function App() {
  useEffect(() => {
    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {});
      } else {
        console.error('❌ window.kakao.maps를 찾을 수 없습니다.');
      }
    };

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(
        'script[src*="dapi.kakao.com"]'
      );
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
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
