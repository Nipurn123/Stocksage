'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { PieChart, BarChart } from 'lucide-react';

interface BalanceSheetVisualizationProps {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalEquity: number;
}

export default function BalanceSheetVisualization({
  totalCurrentAssets,
  totalNonCurrentAssets,
  totalCurrentLiabilities,
  totalNonCurrentLiabilities,
  totalEquity,
}: BalanceSheetVisualizationProps) {
  const [activeChart, setActiveChart] = React.useState<'pie' | 'bar'>('pie');
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Balance Sheet Visualization</h3>
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          <button 
            className={`p-1.5 rounded-md ${activeChart === 'pie' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveChart('pie')}
            title="Pie Chart"
          >
            <PieChart className="h-5 w-5" />
          </button>
          <button 
            className={`p-1.5 rounded-md ${activeChart === 'bar' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveChart('bar')}
            title="Bar Chart"
          >
            <BarChart className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-center h-72 border rounded-lg dark:border-gray-700 p-4">
        {activeChart === 'pie' ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-4">
              <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
              <div 
                className="absolute inset-0 rounded-full bg-green-500" 
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI * 2 * (totalCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * (totalCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))})` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full bg-blue-500" 
                style={{ 
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * (totalCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * (totalCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))})` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full bg-red-500" 
                style={{ 
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))})` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full bg-orange-500" 
                style={{ 
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities + totalNonCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities + totalNonCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))})` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full bg-purple-500" 
                style={{ 
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities + totalNonCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}% ${50 - 50 * Math.sin(Math.PI * 2 * ((totalCurrentAssets + totalNonCurrentAssets + totalCurrentLiabilities + totalNonCurrentLiabilities) / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)))}, ${50 + 50 * Math.cos(Math.PI * 2)}% ${50 - 50 * Math.sin(Math.PI * 2)})` 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-5 gap-4 w-full">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs">Current Assets</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs">Non-Current Assets</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xs">Current Liabilities</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs">Non-Current Liabilities</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-xs">Equity</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex h-48 items-end w-full justify-around mb-4">
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-green-500 rounded-t-md" 
                  style={{ height: `${(totalCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)) * 100}%` }}
                ></div>
                <span className="text-xs mt-2">Current Assets</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-blue-500 rounded-t-md" 
                  style={{ height: `${(totalNonCurrentAssets / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)) * 100}%` }}
                ></div>
                <span className="text-xs mt-2">Non-Current Assets</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-red-500 rounded-t-md" 
                  style={{ height: `${(totalCurrentLiabilities / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)) * 100}%` }}
                ></div>
                <span className="text-xs mt-2">Current Liabilities</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-orange-500 rounded-t-md" 
                  style={{ height: `${(totalNonCurrentLiabilities / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)) * 100}%` }}
                ></div>
                <span className="text-xs mt-2">Non-Current Liabilities</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-purple-500 rounded-t-md" 
                  style={{ height: `${(totalEquity / (totalCurrentAssets + totalNonCurrentAssets + totalEquity + totalCurrentLiabilities + totalNonCurrentLiabilities)) * 100}%` }}
                ></div>
                <span className="text-xs mt-2">Equity</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 