'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Period {
  id: string;
  label: string;
}

interface BalanceSheetControlsProps {
  periods: Period[];
  selectedPeriod: string;
  comparisonPeriod: string | null;
  onPeriodChange: (period: string) => void;
  onComparisonChange: (period: string | null) => void;
}

export default function BalanceSheetControls({
  periods,
  selectedPeriod,
  comparisonPeriod,
  onPeriodChange,
  onComparisonChange,
}: BalanceSheetControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Period
          </label>
          <div className="relative">
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="showComparison"
            type="checkbox"
            checked={comparisonPeriod !== null}
            onChange={() => onComparisonChange(comparisonPeriod === null ? periods.find(p => p.id !== selectedPeriod)?.id || null : null)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="showComparison" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Compare with
          </label>
        </div>
        
        {comparisonPeriod !== null && (
          <div className="relative">
            <select
              value={comparisonPeriod}
              onChange={(e) => onComparisonChange(e.target.value)}
              className="pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              aria-label="Comparison period"
            >
              {periods
                .filter(period => period.id !== selectedPeriod)
                .map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Use the tabs below to switch between views</span>
      </div>
    </div>
  );
} 