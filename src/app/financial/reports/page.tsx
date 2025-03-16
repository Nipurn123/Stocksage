import React from 'react';
import type { Metadata } from 'next';
import FinancialReportsClient from '@/components/financial/ReportsClient';

export const metadata: Metadata = {
  title: 'Financial Reports | StockSage',
  description: 'Generate and view financial reports, statements, and insights.',
};

export default function FinancialReportsPage() {
  return <FinancialReportsClient />;
} 