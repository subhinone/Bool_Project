import React, { useEffect, useRef } from "react";
import "./CompleteModal.css";

export default function CompleteModal({
  open = false,
  fireTitle = "",
  onStay,
  onMoveToHistory,
  onClose,
}) {
  const closeBtn = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeBtn.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="cm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
      onClick={onClose}
    >
      <div className="cm-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="cm-close"
          aria-label="닫기"
          onClick={onClose}
          ref={closeBtn}
        >
          ×
        </button>

        <div className="cm-icon" aria-hidden="true">
          ✅
        </div>

        <h2 id="cm-title" className="cm-title">
          처리가 완료되었습니다
        </h2>

        <p className="cm-desc">{fireTitle}</p>

        <div className="cm-actions">
          <button className="btn btn-ghost" onClick={onStay}>
            현재 화면 유지
          </button>
          <button className="btn btn-primary" onClick={onMoveToHistory}>
            처리 내역으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
