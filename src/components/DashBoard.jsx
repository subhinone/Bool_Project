import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashBoard.css';
import logo119 from '../assets/119_bool.png';
import CompleteModal from './CompleteModal';
import KakaoMap from './KakaoMap';
import {
  getActiveFires,
  getCompletedFires,
  updateFireStatus,
  getToken,
  getFireById,
  getUserProfile,
} from '../utils/api';

// Base64 이미지를 표시 가능한 URL로 변환하는 헬퍼 함수
const getImageUrl = (base64String) => {
  if (!base64String) return null;

  // 이미 data: URL 형식인 경우 그대로 반환
  if (base64String.startsWith('data:')) {
    return base64String;
  }

  // Base64 문자열인 경우 data: URL 형식으로 변환
  // JPEG는 /9j/4AAQ... 로 시작
  if (base64String.startsWith('/9j/') || base64String.startsWith('iVBOR')) {
    // JPEG 또는 PNG로 추정
    const isPng = base64String.startsWith('iVBOR');
    return `data:image/${isPng ? 'png' : 'jpeg'};base64,${base64String}`;
  }

  // 기본적으로 JPEG로 처리
  return `data:image/jpeg;base64,${base64String}`;
};

// 상대적 시간을 한국어로 표시하는 헬퍼 함수
const formatRelativeTime = (minutes) => {
  if (minutes < 1) {
    return '방금 전';
  } else if (minutes < 60) {
    return `${minutes}분 전`;
  } else if (minutes < 1440) {
    // 1440분 = 24시간
    const hours = Math.floor(minutes / 60);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}일 전`;
  }
};

// 날짜를 "YYYY.MM.DD HH:mm" 형식으로 변환
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 백엔드 데이터를 웹앱 형식으로 변환
const transformReport = (report) => {
  const createdAt = new Date(report.created_at);
  const now = new Date();
  const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));

  // 백엔드 응답 형식에 따라 camelCase 또는 snake_case 처리
  const windDirection = report.wind_direction || report.windDirection;
  const windSpeed = report.wind_speed || report.windSpeed;
  const humidity = report.humidity;

  return {
    id: report.id,
    title: report.address || `화재 신고 #${report.id}`,
    minutesAgo: diffMinutes,
    status: report.status === 'resolved' ? 'DONE' : 'FIRE',
    preview: getImageUrl(report.annotated_image), // Base64 이미지 변환
    location: report.address,
    latitude: report.latitude,
    longitude: report.longitude,
    // 날씨 정보: 습도
    humidity: humidity ? `${Math.round(humidity)}%` : '-',
    // 날씨 정보: 풍향
    windDirection: windDirection || '-',
    // 날씨 정보: 풍속
    windSpeed: windSpeed ? `${windSpeed}m/s` : '-',
    risk: Math.round(report.confidence || 0),
    reporter: {
      name: report.user_name || '알 수 없음',
      phone: report.user_phone || '-',
      reportId: report.id.toString(),
      userId: report.user_id,
    },
    memo: `${report.fire_type || 'unknown'} 화재 (신뢰도: ${Math.round(
      report.confidence || 0
    )}%)`,
    // 원본 데이터도 함께 저장 (디버깅용)
    _raw: report,
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [stationName, setStationName] = useState('용인시 소방서');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 신고자별 신고 내역
  const [reporterHistory, setReporterHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 선택된 신고의 상세 정보 (날씨 정보 포함)
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 선택된 신고자의 프로필 정보
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'active') {
        const response = await getActiveFires();
        const reports = response.reports || [];
        const transformed = reports.map(transformReport);
        setList(transformed);

        if (transformed.length > 0 && !selectedId) {
          setSelectedId(transformed[0].id);
        }
      } else {
        const response = await getCompletedFires();
        const reports = response.reports || [];
        const transformed = reports.map(transformReport);
        setList(transformed);

        if (transformed.length > 0 && !selectedId) {
          setSelectedId(transformed[0].id);
        }
      }
    } catch (err) {
      console.error('[DashBoard] 화재 신고 로드 실패:', err);

      // 401 에러면 로그인 페이지로 리다이렉트
      if (err.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }

      setError(err.message || '데이터를 불러올 수 없습니다.');
      // 에러 발생 시 빈 목록 표시
      setList([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedId, navigate]);

  useEffect(() => {
    // 인증 토큰 확인
    const token = getToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 로그인 시 저장된 소방서 정보 가져오기
    const savedStationName = localStorage.getItem('stationName') || '소방서';
    setStationName(savedStationName);

    // 화재 신고 목록 로드
    loadReports();
  }, [navigate, loadReports]);

  // 신고자의 신고 내역 로드
  const loadReporterHistory = useCallback(async (userId) => {
    if (!userId) {
      setReporterHistory([]);
      return;
    }

    setLoadingHistory(true);
    try {
      // 모든 신고 내역에서 해당 사용자의 신고만 필터링
      const activeResponse = await getActiveFires();
      const completedResponse = await getCompletedFires();

      const allReports = [
        ...(activeResponse.reports || []),
        ...(completedResponse.reports || []),
      ];

      const userReports = allReports
        .filter((report) => report.user_id === userId)
        .map((report) => ({
          id: report.id,
          location: report.address || '위치 정보 없음',
          datetime: formatDateTime(report.created_at),
          status: report.status === 'resolved' ? '처리완료' : '처리중',
        }))
        .sort((a, b) => b.id - a.id); // 최신순 정렬

      setReporterHistory(userReports);
    } catch (err) {
      console.error('신고 내역 로드 실패:', err);
      setReporterHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // 선택된 신고의 상세 정보 로드 (날씨 정보 포함)
  const loadFireDetail = useCallback(async (fireId) => {
    if (!fireId) {
      setSelectedDetail(null);
      return;
    }

    setLoadingDetail(true);
    try {
      const detail = await getFireById(fireId);
      setSelectedDetail(detail);
    } catch (err) {
      console.error(`[DashBoard] 신고 #${fireId} 상세 정보 로드 실패:`, err);
      setSelectedDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // 사용자 프로필 로드 (전화번호 포함)
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    setLoadingUserProfile(true);
    try {
      const profile = await getUserProfile(userId);
      console.log(`[DashBoard] 사용자 프로필 로드 성공:`, profile);
      setUserProfile(profile);
    } catch (err) {
      console.error(`[DashBoard] userId ${userId} 프로필 로드 실패:`, err);
      setUserProfile(null);
    } finally {
      setLoadingUserProfile(false);
    }
  }, []);

  // 탭 변경 시 데이터 다시 로드 및 페이지 리셋
  useEffect(() => {
    loadReports();
    setCurrentPage(1);
  }, [activeTab, loadReports]);

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const selected = useMemo(
    () => list.find((f) => f.id === selectedId) ?? list[0],
    [list, selectedId]
  );

  // 선택된 신고가 변경되면 상세 정보 로드
  useEffect(() => {
    if (selectedId) {
      loadFireDetail(selectedId);
    }
  }, [selectedId, loadFireDetail]);

  // 선택된 신고가 변경되면 신고자 프로필 및 내역 로드
  useEffect(() => {
    if (selected && selected.reporter && selected.reporter.userId) {
      loadReporterHistory(selected.reporter.userId);
      loadUserProfile(selected.reporter.userId);
    } else {
      setReporterHistory([]);
      setUserProfile(null);
    }
  }, [selected, loadReporterHistory, loadUserProfile]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let result = list;

    if (activeTab === 'active') {
      result = result.filter((f) => f.status === 'FIRE');
    } else {
      result = result.filter((f) => f.status === 'DONE');
    }

    const q = query.trim();
    if (q) {
      result = result.filter((f) => f.title.includes(q));
    }

    return result;
  }, [list, query, activeTab]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

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
      await updateFireStatus(selectedId, 'resolved');

      // 로컬 상태 업데이트
      setList((prevList) =>
        prevList.map((item) =>
          item.id === selectedId ? { ...item, status: 'DONE' } : item
        )
      );

      setShowCompleteModal(true);
    } catch (err) {
      console.error('처리 완료 실패:', err);
      alert(
        '처리 완료 중 오류가 발생했습니다: ' +
          (err.message || '알 수 없는 오류')
      );
    }
  };

  const handleModalConfirm = () => {
    setShowCompleteModal(false);
    setActiveTab('history');
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      navigate('/login');
    }
  };

  return (
    <div className="fd-wrap">
      <header className="fd-header" role="banner">
        <div className="fd-header-left">
          <img src={logo119} alt="BOOL119" />
          <h1>
            {stationName}
            <span className="fd-sub">
              {activeTab === 'active' ? '실시간 신고 내역' : '처리 내역'}
            </span>
          </h1>
        </div>
        <nav className="fd-tabs" aria-label="화면 전환">
          <button className="fd-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
          <button
            className={activeTab === 'active' ? 'active' : ''}
            onClick={() => setActiveTab('active')}
          >
            실시간 신고 내역
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            처리 내역
          </button>
        </nav>
      </header>

      <div className="fd-grid">
        <aside className="fd-side" aria-label="화재 목록">
          <div className="fd-card fd-side-card">
            <div className="fd-side-title">
              {activeTab === 'active' ? '화재 목록' : '처리 내역'}
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
              {paginatedList.length > 0 ? (
                paginatedList.map((f) => (
                  <li
                    key={f.id}
                    role="option"
                    aria-selected={selectedId === f.id}
                    className={`fd-list-item ${
                      selectedId === f.id ? 'is-active' : ''
                    }`}
                    onClick={() => setSelectedId(f.id)}
                  >
                    <div className="fd-list-title">{f.title}</div>
                    <div className="fd-list-meta">
                      {formatRelativeTime(f.minutesAgo)}
                    </div>
                  </li>
                ))
              ) : (
                <div className="fd-empty">
                  <div className="fd-empty-icon">🔭</div>
                  <div className="fd-empty-text">
                    {activeTab === 'active'
                      ? '신고 내역이 없습니다'
                      : '처리된 내역이 없습니다'}
                  </div>
                </div>
              )}
            </ul>

            {totalPages > 1 && (
              <div className="fd-pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        fontWeight: currentPage === page ? 'bold' : 'normal',
                        backgroundColor:
                          currentPage === page ? '#111827' : 'transparent',
                        color: currentPage === page ? '#fff' : '#6b7280',
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
              </div>
            )}
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
                    {formatRelativeTime(selected.minutesAgo)}
                  </span>
                </div>
                <div
                  className={`fd-badge ${
                    selected.status === 'DONE' ? 'done' : 'fire'
                  }`}
                >
                  {selected.status === 'DONE' ? '처리 완료' : 'FIRE'}
                </div>
              </div>

              <div className="fd-media">
                {selected.preview ? (
                  <img
                    src={selected.preview}
                    alt="현장 영상/이미지"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
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
                    {selected && selected._raw && (
                      <KakaoMap
                        latitude={selected._raw.latitude}
                        longitude={selected._raw.longitude}
                        address={selected.location}
                      />
                    )}
                    {(!selected || !selected._raw) && (
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
                        데이터를 불러오는 중...
                      </div>
                    )}
                  </div>
                </section>

                <section className="fd-info">
                  <ul className="fd-bullets">
                    <li>
                      <span className="k">신고자 위치</span>
                      <span className="v">{selected.location}</span>
                    </li>
                    <li>
                      <span className="k">습도</span>
                      <span className="v">
                        {loadingDetail
                          ? '로딩 중...'
                          : selectedDetail?.humidity
                          ? `${Math.round(selectedDetail.humidity)}%`
                          : '-'}
                      </span>
                    </li>
                    <li>
                      <span className="k">풍향</span>
                      <span className="v">
                        {loadingDetail
                          ? '로딩 중...'
                          : selectedDetail?.wind_direction ||
                            selectedDetail?.windDirection ||
                            '-'}
                      </span>
                    </li>
                    <li>
                      <span className="k">풍속</span>
                      <span className="v">
                        {loadingDetail
                          ? '로딩 중...'
                          : selectedDetail?.wind_speed ||
                            selectedDetail?.windSpeed
                          ? `${
                              selectedDetail.wind_speed ||
                              selectedDetail.windSpeed
                            }m/s`
                          : '-'}
                      </span>
                    </li>
                  </ul>

                  <div className="fd-risk">
                    <div className="fd-risk-label">
                      <span>위험도</span>
                      <strong>{selected.risk}%</strong>
                    </div>
                    <div className="fd-risk-bar">
                      <div
                        className="fd-risk-fill"
                        style={{ width: `${selected.risk}%` }}
                      />
                    </div>
                  </div>
                  <div className="fd-memo">{selected.memo}</div>

                  <div className="fd-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleComplete}
                      disabled={selected.status === 'DONE'}
                    >
                      {selected.status === 'DONE' ? '처리됨' : '처리 완료'}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="fd-card fd-main-card fd-main-empty">
              <div className="fd-empty-main">
                <div className="fd-empty-icon-large">
                  {activeTab === 'active' ? '🔥' : '✅'}
                </div>
                <div className="fd-empty-title">
                  {activeTab === 'active'
                    ? '현재 신고 내역이 없습니다'
                    : '처리된 내역이 없습니다'}
                </div>
                <div className="fd-empty-desc">
                  {activeTab === 'active'
                    ? '새로운 화재 신고가 들어오면 여기에 표시됩니다'
                    : '처리 완료된 신고 내역이 여기에 표시됩니다'}
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className="fd-right">
          <div className="fd-card fd-clock" aria-live="polite">
            <div className="fd-clock-icon">🕐</div>
            <div className="fd-clock-date">
              {now.getFullYear().toString().slice(2)}년{' '}
              {(now.getMonth() + 1).toString().padStart(2, '0')}월{' '}
              {now.getDate().toString().padStart(2, '0')}일
            </div>
            <div className="fd-clock-time">
              {now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>

          <div className="fd-card fd-reporter">
            <div className="fd-reporter-title">신고자 정보</div>
            {filtered.length > 0 && selected ? (
              <div className="fd-reporter-body">
                <div className="fd-avatar" aria-hidden="true">
                  👤
                </div>
                <div className="fd-field">
                  <div className="label">이름</div>
                  <div className="value">
                    {userProfile?.name || selected.reporter.name}
                  </div>
                </div>
                <div className="fd-field">
                  <div className="label">전화번호</div>
                  <div className="value">
                    {loadingUserProfile
                      ? '로딩 중...'
                      : userProfile?.phone || selected.reporter.phone}
                  </div>
                </div>
                <div className="fd-field">
                  <div className="label">신고 내역</div>
                  <div className="value">#{selected.reporter.reportId}</div>
                </div>

                {/* 신고 내역 섹션 */}
                <div className="fd-reporter-history">
                  <div className="fd-reporter-history-title">📋 신고 내역</div>
                  {loadingHistory ? (
                    <div className="fd-reporter-history-loading">
                      로딩 중...
                    </div>
                  ) : reporterHistory.length > 0 ? (
                    <ul className="fd-reporter-history-list">
                      {reporterHistory.map((item) => (
                        <li key={item.id} className="fd-reporter-history-item">
                          <div className="fd-reporter-history-location">
                            📍 {item.location}
                          </div>
                          <div className="fd-reporter-history-time">
                            🕐 {item.datetime}
                          </div>
                          <div
                            className={`fd-reporter-history-status ${
                              item.status === '처리완료' ? 'done' : 'pending'
                            }`}
                          >
                            {item.status}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="fd-reporter-history-empty">
                      신고 내역이 없습니다
                    </div>
                  )}
                </div>
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
        fireTitle={selected?.title || ''}
        onStay={() => setShowCompleteModal(false)}
        onMoveToHistory={handleModalConfirm}
        onClose={() => setShowCompleteModal(false)}
      />
    </div>
  );
}
