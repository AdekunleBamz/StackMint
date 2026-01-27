'use client';

/**
 * CountdownTimer Component
 * Animated countdown for auctions and time-limited events
 * @module components/CountdownTimer
 * @version 1.0.0
 */

import { useState, useEffect, memo, useCallback } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownTimerProps {
  endTime: Date | string | number;
  onExpire?: () => void;
  variant?: 'default' | 'compact' | 'large' | 'minimal';
  showLabels?: boolean;
  showDays?: boolean;
  className?: string;
}

function calculateTimeLeft(endTime: Date): TimeLeft {
  const difference = +endTime - +new Date();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function CountdownTimerComponent({
  endTime,
  onExpire,
  variant = 'default',
  showLabels = true,
  showDays = true,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(new Date(endTime))
  );
  const [hasExpired, setHasExpired] = useState(false);

  const updateTimer = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(new Date(endTime));
    setTimeLeft(newTimeLeft);
    
    if (newTimeLeft.total <= 0 && !hasExpired) {
      setHasExpired(true);
      onExpire?.();
    }
  }, [endTime, onExpire, hasExpired]);

  useEffect(() => {
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [updateTimer]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Get urgency level for styling
  const getUrgencyClass = () => {
    if (timeLeft.total <= 60000) return 'text-red-400 animate-pulse'; // < 1 min
    if (timeLeft.total <= 300000) return 'text-orange-400'; // < 5 min
    if (timeLeft.total <= 3600000) return 'text-yellow-400'; // < 1 hour
    return 'text-white';
  };

  if (hasExpired) {
    return (
      <div className={`text-red-400 font-semibold ${className}`}>
        Expired
      </div>
    );
  }

  // Minimal variant - just text
  if (variant === 'minimal') {
    const parts = [];
    if (showDays && timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${formatNumber(timeLeft.hours)}h`);
    parts.push(`${formatNumber(timeLeft.minutes)}m`);
    parts.push(`${formatNumber(timeLeft.seconds)}s`);
    
    return (
      <span className={`font-mono ${getUrgencyClass()} ${className}`}>
        {parts.join(' ')}
      </span>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 font-mono text-sm ${getUrgencyClass()} ${className}`}>
        {showDays && timeLeft.days > 0 && (
          <>
            <span className="bg-gray-800 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.days)}</span>
            <span className="text-gray-500">:</span>
          </>
        )}
        <span className="bg-gray-800 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.hours)}</span>
        <span className="text-gray-500">:</span>
        <span className="bg-gray-800 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-gray-500">:</span>
        <span className="bg-gray-800 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.seconds)}</span>
      </div>
    );
  }

  // Large variant
  if (variant === 'large') {
    const timeUnits = [
      { value: timeLeft.days, label: 'Days', show: showDays },
      { value: timeLeft.hours, label: 'Hours', show: true },
      { value: timeLeft.minutes, label: 'Minutes', show: true },
      { value: timeLeft.seconds, label: 'Seconds', show: true },
    ].filter(unit => unit.show && (unit.value > 0 || unit.label !== 'Days'));

    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-4xl md:text-5xl font-bold font-mono ${getUrgencyClass()}`}>
                {formatNumber(unit.value)}
              </div>
              {showLabels && (
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                  {unit.label}
                </div>
              )}
            </div>
            {index < timeUnits.length - 1 && (
              <span className="text-3xl text-gray-600 animate-pulse">:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  const timeUnits = [
    { value: timeLeft.days, label: 'D', show: showDays && timeLeft.days > 0 },
    { value: timeLeft.hours, label: 'H', show: true },
    { value: timeLeft.minutes, label: 'M', show: true },
    { value: timeLeft.seconds, label: 'S', show: true },
  ].filter(unit => unit.show);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={`
              w-12 h-12 flex items-center justify-center
              bg-gray-800 border border-gray-700 rounded-lg
              font-mono text-lg font-bold ${getUrgencyClass()}
            `}>
              {formatNumber(unit.value)}
            </div>
            {showLabels && (
              <span className="text-xs text-gray-500 mt-1">{unit.label}</span>
            )}
          </div>
          {index < timeUnits.length - 1 && (
            <span className={`text-xl font-bold ${getUrgencyClass()} -mt-5`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(CountdownTimerComponent);
