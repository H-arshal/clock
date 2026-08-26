import FlipCard from './FlipCard';
import './FlipClock.css';

export default function FlipClock({ hours, minutes, seconds, is24Hour, period }) {
  const h1 = String(hours).padStart(2, '0')[0];
  const h2 = String(hours).padStart(2, '0')[1];
  const m1 = String(minutes).padStart(2, '0')[0];
  const m2 = String(minutes).padStart(2, '0')[1];
  const s1 = String(seconds).padStart(2, '0')[0];
  const s2 = String(seconds).padStart(2, '0')[1];

  return (
    <div className="flip-clock">
      {/* Hours section */}
      <div className="flip-clock-section">
        {!is24Hour && (
          <div className="period-indicator">
            <span className={`period-label ${period === 'AM' ? 'active' : ''}`}>AM</span>
            <span className={`period-label ${period === 'PM' ? 'active' : ''}`}>PM</span>
          </div>
        )}
        <div className="flip-clock-digits">
          <FlipCard digit={h1} />
          <FlipCard digit={h2} />
        </div>
      </div>

      {/* Separator */}
      <div className="flip-clock-separator">
        <div className="separator-dot" />
        <div className="separator-dot" />
      </div>

      {/* Minutes section */}
      <div className="flip-clock-section">
        <div className="flip-clock-digits">
          <FlipCard digit={m1} />
          <FlipCard digit={m2} />
        </div>
      </div>

      {/* Seconds (smaller) */}
      <div className="flip-clock-seconds">
        <div className="seconds-display">
          <span className="seconds-value">{s1}{s2}</span>
          <span className="seconds-label">SEC</span>
        </div>
      </div>
    </div>
  );
}
