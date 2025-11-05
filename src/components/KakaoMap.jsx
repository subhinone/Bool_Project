import React, { useEffect, useRef } from "react";
import "./KakaoMap.css";

export default function KakaoMap({ latitude, longitude, address }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    // 카카오맵 스크립트 로드
    const loadKakaoMap = () => {
      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;

      if (!apiKey) {
        console.warn("카카오맵 API 키가 설정되지 않았습니다.");
        return;
      }

      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    const initializeMap = () => {
      if (!mapContainer.current || !window.kakao) return;

      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };

      const map = new window.kakao.maps.Map(mapContainer.current, options);
      mapInstance.current = map;

      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });
      markerInstance.current = marker;

      if (address) {
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-size:12px;font-weight:700;white-space:nowrap;">${address}</div>`,
          removable: false,
        });
        infowindow.open(map, marker);
      }
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        initializeMap();
      });
    } else {
      loadKakaoMap();
    }
  }, [latitude, longitude, address]);

  useEffect(() => {
    if (!mapInstance.current || !window.kakao) return;

    const newPosition = new window.kakao.maps.LatLng(latitude, longitude);
    mapInstance.current.setCenter(newPosition);

    if (markerInstance.current) {
      markerInstance.current.setPosition(newPosition);
    }
  }, [latitude, longitude]);

  return (
    <div className="kakao-map-wrapper">
      <div
        ref={mapContainer}
        className="kakao-map-container"
        role="application"
        aria-label="화재 위치 지도"
      />
    </div>
  );
}
