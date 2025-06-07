'use client';

import React, { useState } from 'react';
import { Card, Button, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import {
  BalanceSheetControls,
  BalanceSheetContent,
  FinancialRatios,
  BalanceSheetVisualization,
  BalanceSheetNotes,
  historicalBalanceSheets
} from './components';

export default function BalanceSheetsPage() {
  // State hooks
  const [selectedPeriod, setSelectedPeriod] = useState('q4-2023');
  const [comparisonPeriod, setComparisonPeriod] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentView, setCurrentView] = useState('standard');
  
  // Find selected period data
  const selectedPeriodData = historicalBalanceSheets.find(
    period => period.id === selectedPeriod
  )?.data;

  // Find comparison period data if needed
  const comparisonPeriodData = comparisonPeriod
    ? historicalBalanceSheets.find(period => period.id === comparisonPeriod)?.data
    : null;
  
  // Get period labels
  const selectedPeriodLabel = historicalBalanceSheets.find(
    period => period.id === selectedPeriod
  )?.label || '';
  
  const comparisonPeriodLabel = comparisonPeriod
    ? historicalBalanceSheets.find(period => period.id === comparisonPeriod)?.label || ''
    : '';

  // Prepare comparison data in the format expected by BalanceSheetContent
  const prepareComparisonData = () => {
    if (!comparisonPeriodData || !showComparison) return null;
    
    const comparisonData = {
      totalCurrentAssets: comparisonPeriodData.assets.current.reduce((sum, item) => sum + item.amount, 0),
      totalNonCurrentAssets: comparisonPeriodData.assets.nonCurrent.reduce((sum, item) => sum + item.amount, 0),
      totalCurrentLiabilities: comparisonPeriodData.liabilities.current.reduce((sum, item) => sum + item.amount, 0),
      totalNonCurrentLiabilities: comparisonPeriodData.liabilities.nonCurrent.reduce((sum, item) => sum + item.amount, 0),
      totalEquity: comparisonPeriodData.equity.reduce((sum, item) => sum + item.amount, 0),
      items: {
        assets: {
          current: Object.fromEntries(comparisonPeriodData.assets.current.map(item => [item.name, item.amount])),
          nonCurrent: Object.fromEntries(comparisonPeriodData.assets.nonCurrent.map(item => [item.name, item.amount]))
        },
        liabilities: {
          current: Object.fromEntries(comparisonPeriodData.liabilities.current.map(item => [item.name, item.amount])),
          nonCurrent: Object.fromEntries(comparisonPeriodData.liabilities.nonCurrent.map(item => [item.name, item.amount]))
        },
        equity: Object.fromEntries(comparisonPeriodData.equity.map(item => [item.name, item.amount]))
      }
    };
    
    return comparisonData;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle period selection
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
  };
  
  // Handle comparison period selection
  const handleComparisonChange = (periodId: string | null) => {
    setComparisonPeriod(periodId);
    setShowComparison(!!periodId);
  };
  
  // Handle view change
  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };
  
  if (!selectedPeriodData) {
    return <div className="p-6">No data available for the selected period.</div>;
  }
  
  // Calculate totals for financial ratios and visualizations
  const totalCurrentAssets = selectedPeriodData.assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentAssets = selectedPeriodData.assets.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalCurrentLiabilities = selectedPeriodData.liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentLiabilities = selectedPeriodData.liabilities.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = selectedPeriodData.equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Balance Sheets</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">📥</span> Export PDF
          </Button>
          <Button variant="outline">
            <span className="mr-2">📊</span> Export Excel
          </Button>
        </div>
      </div>
      
      <Card className="p-4">
        <BalanceSheetControls
          periods={historicalBalanceSheets}
          selectedPeriod={selectedPeriod}
          comparisonPeriod={comparisonPeriod}
          onPeriodChange={handlePeriodChange}
          onComparisonChange={handleComparisonChange}
        />
      </Card>
      
      <Tabs defaultValue="standard" className="w-full" onValueChange={handleViewChange}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="standard">Standard View</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="notes">Notes & Analysis</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={currentView !== 'standard' ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <BalanceSheetContent
            data={selectedPeriodData}
            showComparison={showComparison}
            selectedPeriodLabel={selectedPeriodLabel}
            comparisonPeriodLabel={comparisonPeriodLabel || ''}
            formatCurrency={formatCurrency}
            comparisonData={prepareComparisonData()}
          />
        </div>
        
        {currentView === 'visualizations' && (
          <div className="lg:col-span-1">
            <BalanceSheetVisualization 
              totalCurrentAssets={totalCurrentAssets}
              totalNonCurrentAssets={totalNonCurrentAssets}
              totalCurrentLiabilities={totalCurrentLiabilities}
              totalNonCurrentLiabilities={totalNonCurrentLiabilities}
              totalEquity={totalEquity}
            />
          </div>
        )}
        
        {currentView === 'notes' && (
          <div className="lg:col-span-1">
            <BalanceSheetNotes />
          </div>
        )}
      </div>
      
      <FinancialRatios
        totalCurrentAssets={totalCurrentAssets}
        totalCurrentLiabilities={totalCurrentLiabilities}
        totalLiabilities={totalLiabilities}
        totalEquity={totalEquity}
        formatCurrency={formatCurrency}
      />
    </div>
  );
} 