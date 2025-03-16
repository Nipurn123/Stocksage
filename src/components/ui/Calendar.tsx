'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameMonth, isSameDay } from 'date-fns';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from: Date; to?: Date };
  onSelect?: (date: Date | { from: Date; to?: Date }) => void;
  className?: string;
  initialFocus?: boolean;
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className = '',
  initialFocus = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(firstDayOfMonth);
  const endDate = endOfWeek(lastDayOfMonth);

  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleSelectDate = (day: Date) => {
    if (!onSelect) return;

    if (mode === 'single') {
      onSelect(day);
    } else if (mode === 'range') {
      if (!selected) {
        onSelect({ from: day });
      } else if ('from' in selected && !selected.to) {
        if (day < selected.from) {
          onSelect({ from: day, to: selected.from });
        } else {
          onSelect({ from: selected.from, to: day });
        }
      } else {
        onSelect({ from: day });
      }
    }
  };

  const isSelected = (day: Date) => {
    if (!selected) return false;

    if (mode === 'single' && !(selected instanceof Date)) return false;
    if (mode === 'range' && selected instanceof Date) return false;

    if (mode === 'single') {
      return isSameDay(day, selected as Date);
    }

    if (mode === 'range' && 'from' in selected) {
      if (selected.to) {
        return (
          isSameDay(day, selected.from) ||
          isSameDay(day, selected.to) ||
          (day > selected.from && day < selected.to)
        );
      }
      return isSameDay(day, selected.from);
    }

    return false;
  };

  const isRangeStart = (day: Date) => {
    if (!selected || mode !== 'range' || selected instanceof Date) return false;
    if (!('from' in selected)) return false;
    return isSameDay(day, selected.from);
  };

  const isRangeEnd = (day: Date) => {
    if (!selected || mode !== 'range' || selected instanceof Date) return false;
    if (!('from' in selected) || !selected.to) return false;
    return isSameDay(day, selected.to);
  };

  const isInRange = (day: Date) => {
    if (!selected || mode !== 'range' || selected instanceof Date) return false;
    if (!('from' in selected) || !selected.to) {
      if (hoverDate && selected.from) {
        return (
          (day > selected.from && day < hoverDate) ||
          (day < selected.from && day > hoverDate)
        );
      }
      return false;
    }
    return day > selected.from && day < selected.to;
  };

  const handleMouseEnter = (day: Date) => {
    if (mode === 'range' && selected && !('to' in selected)) {
      setHoverDate(day);
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className="flex justify-between mb-2">
        <button
          onClick={handlePreviousMonth}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Previous month"
          type="button"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div className="font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Next month"
          type="button"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
        {daysInMonth.map((day: Date, i: number) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectDate(day)}
            onMouseEnter={() => handleMouseEnter(day)}
            className={`
              h-8 w-8 rounded-md text-sm relative
              ${!isSameMonth(day, currentMonth) ? 'text-gray-400 dark:text-gray-600' : ''}
              ${isToday(day) ? 'border border-primary-500 dark:border-primary-400' : ''}
              ${isSelected(day) ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              ${isRangeStart(day) ? 'rounded-l-md' : ''}
              ${isRangeEnd(day) ? 'rounded-r-md' : ''}
              ${isInRange(day) ? 'bg-primary-100 dark:bg-primary-900' : ''}
            `}
            tabIndex={initialFocus && i === 0 ? 0 : -1}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}
