import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './AlarmDisplay.css';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CLOSE_DURATION = 350; // ms — must match CSS animation

export default function AlarmDisplay({
  alarm,
  isRinging,
  onToggle,
  onUpdate,
  onDismiss,
  onRequestPermission
}) {
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editHour, setEditHour] = useState(alarm.hour);
  const [editMinute, setEditMinute] = useState(alarm.minute);
  const [editDay, setEditDay] = useState(alarm.day);
  const closeTimerRef = useRef(null);

  const formatAlarmTime = () => {
    const period = alarm.hour >= 12 ? 'P.M.' : 'A.M.';
    const h = alarm.hour % 12 || 12;
    const m = String(alarm.minute).padStart(2, '0');
    const dayLabel = alarm.day !== null ? DAYS[alarm.day] : 'DAILY';
    return `${dayLabel} ${h}:${m} ${period}`;
  };

  const handleOpen = () => {
    setEditHour(alarm.hour);
    setEditMinute(alarm.minute);
    setEditDay(alarm.day);
    setIsClosing(false);
    setShowModal(true);
    onRequestPermission();
  };

  // Animate close, then unmount
  const closeModal = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, CLOSE_DURATION);
  }, [isClosing]);

  const handleSave = () => {
    onUpdate({ hour: editHour, minute: editMinute, day: editDay, enabled: true });
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleDisable = () => {
    onToggle();
    closeModal();
  };

  return (
    <>
      <div className={`alarm-display ${isRinging ? 'ringing' : ''}`} onClick={isRinging ? onDismiss : handleOpen}>
        <svg className="alarm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          {alarm.enabled && <circle cx="18" cy="5" r="3" fill="var(--accent-green)" stroke="none" />}
        </svg>
        {isRinging ? (
          <span className="alarm-text ringing-text">TAP TO DISMISS</span>
        ) : (
          <span className="alarm-text">{formatAlarmTime()}</span>
        )}
        {alarm.enabled && !isRinging && <div className="alarm-active-dot" />}
      </div>

      {/* Alarm Modal — portalled to body, with close transition */}
      {showModal && createPortal(
        <div className={`alarm-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleCancel}>
          <div className={`alarm-modal ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
            <h2 className="alarm-modal-title">Set Alarm</h2>

            <div className="alarm-time-picker">
              <div className="alarm-picker-group">
                <label className="alarm-picker-label">Hour</label>
                <div className="alarm-picker-control">
                  <button
                    className="alarm-picker-btn"
                    onClick={() => setEditHour(prev => (prev + 1) % 24)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <span className="alarm-picker-value">
                    {String(editHour % 12 || 12).padStart(2, '0')}
                    <span className="alarm-picker-period">{editHour >= 12 ? 'PM' : 'AM'}</span>
                  </span>
                  <button
                    className="alarm-picker-btn"
                    onClick={() => setEditHour(prev => (prev - 1 + 24) % 24)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>
              </div>

              <span className="alarm-picker-colon">:</span>

              <div className="alarm-picker-group">
                <label className="alarm-picker-label">Minute</label>
                <div className="alarm-picker-control">
                  <button
                    className="alarm-picker-btn"
                    onClick={() => setEditMinute(prev => (prev + 1) % 60)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <span className="alarm-picker-value">{String(editMinute).padStart(2, '0')}</span>
                  <button
                    className="alarm-picker-btn"
                    onClick={() => setEditMinute(prev => (prev - 1 + 60) % 60)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="alarm-day-selector">
              <label className="alarm-picker-label">Repeat</label>
              <div className="alarm-day-pills">
                <button
                  className={`alarm-day-pill ${editDay === null ? 'active' : ''}`}
                  onClick={() => setEditDay(null)}
                >
                  Daily
                </button>
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    className={`alarm-day-pill ${editDay === i ? 'active' : ''}`}
                    onClick={() => setEditDay(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="alarm-modal-actions">
              <button className="alarm-modal-btn cancel" onClick={handleCancel}>Cancel</button>
              <button className="alarm-modal-btn save" onClick={handleSave}>Set Alarm</button>
            </div>

            {alarm.enabled && (
              <button className="alarm-disable-btn" onClick={handleDisable}>
                Disable Alarm
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
