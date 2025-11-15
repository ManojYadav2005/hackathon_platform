
"use client";
import React, { useState, useEffect, useCallback } from 'react';

export const Timer = ({ startTime, durationMinutes, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  
  const onTimeUpCallback = useCallback(onTimeUp, [onTimeUp]);

  useEffect(() => {
    if (!startTime) {
      setTimeLeft(null);
      return;
    }

    const endTime = new Date(startTime.toDate()).getTime() + durationMinutes * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        onTimeUpCallback();
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onTimeUpCallback]);

  if (timeLeft === null) {
    return (
      <div className="fixed top-20 right-4 bg-gray-900 p-4 rounded-lg shadow-xl border border-yellow-500 z-50">
        <h4 className="text-lg font-bold text-white">Time Left</h4>
        <p className="text-lg font-mono text-yellow-400">Round not started</p>
      </div>
    );
  }

  if (timeLeft === 0) {
    return (
      <div className="fixed top-20 right-4 bg-gray-900 p-4 rounded-lg shadow-xl border border-red-500 z-50">
        <h4 className="text-lg font-bold text-white">Time Left</h4>
        <p className="text-2xl font-mono text-red-500">Time's Up!</p>
      </div>
    );
  }

  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)));

  return (
    <div className="fixed top-20 right-4 bg-gray-900 p-4 rounded-lg shadow-xl border border-blue-500 z-50">
      <h4 className="text-lg font-bold text-white">Time Left</h4>
      <p className="text-2xl font-mono text-yellow-400">
        {durationMinutes > 60 ? `${String(hours).padStart(2, '0')}:` : null}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
};


