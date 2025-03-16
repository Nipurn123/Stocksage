'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';

// Define our own DateRange type to match what's used in the app
interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value?: { from: Date; to: Date } | undefined;
  onChange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date } | undefined>>;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} -{' '}
                  {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <p className="text-center mb-4">Date Range Picker</p>
            <div className="flex flex-col space-y-2">
              <label>From:</label>
              <input 
                type="date" 
                value={value?.from ? format(value.from, 'yyyy-MM-dd') : ''} 
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                  if (newDate) {
                    onChange(prev => ({
                      from: newDate,
                      to: prev?.to || newDate
                    }));
                  }
                }}
                className="border p-2 rounded"
              />
              
              <label>To:</label>
              <input 
                type="date" 
                value={value?.to ? format(value.to, 'yyyy-MM-dd') : ''} 
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                  if (newDate) {
                    onChange(prev => ({
                      from: prev?.from || newDate,
                      to: newDate
                    }));
                  }
                }}
                className="border p-2 rounded"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 