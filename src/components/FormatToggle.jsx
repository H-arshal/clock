import './FormatToggle.css';

export default function FormatToggle({ is24Hour, onToggle }) {
  return (
    <button className="format-toggle" onClick={onToggle} title="Toggle 12/24 hour format">
      <span className={`format-option ${!is24Hour ? 'active' : ''}`}>12</span>
      <span className="format-divider">/</span>
      <span className={`format-option ${is24Hour ? 'active' : ''}`}>24</span>
    </button>
  );
}
