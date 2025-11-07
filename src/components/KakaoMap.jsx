import React, { useEffect, useRef, useState } from 'react';

const KakaoMap = ({ latitude, longitude, address }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🗺️ KakaoMap useEffect called');
    console.log('Props:', { latitude, longitude, address });
    console.log('window.kakao exists?', !!window.kakao);
    console.log('window.kakao.maps exists?', !!window.kakao?.maps);

    // Kakao Maps API 로드 대기
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.log('⏳ Kakao API not loaded yet, waiting...');
        return;
      }

      console.log('✅ Kakao API is available, initializing map...');

      try {
        // 기본 위치 (위도/경도가 없을 경우)
        const defaultLat = 37.5665;
        const defaultLng = 126.978;

        const lat = latitude || defaultLat;
        const lng = longitude || defaultLng;

        console.log('Initializing map with coordinates:', lat, lng);

        // 지도 생성 또는 업데이트
        if (!mapRef.current && mapContainer.current) {
          const container = mapContainer.current;
          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3,
          };

          mapRef.current = new window.kakao.maps.Map(container, options);
          console.log('Map created successfully');
        }

        if (!mapRef.current) {
          setError('지도를 생성할 수 없습니다');
          return;
        }

        // 마커 업데이트
        const position = new window.kakao.maps.LatLng(lat, lng);

        // 기존 인포윈도우 제거
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        // 기존 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // 새 마커 생성
        markerRef.current = new window.kakao.maps.Marker({
          position: position,
          map: mapRef.current,
        });

        // 지도 중심 이동
        mapRef.current.setCenter(position);

        // 인포윈도우 추가 (주소 표시)
        if (address) {
          infoWindowRef.current = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:8px 12px;font-size:13px;min-width:150px;text-align:center;background:white;border:2px solid #FF4500;border-radius:8px;"><strong>📍 ${address}</strong></div>`,
            removable: false,
          });
          infoWindowRef.current.open(mapRef.current, markerRef.current);
        }

        setError(null);
        console.log('Map updated successfully');
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('지도 초기화 중 오류 발생: ' + err.message);
      }
    };

    // API 로드 확인 및 초기화
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // API가 로드될 때까지 대기
      let attempts = 0;
      const maxAttempts = 50; // 5초 대기
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('❌ Kakao Maps API failed to load after 5 seconds');
          console.error('Please check:');
          console.error('1. Browser console Network tab for failed requests');
          console.error('2. Kakao API key validity at https://developers.kakao.com');
          console.error('3. Internet connection');
          setError('Kakao Maps API를 불러올 수 없습니다. API 키를 확인하거나 네트워크를 확인하세요.');
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [latitude, longitude, address]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          borderRadius: '8px',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        borderRadius: '8px',
      }}
    />
  );
};

export default KakaoMap;
