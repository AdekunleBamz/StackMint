'use client';

/**
 * Slider Component
 * Range input slider with optional range selection
 * @module components/Slider
 * @version 1.0.0
 */

import { useState, useRef, useCallback, memo, useEffect } from 'react';

interface SliderProps {
  value: number | [number, number];
  onChange: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  showMinMax?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  range?: boolean;
  className?: string;
}

function SliderComponent({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  showMinMax = false,
  formatValue = (v) => v.toString(),
  disabled = false,
  range = false,
  className = '',
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  // Normalize value to array for internal processing
  const values = Array.isArray(value) ? value : [min, value];
  const [minValue, maxValue] = values;

  // Calculate percentage for positioning
  const getPercent = (v: number) => ((v - min) / (max - min)) * 100;

  // Calculate value from mouse position
  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  // Handle mouse/touch events
  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(clientX);

      if (range) {
        if (isDragging === 'min') {
          onChange([Math.min(newValue, maxValue - step), maxValue]);
        } else {
          onChange([minValue, Math.max(newValue, minValue + step)]);
        }
      } else {
        onChange(newValue);
      }
    },
    [isDragging, getValueFromPosition, range, minValue, maxValue, step, onChange]
  );

  // Set up event listeners for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleEnd = () => setIsDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled) return;

    const newValue = getValueFromPosition(e.clientX);

    if (range) {
      // Determine which handle to move based on proximity
      const distToMin = Math.abs(newValue - minValue);
      const distToMax = Math.abs(newValue - maxValue);

      if (distToMin < distToMax) {
        onChange([Math.min(newValue, maxValue - step), maxValue]);
      } else {
        onChange([minValue, Math.max(newValue, minValue + step)]);
      }
    } else {
      onChange(newValue);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    handle: 'min' | 'max'
  ) => {
    if (disabled) return;

    let newValue: number;
    const currentValue = handle === 'min' ? minValue : maxValue;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, currentValue - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, currentValue + step);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      default:
        return;
    }

    e.preventDefault();

    if (range) {
      if (handle === 'min') {
        onChange([Math.min(newValue, maxValue - step), maxValue]);
      } else {
        onChange([minValue, Math.max(newValue, minValue + step)]);
      }
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header with label and value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-3">
          {label && (
            <label className="text-sm font-medium text-gray-300">{label}</label>
          )}
          {showValue && (
            <span className="text-sm font-mono text-purple-400">
              {range
                ? `${formatValue(minValue)} - ${formatValue(maxValue)}`
                : formatValue(maxValue)}
            </span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={`
          relative h-2 rounded-full bg-gray-700 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Active track fill */}
        <div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"
          style={{
            left: range ? `${getPercent(minValue)}%` : '0%',
            right: `${100 - getPercent(maxValue)}%`,
          }}
        />

        {/* Min handle (for range) */}
        {range && (
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={maxValue - step}
            aria-valuenow={minValue}
            aria-label="Minimum value"
            onMouseDown={() => !disabled && setIsDragging('min')}
            onTouchStart={() => !disabled && setIsDragging('min')}
            onKeyDown={(e) => handleKeyDown(e, 'min')}
            className={`
              absolute top-1/2 -translate-y-1/2 -translate-x-1/2
              w-5 h-5 rounded-full bg-white shadow-lg
              border-2 border-purple-500
              transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50
              ${isDragging === 'min' ? 'scale-125' : ''}
              ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
            `}
            style={{ left: `${getPercent(minValue)}%` }}
          />
        )}

        {/* Max handle */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={range ? minValue + step : min}
          aria-valuemax={max}
          aria-valuenow={maxValue}
          aria-label={range ? 'Maximum value' : 'Value'}
          onMouseDown={() => !disabled && setIsDragging('max')}
          onTouchStart={() => !disabled && setIsDragging('max')}
          onKeyDown={(e) => handleKeyDown(e, 'max')}
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 rounded-full bg-white shadow-lg
            border-2 border-purple-500
            transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50
            ${isDragging === 'max' ? 'scale-125' : ''}
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
          `}
          style={{ left: `${getPercent(maxValue)}%` }}
        />
      </div>

      {/* Min/Max labels */}
      {showMinMax && (
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}

export default memo(SliderComponent);
