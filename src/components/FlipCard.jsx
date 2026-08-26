import { useState, useEffect, useRef } from 'react';
import './FlipCard.css';

export default function FlipCard({ digit }) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setCurrentDigit(digit);
      setPreviousDigit(digit);
      return;
    }

    if (digit !== currentDigit) {
      setPreviousDigit(currentDigit);
      setCurrentDigit(digit);
      setIsFlipping(true);

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 600); // exactly matches CSS animation duration

      return () => clearTimeout(timer);
    }
  }, [digit]);

  return (
    <div className={`flip-card ${isFlipping ? 'flipping' : ''}`}>
      {/* STATIC BACKS: these are always visible and act as the base card */}
      
      {/* Upper back: always shows the NEW digit */}
      <div className="flip-card-upper-back">
        <div className="flip-card-inner upper">
          <span>{currentDigit}</span>
        </div>
      </div>
      
      {/* Lower back: shows OLD digit during flip, then NEW digit when resting */}
      <div className="flip-card-lower-back">
        <div className="flip-card-inner lower">
          <span>{isFlipping ? previousDigit : currentDigit}</span>
        </div>
      </div>

      {/* ANIMATED FLAP: a single element that falls from top to bottom */}
      {isFlipping && (
        <div className="flip-card-flap">
          {/* Front of flap: shows OLD digit (folds down away from viewer) */}
          <div className="flip-card-flap-front">
            <div className="flip-card-inner upper">
              <span>{previousDigit}</span>
            </div>
            <div className="flip-card-shadow-front" />
          </div>
          
          {/* Back of flap: shows NEW digit (revealed as flap lands on bottom) */}
          <div className="flip-card-flap-back">
            <div className="flip-card-inner lower">
              <span>{currentDigit}</span>
            </div>
            <div className="flip-card-shadow-back" />
          </div>
        </div>
      )}

      {/* Center divider line with notches */}
      <div className="flip-card-divider" />
    </div>
  );
}
