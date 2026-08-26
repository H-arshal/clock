import { useState } from 'react';
import FlipCard from './FlipCard';
import './Timer.css';

const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '10m', minutes: 10 },
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export default function Timer({
  timerMode,
  focusPhase,
  focusCycle,
  displayMinutes,
  displaySeconds,
  totalSeconds,
  initialSeconds,
  isRunning,
  isFinished,
  progress,
  setTimer,
  setMode,
  startFocus,
  skipToNextPhase,
  start,
  pause,
  reset,
  clear,
  dismiss,
}) {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);

  const isIdle = totalSeconds === 0 && !isRunning && !isFinished;

  const handleFullscreen = (enter) => {
    try {
      if (enter && !document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (!enter && document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (e) {
      console.log('Fullscreen API failed or not supported', e);
    }
  };

  const handleStartFocus = () => {
    handleFullscreen(true);
    startFocus();
  };

  const handleStop = () => {
    handleFullscreen(false);
    clear();
  };

  const handleModeSwitch = (mode) => {
    if (mode === 'standard') {
      handleFullscreen(false);
    }
    setMode(mode);
  };

  const handlePreset = (minutes) => {
    setTimer(minutes, 0);
  };

  const handleCustomSet = () => {
    if (customMinutes > 0 || customSeconds > 0) {
      setTimer(customMinutes, customSeconds);
    }
  };

  const m1 = String(displayMinutes).padStart(2, '0')[0];
  const m2 = String(displayMinutes).padStart(2, '0')[1];
  const s1 = String(displaySeconds).padStart(2, '0')[0];
  const s2 = String(displaySeconds).padStart(2, '0')[1];

  return (
    <div className={`timer-wrapper ${timerMode === 'focus' ? `phase-${focusPhase}` : ''}`}>
      
      {/* Mode Toggle (only visible when idle to prevent switching while running) */}
      {isIdle && (
        <div className="timer-mode-toggle">
          <button 
            className={`timer-mode-btn ${timerMode === 'standard' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('standard')}
          >
            Standard Timer
          </button>
          <button 
            className={`timer-mode-btn ${timerMode === 'focus' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('focus')}
          >
            Focus Mode
          </button>
        </div>
      )}

      {/* Focus Mode Header Info */}
      {timerMode === 'focus' && !isIdle && (
        <div className="focus-mode-header">
          <div className="focus-phase-badge">
            {focusPhase === 'focus' && '🍅 Focus Session'}
            {focusPhase === 'shortBreak' && '☕ Short Break'}
            {focusPhase === 'longBreak' && '🌴 Long Break'}
          </div>
          <div className="focus-cycle-info">Session {focusCycle}/4</div>
        </div>
      )}

      {/* Flip card display */}
      <div className={`timer-flip-display ${isFinished ? 'finished' : ''}`}>
        {isIdle ? (
          <div className="timer-idle-display">
            <div className="timer-idle-icon">
              {timerMode === 'focus' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M17 4v16"/><path d="M7 4v16"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="10"/><circle cx="12" cy="14" r="8"/></svg>
              )}
            </div>
            <span className="timer-idle-label">
              {timerMode === 'focus' ? 'READY TO FOCUS?' : 'SET A TIMER'}
            </span>
          </div>
        ) : (
          <>
            {/* Finished overlay */}
            {isFinished && (
              <div className="timer-finished-overlay">
                <span className="timer-finished-text">
                  {timerMode === 'focus' 
                    ? (focusPhase === 'focus' ? 'BREAK TIME!' : 'BACK TO WORK!') 
                    : "TIME'S UP!"}
                </span>
                <button className="timer-dismiss-btn" onClick={dismiss}>
                  {timerMode === 'focus' ? 'Start Next Phase' : 'Dismiss'}
                </button>
              </div>
            )}

            {/* Flip cards for minutes */}
            <div className="timer-flip-section">
              <div className="timer-flip-digits">
                <FlipCard digit={m1} />
                <FlipCard digit={m2} />
              </div>
              <span className="timer-flip-label">MINUTES</span>
            </div>

            {/* Separator */}
            <div className="timer-flip-separator">
              <div className="timer-sep-dot" />
              <div className="timer-sep-dot" />
            </div>

            {/* Flip cards for seconds */}
            <div className="timer-flip-section">
              <div className="timer-flip-digits">
                <FlipCard digit={s1} />
                <FlipCard digit={s2} />
              </div>
              <span className="timer-flip-label">SECONDS</span>
            </div>

            {/* Progress bar */}
            {initialSeconds > 0 && (
              <div className="timer-progress-bar-wrapper">
                <div className="timer-progress-bar">
                  <div
                    className={`timer-progress-fill ${isFinished ? 'finished' : ''}`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="timer-controls">
        {isIdle ? (
          timerMode === 'standard' ? (
            <>
              {/* Presets */}
              <div className="timer-presets">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    className="timer-preset-btn"
                    onClick={() => handlePreset(p.minutes)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="timer-custom">
                <div className="timer-custom-input-group">
                  <label className="timer-custom-label">Min</label>
                  <div className="timer-custom-spinner">
                    <button
                      className="timer-spinner-btn"
                      onClick={() => setCustomMinutes(prev => Math.min(prev + 1, 99))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <input
                      type="number"
                      className="timer-custom-input"
                      value={customMinutes}
                      min={0}
                      max={99}
                      onChange={e => setCustomMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                    />
                    <button
                      className="timer-spinner-btn"
                      onClick={() => setCustomMinutes(prev => Math.max(prev - 1, 0))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>
                </div>
                <span className="timer-custom-colon">:</span>
                <div className="timer-custom-input-group">
                  <label className="timer-custom-label">Sec</label>
                  <div className="timer-custom-spinner">
                    <button
                      className="timer-spinner-btn"
                      onClick={() => setCustomSeconds(prev => (prev + 5) % 60)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <input
                      type="number"
                      className="timer-custom-input"
                      value={customSeconds}
                      min={0}
                      max={59}
                      onChange={e => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    />
                    <button
                      className="timer-spinner-btn"
                      onClick={() => setCustomSeconds(prev => (prev - 5 + 60) % 60)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>
                </div>
                <button className="timer-set-btn" onClick={handleCustomSet}>
                  Set
                </button>
              </div>
            </>
          ) : (
            <div className="focus-mode-start">
               <button className="timer-action-btn start" onClick={handleStartFocus}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                  Start Focus Session
               </button>
            </div>
          )
        ) : !isFinished && (
          <div className="timer-action-buttons">
            {isRunning ? (
              <button className="timer-action-btn pause" onClick={pause}>
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                Pause
              </button>
            ) : (
              <button className="timer-action-btn start" onClick={start}>
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                Resume
              </button>
            )}
            
            {timerMode === 'focus' && (
              <button className="timer-action-btn skip" onClick={skipToNextPhase}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                Skip
              </button>
            )}

            <button className="timer-action-btn reset" onClick={reset}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              Reset
            </button>
            <button className="timer-action-btn clear" onClick={handleStop}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
