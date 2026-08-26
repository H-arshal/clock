import { useState, useEffect, useRef, useCallback } from 'react';

const FOCUS_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const CYCLES_BEFORE_LONG_BREAK = 4;

export function useTimer() {
  const [timerMode, setTimerMode] = useState('standard'); // 'standard' | 'focus'
  const [focusPhase, setFocusPhase] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [focusCycle, setFocusCycle] = useState(1);

  const [totalSeconds, setTotalSeconds] = useState(0); // total countdown seconds remaining
  const [initialSeconds, setInitialSeconds] = useState(0); // what was originally set
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Tick down every second
  useEffect(() => {
    if (!isRunning || totalSeconds <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          playFinishSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const playFinishSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (startTime, freq, duration = 0.4) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (timerMode === 'focus') {
        // Silent in focus mode
        return;
      }

      // Standard beep
      playBeep(ctx.currentTime, 660);
      playBeep(ctx.currentTime + 0.5, 880);
      playBeep(ctx.currentTime + 1.0, 1100);
      playBeep(ctx.currentTime + 1.5, 880);
      playBeep(ctx.currentTime + 2.0, 1100);
      
      audioRef.current = ctx;
    } catch (e) {
      // Audio not available
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      if (timerMode === 'focus') {
        // No notifications in focus mode
        return;
      }
      
      new Notification('⏱️ Timer Finished!', {
        body: 'Your countdown timer has reached zero.',
      });
    }
  };

  const setTimer = useCallback((minutes, seconds = 0) => {
    const total = minutes * 60 + seconds;
    setTotalSeconds(total);
    setInitialSeconds(total);
    setIsRunning(false);
    setIsFinished(false);
  }, []);

  const setMode = useCallback((mode) => {
    setTimerMode(mode);
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(0);
    setInitialSeconds(0);
  }, []);

  const startFocus = useCallback(() => {
    setTimerMode('focus');
    setFocusPhase('focus');
    setFocusCycle(1);
    const total = FOCUS_MINUTES * 60;
    setTotalSeconds(total);
    setInitialSeconds(total);
    setIsRunning(true);
    setIsFinished(false);
  }, []);

  const skipToNextPhase = useCallback(() => {
    if (timerMode !== 'focus') return;
    
    setIsFinished(false);
    let nextPhase = focusPhase;
    let nextCycle = focusCycle;
    let nextTotal = 0;
    
    if (focusPhase === 'focus') {
      // Focus -> Break
      if (focusCycle >= CYCLES_BEFORE_LONG_BREAK) {
        nextPhase = 'longBreak';
        nextTotal = LONG_BREAK_MINUTES * 60;
      } else {
        nextPhase = 'shortBreak';
        nextTotal = SHORT_BREAK_MINUTES * 60;
      }
    } else {
      // Break -> Focus
      nextPhase = 'focus';
      if (focusPhase === 'longBreak') {
        nextCycle = 1;
      } else {
        nextCycle = focusCycle + 1;
      }
      nextTotal = FOCUS_MINUTES * 60;
    }

    setFocusPhase(nextPhase);
    setFocusCycle(nextCycle);
    setTotalSeconds(nextTotal);
    setInitialSeconds(nextTotal);
    setIsRunning(true); // Auto-start the next phase
  }, [timerMode, focusPhase, focusCycle]);

  const start = useCallback(() => {
    if (totalSeconds > 0) {
      setIsRunning(true);
      setIsFinished(false);
    }
  }, [totalSeconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(initialSeconds);
  }, [initialSeconds]);

  const clear = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(0);
    setInitialSeconds(0);
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    setIsFinished(false);
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }
    // Auto transition to next phase after dismissing if in focus mode
    if (timerMode === 'focus') {
      skipToNextPhase();
    }
  }, [timerMode, skipToNextPhase]);

  // Derived values
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;
  const progress = initialSeconds > 0 ? (initialSeconds - totalSeconds) / initialSeconds : 0;

  return {
    timerMode,
    focusPhase,
    focusCycle,
    totalSeconds,
    displayMinutes,
    displaySeconds,
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
  };
}
