import React, { useEffect, useRef } from "react";
import "./RegisterSuccessModal.css";

export default function RegisterSuccessModal({
  open = false,
  stationName = "",
  email = "",
  primaryText = "대시보드로 이동",
  onPrimary,
  onClose,
}) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="rsm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsm-title"
      onMouseDown={(e) => {
        if (e.target.classList.contains("rsm-overlay")) onClose?.();
      }}
    >
      <div className="rsm-card" ref={dialogRef}>
        <button
          className="rsm-close"
          aria-label="닫기"
          onClick={onClose}
          ref={closeBtnRef}
        >
          ×
        </button>

        <div className="rsm-icon-wrap" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#16a34a" opacity="0.12" />
            <path
              d="M8 12.5l2.5 2.5L16 9.5"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="rsm-title" className="rsm-title">
          등록이 완료되었습니다
        </h2>

        {(stationName || email) && (
          <p className="rsm-sub">
            {stationName}
            {stationName && email ? " · " : ""}
            {email}
          </p>
        )}

        <button className="rsm-primary" onClick={onPrimary}>
          {primaryText}
        </button>
      </div>
    </div>
  );
}
