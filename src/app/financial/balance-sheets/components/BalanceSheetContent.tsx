'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import LineItem from './LineItem';
import { BalanceSheetData } from './models';

interface ComparisonData {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalEquity: number;
  items: {
    assets: {
      current: Record<string, number>;
      nonCurrent: Record<string, number>;
    };
    liabilities: {
      current: Record<string, number>;
      nonCurrent: Record<string, number>;
    };
    equity: Record<string, number>;
  };
}

interface BalanceSheetContentProps {
  data: BalanceSheetData;
  showComparison: boolean;
  selectedPeriodLabel: string;
  comparisonPeriodLabel?: string;
  formatCurrency: (amount: number) => string;
  comparisonData: ComparisonData | null;
}

export default function BalanceSheetContent({
  data,
  showComparison,
  selectedPeriodLabel,
  comparisonPeriodLabel,
  formatCurrency,
  comparisonData,
}: BalanceSheetContentProps) {
  const [expandedSections, setExpandedSections] = useState<{
    assets: boolean;
    currentAssets: boolean;
    nonCurrentAssets: boolean;
    liabilities: boolean;
    currentLiabilities: boolean;
    nonCurrentLiabilities: boolean;
    equity: boolean;
  }>({
    assets: true,
    currentAssets: true,
    nonCurrentAssets: true,
    liabilities: true,
    currentLiabilities: true,
    nonCurrentLiabilities: true,
    equity: true,
  });
  
  // Calculate totals
  const totalCurrentAssets = data.assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentAssets = data.assets.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
  
  const totalCurrentLiabilities = data.liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentLiabilities = data.liabilities.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  
  const totalEquity = data.equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // For comparison totals
  const comparisonTotalAssets = comparisonData ? 
    comparisonData.totalCurrentAssets + comparisonData.totalNonCurrentAssets : undefined;
  const comparisonTotalLiabilities = comparisonData ? 
    comparisonData.totalCurrentLiabilities + comparisonData.totalNonCurrentLiabilities : undefined;
  const comparisonTotalLiabilitiesAndEquity = comparisonData && comparisonTotalLiabilities !== undefined ? 
    comparisonTotalLiabilities + comparisonData.totalEquity : undefined;
  
  // Helper function to get comparison amount for an item
  const getItemComparisonAmount = (section: string, category: string, itemName: string): number | undefined => {
    if (!showComparison || !comparisonData) return undefined;
    
    if (section === 'assets') {
      if (category === 'current' && comparisonData.items.assets.current[itemName] !== undefined) {
        return comparisonData.items.assets.current[itemName];
      } else if (category === 'nonCurrent' && comparisonData.items.assets.nonCurrent[itemName] !== undefined) {
        return comparisonData.items.assets.nonCurrent[itemName];
      }
    } else if (section === 'liabilities') {
      if (category === 'current' && comparisonData.items.liabilities.current[itemName] !== undefined) {
        return comparisonData.items.liabilities.current[itemName];
      } else if (category === 'nonCurrent' && comparisonData.items.liabilities.nonCurrent[itemName] !== undefined) {
        return comparisonData.items.liabilities.nonCurrent[itemName];
      }
    } else if (section === 'equity' && comparisonData.items.equity[itemName] !== undefined) {
      return comparisonData.items.equity[itemName];
    }
    
    return undefined;
  };
  
  return (
    <Card className="p-6 print:shadow-none">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Balance Sheet</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedPeriodLabel} • As of {new Date(data.asOf).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {showComparison && comparisonPeriodLabel && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Compared to {comparisonPeriodLabel}
          </p>
        )}
      </div>
      
      <div className="space-y-8">
        {/* Assets */}
        <div>
          <LineItem 
            name="Assets"
            amount={totalAssets}
            comparisonAmount={comparisonTotalAssets}
            isExpandable
            isExpanded={expandedSections.assets}
            onToggleExpand={() => toggleSection('assets')}
            formatCurrency={formatCurrency}
            showComparison={showComparison}
            isTotal
          />
          
          {expandedSections.assets && (
            <div className="mt-2 space-y-4">
              {/* Current Assets */}
              <div>
                <LineItem 
                  name="Current Assets"
                  amount={totalCurrentAssets}
                  comparisonAmount={comparisonData?.totalCurrentAssets}
                  isExpandable
                  isExpanded={expandedSections.currentAssets}
                  onToggleExpand={() => toggleSection('currentAssets')}
                  formatCurrency={formatCurrency}
                  showComparison={showComparison}
                  indentLevel={1}
                />
                
                {expandedSections.currentAssets && (
                  <div className="space-y-1 mt-1">
                    {data.assets.current.map((item, index) => (
                      <LineItem
                        key={index}
                        name={item.name}
                        amount={item.amount}
                        comparisonAmount={getItemComparisonAmount('assets', 'current', item.name)}
                        formatCurrency={formatCurrency}
                        showComparison={showComparison}
                        indentLevel={2}
                      />
                    ))}
                    <LineItem
                      name="Total Current Assets"
                      amount={totalCurrentAssets}
                      comparisonAmount={comparisonData?.totalCurrentAssets}
                      formatCurrency={formatCurrency}
                      showComparison={showComparison}
                      indentLevel={2}
                      isTotal
                    />
                  </div>
                )}
              </div>
              
              {/* Non-Current Assets */}
              <div>
                <LineItem 
                  name="Non-Current Assets"
                  amount={totalNonCurrentAssets}
                  comparisonAmount={comparisonData?.totalNonCurrentAssets}
                  isExpandable
                  isExpanded={expandedSections.nonCurrentAssets}
                  onToggleExpand={() => toggleSection('nonCurrentAssets')}
                  formatCurrency={formatCurrency}
                  showComparison={showComparison}
                  indentLevel={1}
                />
                
                {expandedSections.nonCurrentAssets && (
                  <div className="space-y-1 mt-1">
                    {data.assets.nonCurrent.map((item, index) => (
                      <LineItem
                        key={index}
                        name={item.name}
                        amount={item.amount}
                        comparisonAmount={getItemComparisonAmount('assets', 'nonCurrent', item.name)}
                        formatCurrency={formatCurrency}
                        showComparison={showComparison}
                        indentLevel={2}
                      />
                    ))}
                    <LineItem
                      name="Total Non-Current Assets"
                      amount={totalNonCurrentAssets}
                      comparisonAmount={comparisonData?.totalNonCurrentAssets}
                      formatCurrency={formatCurrency}
                      showComparison={showComparison}
                      indentLevel={2}
                      isTotal
                    />
                  </div>
                )}
              </div>
              
              <LineItem
                name="Total Assets"
                amount={totalAssets}
                comparisonAmount={comparisonTotalAssets}
                formatCurrency={formatCurrency}
                showComparison={showComparison}
                indentLevel={1}
                isTotal
              />
            </div>
          )}
        </div>
        
        {/* Liabilities */}
        <div>
          <LineItem 
            name="Liabilities"
            amount={totalLiabilities}
            comparisonAmount={comparisonTotalLiabilities}
            isExpandable
            isExpanded={expandedSections.liabilities}
            onToggleExpand={() => toggleSection('liabilities')}
            formatCurrency={formatCurrency}
            showComparison={showComparison}
            isTotal
          />
          
          {expandedSections.liabilities && (
            <div className="mt-2 space-y-4">
              {/* Current Liabilities */}
              <div>
                <LineItem 
                  name="Current Liabilities"
                  amount={totalCurrentLiabilities}
                  comparisonAmount={comparisonData?.totalCurrentLiabilities}
                  isExpandable
                  isExpanded={expandedSections.currentLiabilities}
                  onToggleExpand={() => toggleSection('currentLiabilities')}
                  formatCurrency={formatCurrency}
                  showComparison={showComparison}
                  indentLevel={1}
                />
                
                {expandedSections.currentLiabilities && (
                  <div className="space-y-1 mt-1">
                    {data.liabilities.current.map((item, index) => (
                      <LineItem
                        key={index}
                        name={item.name}
                        amount={item.amount}
                        comparisonAmount={getItemComparisonAmount('liabilities', 'current', item.name)}
                        formatCurrency={formatCurrency}
                        showComparison={showComparison}
                        indentLevel={2}
                      />
                    ))}
                    <LineItem
                      name="Total Current Liabilities"
                      amount={totalCurrentLiabilities}
                      comparisonAmount={comparisonData?.totalCurrentLiabilities}
                      formatCurrency={formatCurrency}
                      showComparison={showComparison}
                      indentLevel={2}
                      isTotal
                    />
                  </div>
                )}
              </div>
              
              {/* Non-Current Liabilities */}
              <div>
                <LineItem 
                  name="Non-Current Liabilities"
                  amount={totalNonCurrentLiabilities}
                  comparisonAmount={comparisonData?.totalNonCurrentLiabilities}
                  isExpandable
                  isExpanded={expandedSections.nonCurrentLiabilities}
                  onToggleExpand={() => toggleSection('nonCurrentLiabilities')}
                  formatCurrency={formatCurrency}
                  showComparison={showComparison}
                  indentLevel={1}
                />
                
                {expandedSections.nonCurrentLiabilities && (
                  <div className="space-y-1 mt-1">
                    {data.liabilities.nonCurrent.map((item, index) => (
                      <LineItem
                        key={index}
                        name={item.name}
                        amount={item.amount}
                        comparisonAmount={getItemComparisonAmount('liabilities', 'nonCurrent', item.name)}
                        formatCurrency={formatCurrency}
                        showComparison={showComparison}
                        indentLevel={2}
                      />
                    ))}
                    <LineItem
                      name="Total Non-Current Liabilities"
                      amount={totalNonCurrentLiabilities}
                      comparisonAmount={comparisonData?.totalNonCurrentLiabilities}
                      formatCurrency={formatCurrency}
                      showComparison={showComparison}
                      indentLevel={2}
                      isTotal
                    />
                  </div>
                )}
              </div>
              
              <LineItem
                name="Total Liabilities"
                amount={totalLiabilities}
                comparisonAmount={comparisonTotalLiabilities}
                formatCurrency={formatCurrency}
                showComparison={showComparison}
                indentLevel={1}
                isTotal
              />
            </div>
          )}
        </div>
        
        {/* Equity */}
        <div>
          <LineItem 
            name="Equity"
            amount={totalEquity}
            comparisonAmount={comparisonData?.totalEquity}
            isExpandable
            isExpanded={expandedSections.equity}
            onToggleExpand={() => toggleSection('equity')}
            formatCurrency={formatCurrency}
            showComparison={showComparison}
            isTotal
          />
          
          {expandedSections.equity && (
            <div className="space-y-1 mt-1">
              {data.equity.map((item, index) => (
                <LineItem
                  key={index}
                  name={item.name}
                  amount={item.amount}
                  comparisonAmount={getItemComparisonAmount('equity', '', item.name)}
                  formatCurrency={formatCurrency}
                  showComparison={showComparison}
                  indentLevel={1}
                />
              ))}
              <LineItem
                name="Total Equity"
                amount={totalEquity}
                comparisonAmount={comparisonData?.totalEquity}
                formatCurrency={formatCurrency}
                showComparison={showComparison}
                indentLevel={1}
                isTotal
              />
            </div>
          )}
        </div>
        
        {/* Total Liabilities and Equity */}
        <div>
          <LineItem
            name="Total Liabilities and Equity"
            amount={totalLiabilitiesAndEquity}
            comparisonAmount={comparisonTotalLiabilitiesAndEquity}
            formatCurrency={formatCurrency}
            showComparison={showComparison}
            isTotal
          />
        </div>
        
        {/* Balance check */}
        <div className="mt-6 text-right">
          <span className={totalAssets === totalLiabilitiesAndEquity ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {totalAssets === totalLiabilitiesAndEquity ? '✓ Balance Sheet Balanced' : '⚠️ Balance Sheet Not Balanced'}
          </span>
        </div>
      </div>
    </Card>
  );
} 