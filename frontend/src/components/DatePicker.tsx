'use client';

/**
 * DatePicker Component
 * Date and time selection with calendar
 * @module components/DatePicker
 * @version 1.0.0
 */

import { memo, useState, useCallback, useMemo } from 'react';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showTime?: boolean;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function DatePickerComponent({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  showTime = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [time, setTime] = useState({
    hours: value?.getHours() || 12,
    minutes: value?.getMinutes() || 0,
  });

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }
    
    return days;
  }, [viewDate]);

  const isDateDisabled = useCallback((day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return false;
  }, [viewDate, minDate, maxDate]);

  const isToday = useCallback((day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  }, [viewDate]);

  const isSelected = useCallback((day: number) => {
    if (!value) return false;
    return (
      day === value.getDate() &&
      viewDate.getMonth() === value.getMonth() &&
      viewDate.getFullYear() === value.getFullYear()
    );
  }, [value, viewDate]);

  const handleDayClick = useCallback((day: number) => {
    if (isDateDisabled(day)) return;
    
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (showTime) {
      newDate.setHours(time.hours, time.minutes);
    }
    onChange?.(newDate);
    if (!showTime) {
      setIsOpen(false);
    }
  }, [viewDate, showTime, time, onChange, isDateDisabled]);

  const handleMonthChange = useCallback((delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const handleYearChange = useCallback((delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear() + delta, prev.getMonth(), 1));
  }, []);

  const handleTimeChange = useCallback((type: 'hours' | 'minutes', value: number) => {
    setTime(prev => ({ ...prev, [type]: value }));
    if (value && onChange) {
      const newDate = new Date(value);
      newDate.setHours(type === 'hours' ? value : time.hours);
      newDate.setMinutes(type === 'minutes' ? value : time.minutes);
      onChange(newDate);
    }
  }, [onChange, time.hours, time.minutes]);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' }),
    };
    return date.toLocaleDateString('en-US', options);
  }, [showTime]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          bg-gray-800/50 border border-gray-700
          text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
          ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}
        `}
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto p-1 hover:bg-gray-700 rounded-full"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 z-50 p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => handleYearChange(-1)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleYearChange(1)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day !== null && (
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={isDateDisabled(day)}
                      className={`
                        w-full h-full flex items-center justify-center rounded-lg text-sm
                        transition-all
                        ${isSelected(day) 
                          ? 'bg-purple-600 text-white font-semibold' 
                          : isToday(day)
                            ? 'bg-gray-800 text-purple-400 font-semibold'
                            : 'hover:bg-gray-800 text-gray-300'
                        }
                        ${isDateDisabled(day) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Time Picker */}
            {showTime && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-center gap-2">
                  <select
                    value={time.hours}
                    onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-xl font-bold">:</span>
                  <select
                    value={time.minutes}
                    onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Quick Select */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  onChange?.(today);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onChange?.(tomorrow);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange?.(null);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * DateRangePicker Component
 */
interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<Date | null>(startDate || null);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate || null);

  const formatRange = () => {
    if (!startDate && !endDate) return placeholder;
    const format = (d: Date | null) => d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '...';
    return `${format(startDate)} → ${format(endDate)}`;
  };

  const handleDateSelect = (date: Date) => {
    if (selecting === 'start') {
      setTempStart(date);
      setSelecting('end');
    } else {
      if (tempStart && date < tempStart) {
        setTempEnd(tempStart);
        setTempStart(date);
      } else {
        setTempEnd(date);
      }
      onChange?.({ start: tempStart, end: date });
      setIsOpen(false);
      setSelecting('start');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl
          bg-gray-800/50 border border-gray-700
          text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
          ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}
        `}
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={startDate || endDate ? 'text-white' : 'text-gray-400'}>
          {formatRange()}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
            <div className="mb-3 text-sm text-gray-400 text-center">
              {selecting === 'start' ? 'Select start date' : 'Select end date'}
            </div>
            <DatePickerComponent
              value={selecting === 'start' ? tempStart : tempEnd}
              onChange={(date) => date && handleDateSelect(date)}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default memo(DatePickerComponent);
