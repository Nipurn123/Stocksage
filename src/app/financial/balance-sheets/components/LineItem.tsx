'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface LineItemProps {
  name: string;
  amount: number;
  comparisonAmount?: number;
  isTotal?: boolean;
  indentLevel?: number;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  formatCurrency: (amount: number) => string;
  showComparison: boolean;
}

export default function LineItem({
  name,
  amount,
  comparisonAmount,
  isTotal = false,
  indentLevel = 0,
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
  formatCurrency,
  showComparison,
}: LineItemProps) {
  const difference = comparisonAmount !== undefined ? amount - comparisonAmount : undefined;
  const percentChange = comparisonAmount !== undefined && comparisonAmount !== 0
    ? ((amount - comparisonAmount) / comparisonAmount) * 100
    : undefined;
  
  return (
    <div 
      className={`
        flex justify-between py-2 
        ${isTotal ? 'font-bold border-t border-b dark:border-gray-700' : ''}
        ${isExpandable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
        transition-colors duration-150
      `}
      onClick={isExpandable ? onToggleExpand : undefined}
    >
      <div className="flex items-center" style={{ paddingLeft: `${indentLevel * 1.5}rem` }}>
        {isExpandable && (
          <span className="mr-2">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
        <span>{name}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className={isTotal ? 'font-bold' : ''}>{formatCurrency(amount)}</span>
        
        {showComparison && difference !== undefined && percentChange !== undefined && (
          <div className="flex items-center">
            <span className={`text-sm ${difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {difference >= 0 ? '+' : ''}{formatCurrency(difference)} 
              ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 