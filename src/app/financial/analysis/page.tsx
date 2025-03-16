import React from 'react';
import type { Metadata } from 'next';
import FinancialAnalysisClient from '@/components/financial/AnalysisClient';

export const metadata: Metadata = {
  title: 'Financial Analysis | StockSage',
  description: 'Detailed financial analysis, trend exploration, and performance metrics.',
};

export default function FinancialAnalysisPage() {
  return <FinancialAnalysisClient />;
} 