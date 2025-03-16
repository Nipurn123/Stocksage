import React from 'react';
import type { Metadata } from 'next';
import ForecastingClient from '@/components/financial/ForecastingClient';

export const metadata: Metadata = {
  title: 'Financial Forecasting | StockSage',
  description: 'Predict future financial performance with AI-powered forecasting tools.',
};

export default function ForecastingPage() {
  return <ForecastingClient />;
} 