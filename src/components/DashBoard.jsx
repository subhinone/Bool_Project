import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";
import logo119 from "../assets/119_bool.png";
import CompleteModal from "./CompleteModal";
import {
  getActiveFires,
  getCompletedFires,
  updateFireStatus,
  getToken,
  logout, // 💡 [추가] 로그아웃 함수 임포트
} from "../utils/api";

// 💡 [추가] KakaoMap 컴포넌트와 날씨 유틸리티 함수 임포트
import KakaoMap from "../components/KakaoMap";
import {
  getWeatherForecast,
  calculateEffectiveHumidity,
} from "../utils/weatherApi";
// -----------------------------------------------------

// Base64 이미지를 표시 가능한 URL로 변환하는 헬퍼 함수
const getImageUrl = (base64String) => {
  if (!base64String) return null;

  if (base64String.startsWith("data:")) {
    return base64String;
  }

  if (base64String.startsWith("/9j/") || base64String.startsWith("iVBOR")) {
    const isPng = base64String.startsWith("iVBOR");
    return `data:image/${isPng ? "png" : "jpeg"};base64,${base64String}`;
  }

  return `data:image/jpeg;base64,${base64String}`;
};

// 백엔드 데이터를 웹앱 형식으로 변환
const transformReport = (report) => {
  const createdAt = new Date(report.created_at);
  const now = new Date();
  const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));

  return {
    id: report.id,
    title: report.address || `화재 신고 #${report.id}`,
    minutesAgo: diffMinutes,
    status: report.status === "resolved" ? "DONE" : "FIRE",
    preview: getImageUrl(report.annotated_image),
    location: report.address,
    // 💡 [추가] 지도 및 날씨 API 사용을 위해 위경도 필드 추가
    latitude: report.latitude,
    longitude: report.longitude,
    // --------------------------------------------------
    wind:
      report.wind_direction && report.wind_speed
        ? `${report.wind_direction} ${report.wind_speed}m/s`
        : "-",
    humidity: report.humidity ? `${Math.round(report.humidity)}%` : "-",
    risk: Math.round(report.confidence || 0),
    reporter: {
      name: report.user_name || "알 수 없음",
      phone: report.user_phone || "-",
      reportId: report.id.toString(),
    },
    memo: `${report.fire_type || "unknown"} 화재 (신뢰도: ${Math.round(
      report.confidence || 0
    )}%)`,
    _raw: report,
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [stationName, setStationName] = useState("용인시 소방서");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 [추가] 날씨 및 유효 습도 상태 추가
  const [weatherData, setWeatherData] = useState(null);
  const [effectiveHumidityData, setEffectiveHumidityData] = useState(null);
  // -------------------------------------------------------------------

  // 💡 [추가] 선택된 신고의 위치 기반 날씨 정보를 가져오는 함수
  const fetchWeather = useCallback(async (lat, lon) => {
    if (lat && lon) {
      const forecast = await getWeatherForecast(lat, lon);
      setWeatherData(forecast);

      if (forecast && forecast.humidity && forecast.temperature) {
        const humidityRisk = calculateEffectiveHumidity(
          forecast.humidity,
          forecast.temperature
        );
        setEffectiveHumidityData(humidityRisk);
      } else {
        setEffectiveHumidityData(null);
      }
    } else {
      setWeatherData(null);
      setEffectiveHumidityData(null);
    }
  }, []);
  // -------------------------------------------------------------

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const savedStationName = localStorage.getItem("stationName") || "소방서";
    setStationName(savedStationName);

    loadReports();
  }, [navigate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const is_active = activeTab === "active";
      const response = is_active
        ? await getActiveFires()
        : await getCompletedFires();

      const reports = response.reports || [];
      const transformed = reports.map(transformReport);
      setList(transformed);

      if (transformed.length > 0) {
        const idToSelect =
          selectedId && transformed.find((f) => f.id === selectedId)
            ? selectedId
            : transformed[0].id;

        setSelectedId(idToSelect);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("화재 신고 로드 실패:", err);

      if (err.status === 401) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      setError(err.message || "데이터를 불러올 수 없습니다.");
      setList([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 다시 로드
  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const selected = useMemo(
    () => list.find((f) => f.id === selectedId) ?? list[0],
    [list, selectedId]
  );

  // 💡 [추가] 선택된 신고가 변경될 때마다 날씨 정보 로드
  useEffect(() => {
    if (selected) {
      fetchWeather(selected.latitude, selected.longitude);
    }
  }, [selected, fetchWeather]);
  // -----------------------------------------------------

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let result = list;

    if (activeTab === "active") {
      result = result.filter((f) => f.status === "FIRE");
    } else {
      result = result.filter((f) => f.status === "DONE");
    }

    const q = query.trim();
    if (q) {
      // 💡 [수정] 메모 내용도 검색에 포함
      result = result.filter((f) => f.title.includes(q) || f.memo.includes(q));
    }

    return result;
  }, [list, query, activeTab]);

  useEffect(() => {
    if (filtered.length > 0) {
      if (!filtered.find((f) => f.id === selectedId)) {
        setSelectedId(filtered[0].id);
      }
    }
  }, [filtered, selectedId]);

  const handleComplete = async () => {
    if (!selectedId) return;

    try {
      // 백엔드에 상태 업데이트 요청
      await updateFireStatus(selectedId, "resolved");

      // 로컬 상태 업데이트
      setList((prevList) =>
        prevList.map((item) =>
          item.id === selectedId ? { ...item, status: "DONE" } : item
        )
      );

      setShowCompleteModal(true);
    } catch (err) {
      console.error("처리 완료 실패:", err);
      // 💡 [수정] 오류 발생 시 사용자에게 명확한 메시지 표시
      alert(
        "처리 완료 중 오류가 발생했습니다: " + (err.message || "서버 통신 오류")
      );
      // -----------------------------------------------------
    }
  };

  const handleModalConfirm = () => {
    setShowCompleteModal(false);
    setActiveTab("history");
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // 💡 [수정] 로그아웃 처리
      logout();
      navigate("/login");
    }
  };

  // 💡 [추가] 지도에 전달할 위경도 및 주소 정보 (기본값 설정 포함)
  const defaultLatitude = 37.5665;
  const defaultLongitude = 126.978;
  const mapLat = selected?.latitude || defaultLatitude;
  const mapLon = selected?.longitude || defaultLongitude;
  // -------------------------------------------------------------

  return (
    <div className="fd-wrap">
      <header className="fd-header" role="banner">
        <div className="fd-header-left">
          <img src={logo119} alt="BOOL119" />
          <h1>
            {stationName}
            <span className="fd-sub">
              {activeTab === "active" ? "실시간 신고 내역" : "처리 내역"}
            </span>
          </h1>
        </div>
        <nav className="fd-tabs" aria-label="화면 전환">
          <button className="fd-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
          <button
            className={activeTab === "active" ? "active" : ""}
            onClick={() => setActiveTab("active")}
          >
            실시간 신고 내역
          </button>
          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            처리 내역
          </button>
        </nav>
      </header>

      <div className="fd-grid">
        <aside className="fd-side" aria-label="화재 목록">
          <div className="fd-card fd-side-card">
            <div className="fd-side-title">
              {activeTab === "active" ? "화재 목록" : "처리 내역"}
            </div>
            <div className="fd-search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색"
                aria-label="화재 검색"
              />
            </div>

            <ul className="fd-list" role="listbox">
              {filtered.length > 0 ? (
                filtered.map((f) => (
                  <li
                    key={f.id}
                    role="option"
                    aria-selected={selectedId === f.id}
                    className={`fd-list-item ${
                      selectedId === f.id ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedId(f.id)}
                  >
                    <div className="fd-list-title">{f.title}</div>
                    <div className="fd-list-meta">
                      {f.minutesAgo} minutes ago
                    </div>
                  </li>
                ))
              ) : (
                <div className="fd-empty">
                  <div className="fd-empty-icon">📭</div>
                  <div className="fd-empty-text">
                    {activeTab === "active"
                      ? "신고 내역이 없습니다"
                      : "처리된 내역이 없습니다"}
                  </div>
                </div>
              )}
            </ul>

            <div className="fd-pagination">1&nbsp;&nbsp;2&nbsp;&nbsp;3</div>
          </div>
        </aside>

        <main className="fd-main" role="main">
          {loading ? (
            <div className="fd-card fd-main-card fd-main-empty">
              <div className="fd-empty-main">
                <div className="fd-empty-icon-large">⏳</div>
                <div className="fd-empty-title">데이터 로딩 중...</div>
              </div>
            </div>
          ) : error ? (
            <div className="fd-card fd-main-card fd-main-empty">
              <div className="fd-empty-main">
                <div className="fd-empty-icon-large">⚠️</div>
                <div className="fd-empty-title">오류 발생</div>
                <div className="fd-empty-desc">{error}</div>
              </div>
            </div>
          ) : filtered.length > 0 && selected ? (
            <div className="fd-card fd-main-card">
              <div className="fd-main-head">
                <div className="fd-main-title">
                  {selected.title}
                  <span className="fd-main-time">
                    {selected.minutesAgo} minutes ago
                  </span>
                </div>
                <div
                  className={`fd-badge ${
                    selected.status === "DONE" ? "done" : "fire"
                  }`}
                >
                  {selected.status === "DONE" ? "처리 완료" : "FIRE"}
                </div>
              </div>

              <div className="fd-media">
                {selected.preview ? (
                  <img
                    src={selected.preview}
                    alt="현장 영상/이미지"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "300px",
                      backgroundColor: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    이미지 없음
                  </div>
                )}
              </div>

              <div className="fd-main-bottom">
                <section className="fd-map-card">
                  <div className="fd-map-label">MAP</div>
                  <div className="fd-map-box">
                    {/* 💡 [수정] KakaoMap 컴포넌트로 지도 로딩 영역 대체 */}
                    <KakaoMap
                      latitude={mapLat}
                      longitude={mapLon}
                      address={selected.location}
                    />
                    {/* ------------------------------------------- */}
                  </div>
                </section>

                <section className="fd-info">
                  <ul className="fd-bullets">
                    <li>
                      <span className="k">신고자 위치</span>
                      <span className="v">{selected.location}</span>
                    </li>
                    {/* 💡 [수정] 현재 온도 표시 */}
                    <li>
                      <span className="k">현재 온도</span>
                      <span className="v">
                        {weatherData?.temperature
                          ? `${weatherData.temperature}°C`
                          : selected.wind}
                      </span>
                    </li>
                    {/* 💡 [수정] 현재 습도 표시 */}
                    <li>
                      <span className="k">습도</span>
                      <span className="v">
                        {weatherData?.humidity
                          ? `${weatherData.humidity}%`
                          : selected.humidity}
                      </span>
                    </li>
                    {/* 💡 [수정] 풍향 분리 표시 */}
                    <li>
                      <span className="k">풍향</span>
                      <span className="v">
                        {weatherData?.windDirection
                          ? weatherData.windDirection
                          : "정보 없음"}
                      </span>
                    </li>
                    {/* 💡 [수정] 풍속 분리 표시 */}
                    <li>
                      <span className="k">풍속</span>
                      <span className="v">
                        {weatherData?.windSpeed
                          ? `${weatherData.windSpeed} m/s`
                          : "정보 없음"}
                      </span>
                    </li>
                    {/* 💡 [추가] 강수 형태 표시 */}
                    <li>
                      <span className="k">강수 형태</span>
                      <span className="v">
                        {weatherData?.rainType
                          ? weatherData.rainType === "0"
                            ? "없음"
                            : "있음"
                          : "-"}
                      </span>
                    </li>
                    {/* --------------------------------------------- */}
                  </ul>

                  <div className="fd-risk">
                    <div className="fd-risk-label">
                      {/* 💡 [수정] 실효 습도 기반 위험 지수 표시 */}
                      <span className="k">화재 위험 지수</span>
                      <strong>
                        {effectiveHumidityData?.riskText
                          ? `${effectiveHumidityData.riskText} (${effectiveHumidityData.riskLevel}%)`
                          : `${selected.risk}% (AI)`}
                      </strong>
                    </div>
                    <div className="fd-risk-bar">
                      <div
                        className="fd-risk-fill"
                        // 💡 [수정] 위험도 바를 실효 습도 기반 위험 지수로 채움
                        style={{
                          width: `${
                            effectiveHumidityData?.riskLevel || selected.risk
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="fd-memo">{selected.memo}</div>

                  <div className="fd-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleComplete}
                      disabled={selected.status === "DONE"}
                    >
                      {selected.status === "DONE" ? "처리됨" : "처리 완료"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="fd-card fd-main-card fd-main-empty">
              <div className="fd-empty-main">
                <div className="fd-empty-icon-large">
                  {activeTab === "active" ? "🔥" : "✅"}
                </div>
                <div className="fd-empty-title">
                  {activeTab === "active"
                    ? "현재 신고 내역이 없습니다"
                    : "처리된 내역이 없습니다"}
                </div>
                <div className="fd-empty-desc">
                  {activeTab === "active"
                    ? "새로운 화재 신고가 들어오면 여기에 표시됩니다"
                    : "처리 완료된 신고 내역이 여기에 표시됩니다"}
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className="fd-right">
          <div className="fd-card fd-clock" aria-live="polite">
            <div className="fd-clock-icon">🕑</div>
            <div className="fd-clock-date">
              {now.getFullYear().toString().slice(2)}년{" "}
              {(now.getMonth() + 1).toString().padStart(2, "0")}월{" "}
              {now.getDate().toString().padStart(2, "0")}일
            </div>
            <div className="fd-clock-time">
              {now.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>

          <div className="fd-card fd-reporter">
            <div className="fd-reporter-title">신고자 정보</div>
            {filtered.length > 0 ? (
              <div className="fd-reporter-body">
                <div className="fd-avatar" aria-hidden="true">
                  👤
                </div>
                <div className="fd-field">
                  <div className="label">이름</div>
                  <div className="value">{selected.reporter.name}</div>
                </div>
                <div className="fd-field">
                  <div className="label">전화번호</div>
                  <div className="value">{selected.reporter.phone}</div>
                </div>
                <div className="fd-field">
                  <div className="label">신고 내역</div>
                  <div className="value">#{selected.reporter.reportId}</div>
                </div>
                <button className="btn btn-outline">버튼대신 내역</button>
              </div>
            ) : (
              <div className="fd-reporter-empty">
                <div className="fd-empty-icon">👤</div>
                <div className="fd-empty-text">신고자 정보가 없습니다</div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <CompleteModal
        open={showCompleteModal}
        fireTitle={selected?.title || ""}
        onStay={() => setShowCompleteModal(false)}
        onMoveToHistory={handleModalConfirm}
        onClose={() => setShowCompleteModal(false)}
      />
    </div>
  );
}
