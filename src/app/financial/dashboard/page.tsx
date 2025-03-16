import React from 'react';
import type { Metadata } from 'next';
import DashboardClient from '@/components/financial/DashboardClient';

export const metadata: Metadata = {
  title: 'Financial Dashboard | StockSage',
  description: 'View your financial metrics, cash flow, revenue, and invoice aging reports in one place.',
};

export default function DashboardPage() {
  return <DashboardClient />;
} 