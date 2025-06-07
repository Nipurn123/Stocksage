'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { FileText } from 'lucide-react';

interface FinancialRatiosProps {
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
  totalLiabilities: number;
  totalEquity: number;
  formatCurrency: (amount: number) => string;
}

export default function FinancialRatios({
  totalCurrentAssets,
  totalCurrentLiabilities,
  totalLiabilities,
  totalEquity,
  formatCurrency,
}: FinancialRatiosProps) {
  const currentRatio = totalCurrentLiabilities > 0 
    ? (totalCurrentAssets / totalCurrentLiabilities) 
    : 0;
  
  const debtToEquity = totalEquity > 0 
    ? (totalLiabilities / totalEquity) 
    : 0;
  
  const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
  
  const ratios = [
    {
      name: 'Current Ratio',
      value: currentRatio.toFixed(2),
      description: 'Ideal: 1.5 - 3.0',
      tooltip: 'Current Assets / Current Liabilities',
      status: currentRatio >= 1.5 && currentRatio <= 3.0 ? 'good' : currentRatio > 3.0 ? 'high' : 'low'
    },
    {
      name: 'Debt to Equity',
      value: debtToEquity.toFixed(2),
      description: 'Ideal: < 2.0',
      tooltip: 'Total Liabilities / Total Equity',
      status: debtToEquity < 2.0 ? 'good' : 'high'
    },
    {
      name: 'Working Capital',
      value: formatCurrency(workingCapital),
      description: 'Higher is generally better',
      tooltip: 'Current Assets - Current Liabilities',
      status: workingCapital > 0 ? 'good' : 'low'
    }
  ];
  
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Financial Ratios</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratios.map((ratio, index) => (
          <div 
            key={index} 
            className={`
              p-4 border rounded-lg 
              dark:border-gray-700 
              transition-all duration-300
              ${ratio.status === 'good' ? 'border-l-4 border-l-green-500' : 
                ratio.status === 'high' ? 'border-l-4 border-l-yellow-500' : 
                'border-l-4 border-l-red-500'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{ratio.name}</h4>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <button 
                  className="hover:text-gray-700 dark:hover:text-gray-300" 
                  title={ratio.tooltip}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold">{ratio.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ratio.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
} 