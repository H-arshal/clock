import { useState, useEffect, useCallback, useRef } from 'react';

const ALARM_STORAGE_KEY = 'flipclock-alarm';

function loadAlarm() {
  try {
    const stored = localStorage.getItem(ALARM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return { enabled: false, hour: 9, minute: 0, day: null };
}

function saveAlarm(alarm) {
  localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarm));
}

export function useAlarm(currentTime, isMuted = false) {
  const [alarm, setAlarm] = useState(loadAlarm);
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef(null);
  const lastFiredRef = useRef(null);

  // Save alarm changes to localStorage
  useEffect(() => {
    saveAlarm(alarm);
  }, [alarm]);

  // Check if alarm should fire
  useEffect(() => {
    if (!alarm.enabled || isRinging || isMuted) return;

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const day = currentTime.getDay();

    // Check if alarm matches (only fire once per minute)
    const timeKey = `${hours}:${minutes}`;
    if (
      hours === alarm.hour &&
      minutes === alarm.minute &&
      seconds === 0 &&
      (alarm.day === null || alarm.day === day) &&
      lastFiredRef.current !== timeKey
    ) {
      lastFiredRef.current = timeKey;
      setIsRinging(true);

      // Play alarm sound
      try {
        // Generate a beep using Web Audio API
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (startTime) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        };
        // Play 3 beeps
        for (let i = 0; i < 3; i++) {
          playBeep(ctx.currentTime + i * 0.5);
        }
        audioRef.current = ctx;
      } catch (e) {
        // Audio not available
      }

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Alarm!', {
          body: `It's ${formatAlarmTime(alarm.hour, alarm.minute)}`,
          icon: '⏰'
        });
      }
    }
  }, [currentTime, alarm, isRinging]);

  const dismissAlarm = useCallback(() => {
    setIsRinging(false);
    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }
  }, []);

  const updateAlarm = useCallback((updates) => {
    setAlarm(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleAlarm = useCallback(() => {
    setAlarm(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    alarm,
    isRinging,
    dismissAlarm,
    updateAlarm,
    toggleAlarm,
    requestNotificationPermission
  };
}

function formatAlarmTime(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m} ${period}`;
}
