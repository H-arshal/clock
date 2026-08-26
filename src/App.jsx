import { useState, useEffect } from 'react';
import FlipClock from './components/FlipClock';
import Timer from './components/Timer';
import DateDisplay from './components/DateDisplay';
import AlarmDisplay from './components/AlarmDisplay';
import FormatToggle from './components/FormatToggle';
import { useTime } from './hooks/useTime';
import { useAlarm } from './hooks/useAlarm';
import { useTimer } from './hooks/useTimer';
import './App.css';

const FORMAT_STORAGE_KEY = 'flipclock-format';
const VIEW_STORAGE_KEY = 'flipclock-view';

function App() {
  const time = useTime();
  const [is24Hour, setIs24Hour] = useState(() => {
    try {
      return localStorage.getItem(FORMAT_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) || 'clock';
    } catch {
      return 'clock';
    }
  });

  const timer = useTimer();

  const {
    alarm,
    isRinging,
    dismissAlarm,
    updateAlarm,
    toggleAlarm,
    requestNotificationPermission
  } = useAlarm(time, timer.timerMode === 'focus' && timer.totalSeconds > 0);

  // Persist format preference
  useEffect(() => {
    localStorage.setItem(FORMAT_STORAGE_KEY, is24Hour);
  }, [is24Hour]);

  // Persist view preference
  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, activeView);
  }, [activeView]);

  // Derive display values
  const rawHours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const period = rawHours >= 12 ? 'PM' : 'AM';
  const displayHours = is24Hour ? rawHours : (rawHours % 12 || 12);

  return (
    <div className={`app ${activeView === 'timer' && timer.timerMode === 'focus' ? `focus-mode phase-${timer.focusPhase}` : ''}`}>
      {/* Ambient background effects */}
      <div className="bg-gradient bg-gradient-1" />
      <div className="bg-gradient bg-gradient-2" />
      <div className="bg-noise" />

      {/* Top bar */}
      <header className="top-bar">
        <DateDisplay date={time} />
        <AlarmDisplay
          alarm={alarm}
          isRinging={isRinging}
          onToggle={toggleAlarm}
          onUpdate={updateAlarm}
          onDismiss={dismissAlarm}
          onRequestPermission={requestNotificationPermission}
        />
      </header>

      {/* View Tabs */}
      <nav className="view-tabs">
        <button
          className={`view-tab ${activeView === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveView('clock')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Clock
        </button>
        <button
          className={`view-tab ${activeView === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveView('timer')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="2" x2="14" y2="2" />
            <line x1="12" y1="14" x2="12" y2="10" />
            <circle cx="12" cy="14" r="8" />
          </svg>
          Timer
          {timer.isRunning && <span className="view-tab-badge" />}
        </button>
      </nav>

      {/* Main content */}
      <main className="clock-container">
        {activeView === 'clock' ? (
          <FlipClock
            hours={displayHours}
            minutes={minutes}
            seconds={seconds}
            is24Hour={is24Hour}
            period={period}
          />
        ) : (
          <Timer
            timerMode={timer.timerMode}
            focusPhase={timer.focusPhase}
            focusCycle={timer.focusCycle}
            displayMinutes={timer.displayMinutes}
            displaySeconds={timer.displaySeconds}
            totalSeconds={timer.totalSeconds}
            initialSeconds={timer.initialSeconds}
            isRunning={timer.isRunning}
            isFinished={timer.isFinished}
            progress={timer.progress}
            setTimer={timer.setTimer}
            setMode={timer.setMode}
            startFocus={timer.startFocus}
            skipToNextPhase={timer.skipToNextPhase}
            start={timer.start}
            pause={timer.pause}
            reset={timer.reset}
            clear={timer.clear}
            dismiss={timer.dismiss}
          />
        )}
      </main>

      {/* Bottom bar */}
      <footer className="bottom-bar">
        <div className="brand-label">FLIP CLOCK</div>
        {activeView === 'clock' && (
          <FormatToggle
            is24Hour={is24Hour}
            onToggle={() => setIs24Hour(prev => !prev)}
          />
        )}
      </footer>
    </div>
  );
}

export default App;
