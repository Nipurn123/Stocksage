import React from 'react';
import type { Metadata } from 'next';
import BudgetingClient from '@/components/financial/BudgetingClient';

export const metadata: Metadata = {
  title: 'Financial Budgeting | StockSage',
  description: 'Create, manage, and track budgets across departments and projects.',
};

export default function BudgetingPage() {
  return <BudgetingClient />;
} 