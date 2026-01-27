'use client';

/**
 * RangeSlider Component
 * Dual-handle range slider for price and value ranges
 * @module components/RangeSlider
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Types
interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  showInputs?: boolean;
  showTooltip?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Main RangeSlider Component
 */
export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue = (v) => String(v),
  showInputs = false,
  showTooltip = true,
  disabled = false,
  className = '',
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Calculate percentage for positioning
  const getPercent = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  // Get value from mouse position
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

  // Handle thumb drag
  const handleMouseDown = useCallback(
    (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setActiveThumb(thumb);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newValue = getValueFromPosition(moveEvent.clientX);

        setLocalValue((prev) => {
          if (thumb === 'min') {
            const newMin = Math.min(newValue, prev[1] - step);
            return [newMin, prev[1]];
          } else {
            const newMax = Math.max(newValue, prev[0] + step);
            return [prev[0], newMax];
          }
        });
      };

      const handleMouseUp = () => {
        setActiveThumb(null);
        onChange(localValue);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, getValueFromPosition, step, onChange, localValue]
  );

  // Handle touch events
  const handleTouchStart = useCallback(
    (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
      if (disabled) return;
      setActiveThumb(thumb);

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const touch = moveEvent.touches[0];
        const newValue = getValueFromPosition(touch.clientX);

        setLocalValue((prev) => {
          if (thumb === 'min') {
            const newMin = Math.min(newValue, prev[1] - step);
            return [newMin, prev[1]];
          } else {
            const newMax = Math.max(newValue, prev[0] + step);
            return [prev[0], newMax];
          }
        });
      };

      const handleTouchEnd = () => {
        setActiveThumb(null);
        onChange(localValue);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    },
    [disabled, getValueFromPosition, step, onChange, localValue]
  );

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled) return;

    const clickValue = getValueFromPosition(e.clientX);
    const distToMin = Math.abs(clickValue - localValue[0]);
    const distToMax = Math.abs(clickValue - localValue[1]);

    if (distToMin <= distToMax) {
      const newMin = Math.min(clickValue, localValue[1] - step);
      const newValue: [number, number] = [newMin, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    } else {
      const newMax = Math.max(clickValue, localValue[0] + step);
      const newValue: [number, number] = [localValue[0], newMax];
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  // Handle input changes
  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;

    if (type === 'min') {
      const newMin = Math.max(min, Math.min(numValue, localValue[1] - step));
      const newValue: [number, number] = [newMin, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    } else {
      const newMax = Math.min(max, Math.max(numValue, localValue[0] + step));
      const newValue: [number, number] = [localValue[0], newMax];
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  return (
    <div className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-sm text-zinc-400">
            {formatValue(localValue[0])} - {formatValue(localValue[1])}
          </span>
        </div>
      )}

      {/* Slider */}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute w-full h-2 bg-zinc-700 rounded-full cursor-pointer"
        >
          {/* Active range */}
          <div
            className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min thumb */}
        <div
          className="absolute z-10 -translate-x-1/2"
          style={{ left: `${minPercent}%` }}
        >
          <button
            type="button"
            onMouseDown={handleMouseDown('min')}
            onTouchStart={handleTouchStart('min')}
            disabled={disabled}
            className={`
              w-5 h-5 rounded-full bg-white shadow-lg border-2
              transition-transform cursor-grab active:cursor-grabbing
              ${activeThumb === 'min' ? 'scale-125 border-purple-500' : 'border-purple-400'}
              ${disabled ? 'cursor-not-allowed' : 'hover:scale-110'}
            `}
          />

          {/* Tooltip */}
          {showTooltip && activeThumb === 'min' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap">
              {formatValue(localValue[0])}
            </div>
          )}
        </div>

        {/* Max thumb */}
        <div
          className="absolute z-10 -translate-x-1/2"
          style={{ left: `${maxPercent}%` }}
        >
          <button
            type="button"
            onMouseDown={handleMouseDown('max')}
            onTouchStart={handleTouchStart('max')}
            disabled={disabled}
            className={`
              w-5 h-5 rounded-full bg-white shadow-lg border-2
              transition-transform cursor-grab active:cursor-grabbing
              ${activeThumb === 'max' ? 'scale-125 border-purple-500' : 'border-purple-400'}
              ${disabled ? 'cursor-not-allowed' : 'hover:scale-110'}
            `}
          />

          {/* Tooltip */}
          {showTooltip && activeThumb === 'max' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap">
              {formatValue(localValue[1])}
            </div>
          )}
        </div>
      </div>

      {/* Input fields */}
      {showInputs && (
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 mb-1 block">Min</label>
            <input
              type="number"
              value={localValue[0]}
              onChange={(e) => handleInputChange('min', e.target.value)}
              min={min}
              max={localValue[1] - step}
              step={step}
              disabled={disabled}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="text-zinc-500 mt-5">to</span>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 mb-1 block">Max</label>
            <input
              type="number"
              value={localValue[1]}
              onChange={(e) => handleInputChange('max', e.target.value)}
              min={localValue[0] + step}
              max={max}
              step={step}
              disabled={disabled}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Price Range Slider
 */
interface PriceRangeProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
  className?: string;
}

export function PriceRange({
  value,
  onChange,
  currency = 'STX',
  className = '',
}: PriceRangeProps) {
  return (
    <RangeSlider
      min={0}
      max={1000}
      step={1}
      value={value}
      onChange={onChange}
      label="Price Range"
      formatValue={(v) => `${v} ${currency}`}
      showInputs
      className={className}
    />
  );
}

/**
 * Simple Slider (single value)
 */
interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue = (v) => String(v),
  showValue = true,
  disabled = false,
  className = '',
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const percent = ((localValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-white">{label}</span>}
          {showValue && (
            <span className="text-sm text-purple-400 font-medium">
              {formatValue(localValue)}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 appearance-none bg-zinc-700 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-purple-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform"
          style={{
            background: `linear-gradient(to right, #8b5cf6 ${percent}%, #3f3f46 ${percent}%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

/**
 * Royalty Slider
 */
interface RoyaltySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function RoyaltySlider({ value, onChange, className = '' }: RoyaltySliderProps) {
  return (
    <Slider
      min={0}
      max={10}
      step={0.5}
      value={value}
      onChange={onChange}
      label="Royalty Percentage"
      formatValue={(v) => `${v}%`}
      className={className}
    />
  );
}

export default RangeSlider;
