import { useState, useEffect, useRef } from 'react';

export function useTime() {
  const [time, setTime] = useState(new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    // Sync to the next second boundary for precision
    const now = new Date();
    const msToNextSecond = 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setTime(new Date());
      intervalRef.current = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }, msToNextSecond);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return time;
}
