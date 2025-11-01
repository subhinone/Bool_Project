import React, { useEffect, useMemo, useState } from "react";
import "./DashBoard.css";
import logo119 from "../assets/bool119logo.png";

// 탭 상태 정의
const TABS = {
  FIRE: "실시간 신고 내역",
  DONE: "처리 내역",
};

const DUMMY = [
  {
    id: "f001",
    title: "처인구 남동 화재",
    minutesAgo: 2,
    status: "FIRE", // or "DONE"
    preview: "src/assets/dummy_fire1.png",
    location: "경기 용인시 처인구 명지로116",
    wind: "북풍 0.8m/s",
    humidity: "84%",
    risk: 83,
    reporter: { name: "박민규", phone: "010-0000-0000", reportId: "21" },
    memo: "근처 주차장에 연기 다량 발생. 가연물(박스) 주변 확산 우려.",
  },
  {
    id: "f002",
    title: "처인구 역북동 화재",
    minutesAgo: 4,
    status: "FIRE",
    preview: "src/assets/dummy_fire2.png",
    location: "경기 용인시 처인구 역북동 571-1",
    wind: "서풍 1.2m/s",
    humidity: "66%",
    risk: 71,
    reporter: { name: "이유신", phone: "010-2222-3333", reportId: "22" },
    memo: "간판 전기 스파크 의심. 초기 진화 필요.",
  },
  {
    id: "f003",
    title: "용인시 모현면 화재",
    minutesAgo: 8,
    status: "FIRE",
    preview:
      "https://images.unsplash.com/photo-1520409364225-92729ee9b0ad?q=80&w=1200&auto=format&fit=crop",
    location: "경기 용인시 모현면 금강로 7",
    wind: "남풍 0.5m/s",
    humidity: "72%",
    risk: 58,
    reporter: { name: "최수빈", phone: "010-5555-9999", reportId: "23" },
    memo: "산책로 인근 낙엽 훈소.",
  },
  {
    id: "f004",
    title: "용인시 남사면 화재",
    minutesAgo: 13,
    status: "DONE",
    preview:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    location: "경기 용인시 남사면 서촌로 3",
    wind: "북서풍 1.0m/s",
    humidity: "77%",
    risk: 35,
    reporter: { name: "함종호", phone: "010-7777-0000", reportId: "24" },
    memo: "작은 쓰레기더미, 현장 정리 완료.",
  },
];

export default function Dashboard() {
  const [list, setList] = useState(DUMMY);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(TABS.FIRE); // 탭 상태 추가

  // 탭별 목록 분리
  const fireList = useMemo(() => list.filter(f => f.status === "FIRE"), [list]);
  const doneList = useMemo(() => list.filter(f => f.status === "DONE"), [list]);
  const currentList = activeTab === TABS.FIRE ? fireList : doneList;
  
  // 현재 목록의 첫 번째 항목을 기본 선택 항목으로 설정
  const [selectedId, setSelectedId] = useState(currentList[0]?.id); 
  
  const selected = useMemo(
    () => currentList.find((f) => f.id === selectedId) ?? currentList[0],
    [currentList, selectedId]
  );

  // 탭이 변경되거나 목록이 변경될 때 선택 항목을 목록의 첫 번째 항목으로 초기화
  useEffect(() => {
    setSelectedId(currentList[0]?.id);
  }, [activeTab, currentList]);

  // 실시간 시간 업데이트
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 검색 필터링 (현재 활성 목록 기준)
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return currentList;
    return currentList.filter((f) => f.title.includes(q));
  }, [currentList, query]);

  // 🔥 처리 완료 기능: 상태를 "DONE"으로 변경하고 "처리 내역" 탭으로 이동
  const handleComplete = (id) => {
    setList((prevList) =>
      prevList.map((fire) =>
        fire.id === id ? { ...fire, status: "DONE" } : fire
      )
    );
    setActiveTab(TABS.DONE);
    alert(`[${selected.title}] 처리 완료. 처리 내역으로 이동합니다.`);
  };

  // 🔄 처리 취소 기능: 상태를 "FIRE"로 변경하고 "실시간 신고 내역" 탭으로 이동
  const handleRevert = (id) => {
    setList((prevList) =>
      prevList.map((fire) =>
        fire.id === id ? { ...fire, status: "FIRE" } : fire
      )
    );
    setActiveTab(TABS.FIRE); 
    alert(`[${selected.title}] 처리 취소. 실시간 신고 내역으로 이동합니다.`);
  };
  
  return (
    <div className="fd-wrap">
      <header className="fd-header" role="banner">
        <div className="fd-header-left">
          <img src={logo119} alt="BOOL119" />
          <h1>
            용인시 소방서 <span className="fd-sub">실시간 신고 내역</span>
          </h1>
        </div>
        <nav className="fd-tabs" aria-label="화면 전환">
          {/* 실시간 신고 내역 탭 */}
          <button 
            onClick={() => setActiveTab(TABS.FIRE)}
            className={activeTab === TABS.FIRE ? "active" : ""}
          >
            {TABS.FIRE}
          </button>
          {/* 처리 내역 탭 */}
          <button 
            onClick={() => setActiveTab(TABS.DONE)}
            className={activeTab === TABS.DONE ? "active" : ""}
          >
            {TABS.DONE}
          </button>
        </nav>
      </header>

      <div className="fd-grid">
        <aside className="fd-side" aria-label="화재 목록">
          <div className="fd-card fd-side-card">
            <div className="fd-side-title">{activeTab}</div> {/* 현재 탭 이름으로 제목 변경 */}
            <div className="fd-search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색"
                aria-label="화재 검색"
              />
            </div>

            <ul className="fd-list" role="listbox">
              {filtered.map((f) => (
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
                  <div className="fd-list-meta">{f.minutesAgo} minutes ago</div>
                </li>
              ))}
            </ul>

            <div className="fd-pagination">1&nbsp;&nbsp;2&nbsp;&nbsp;3</div>
          </div>
        </aside>

        <main className="fd-main" role="main">
          {selected ? (
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
                <img src={selected.preview} alt="현장 영상/이미지" />
              </div>

              <div className="fd-main-bottom">
                <section className="fd-map-card">
                  <div className="fd-map-label">MAP</div>
                  <div className="fd-map-box">
                    <div className="fd-map-placeholder">지도 로딩 영역</div>
                  </div>
                </section>

                <section className="fd-info">
                  <ul className="fd-bullets">
                    <li>
                      <span className="k">신고자 위치</span>
                      <span className="v">{selected.location}</span>
                    </li>
                    <li>
                      <span className="k">바람</span>
                      <span className="v">{selected.wind}</span>
                    </li>
                    <li>
                      <span className="k">습도</span>
                      <span className="v">{selected.humidity}</span>
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
                    <button className="btn btn-ghost">취소</button>
                    {/* 상태에 따라 버튼 렌더링: FIRE는 완료, DONE은 복구(처리됨) */}
                    {selected.status === "FIRE" ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleComplete(selected.id)}
                      >
                        처리 완료
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => handleRevert(selected.id)} 
                      >
                        처리됨 
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="fd-card fd-main-card" style={{ padding: 40, textAlign: 'center' }}>
              <p>선택된 신고가 없습니다.</p>
              <p>{activeTab} 목록이 비어 있습니다.</p>
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
            <div className="fd-reporter-body">
              <div className="fd-avatar" aria-hidden="true">
                👤
              </div>
              <div className="fd-field">
                <div className="label">이름</div>
                <div className="value">{selected?.reporter?.name ?? '-'}</div>
              </div>
              <div className="fd-field">
                <div className="label">전화번호</div>
                <div className="value">{selected?.reporter?.phone ?? '-'}</div>
              </div>
              <div className="fd-field">
                <div className="label">신고 내역</div>
                <div className="value">#{selected?.reporter?.reportId ?? '-'}</div>
              </div>
              <button className="btn btn-outline">버튼대신 내역</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}