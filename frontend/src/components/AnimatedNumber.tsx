'use client';

/**
 * AnimatedNumber Component
 * Animated number transitions with formatting support
 * @module components/AnimatedNumber
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  separator?: string;
  easing?: 'linear' | 'easeOut' | 'easeIn' | 'easeInOut' | 'spring';
}

const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => Math.pow(t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export function AnimatedNumber({
  value,
  duration = 1000,
  formatFn,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
  separator = ',',
  easing = 'easeOut',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    
    if (startValue === endValue) return;

    const easingFn = easingFunctions[easing];

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
        startTimeRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, easing]);

  // Format the number
  const formatNumber = (num: number): string => {
    if (formatFn) {
      return formatFn(num);
    }

    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    
    // Add thousand separators
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  };

  return (
    <span className={className}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

/**
 * Animated STX price display
 */
interface AnimatedSTXProps {
  value: number;
  duration?: number;
  className?: string;
  showSymbol?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedSTX({
  value,
  duration = 800,
  className = '',
  showSymbol = true,
  size = 'md',
}: AnimatedSTXProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
      {showSymbol && (
        <span className="text-primary-400">STX</span>
      )}
      <AnimatedNumber
        value={value}
        duration={duration}
        decimals={2}
        easing="easeOut"
        className="font-mono tabular-nums"
      />
    </div>
  );
}

/**
 * Animated percentage display
 */
interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  className?: string;
  showSign?: boolean;
  colorCoded?: boolean;
}

export function AnimatedPercentage({
  value,
  duration = 600,
  className = '',
  showSign = true,
  colorCoded = true,
}: AnimatedPercentageProps) {
  const isPositive = value >= 0;
  const colorClass = colorCoded
    ? isPositive
      ? 'text-green-500'
      : 'text-red-500'
    : '';

  return (
    <span className={`${colorClass} ${className}`}>
      {showSign && isPositive && '+'}
      <AnimatedNumber
        value={value}
        duration={duration}
        decimals={2}
        easing="easeOut"
      />
      %
    </span>
  );
}

/**
 * Countdown display with animation
 */
interface AnimatedCountdownProps {
  endTime: Date;
  className?: string;
  onComplete?: () => void;
  format?: 'full' | 'compact' | 'minimal';
}

export function AnimatedCountdown({
  endTime,
  className = '',
  onComplete,
  format = 'full',
}: AnimatedCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      
      if (difference <= 0) {
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 rounded-lg px-3 py-2 min-w-[48px] text-center">
        <span className="text-2xl font-mono tabular-nums text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      {format !== 'minimal' && (
        <span className="text-xs text-gray-500 mt-1">{label}</span>
      )}
    </div>
  );

  if (format === 'compact') {
    return (
      <div className={`font-mono tabular-nums ${className}`}>
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="Days" />}
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl text-gray-600">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="text-2xl text-gray-600">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

export default AnimatedNumber;
