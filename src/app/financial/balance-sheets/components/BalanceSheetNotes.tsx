'use client';

import React from 'react';
import { Card } from '@/components/ui';

export default function BalanceSheetNotes() {
  const notes = [
    {
      title: 'Note 1: Accounting Policies',
      content: 'This balance sheet has been prepared in accordance with Generally Accepted Accounting Principles (GAAP). Assets and liabilities are presented on a historical cost basis.'
    },
    {
      title: 'Note 2: Inventory Valuation',
      content: 'Inventory is valued using the First-In, First-Out (FIFO) method. Write-downs for obsolescence are included in the inventory valuation.'
    },
    {
      title: 'Note 3: Property, Plant and Equipment',
      content: 'Assets are depreciated using the straight-line method over their estimated useful lives, which range from 3 to 20 years.'
    },
    {
      title: 'Note 4: Intangible Assets',
      content: 'Intangible assets include patents, trademarks, and goodwill. These assets are amortized over their useful lives, except for goodwill, which is tested annually for impairment.'
    },
    {
      title: 'Note 5: Long-term Debt',
      content: 'Long-term debt consists of bonds payable and bank loans with maturities extending beyond one year. Interest rates range from 3.5% to 5.2% with various maturity dates.'
    }
  ];
  
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Notes to the Balance Sheet</h3>
      
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        {notes.map((note, index) => (
          <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-0">
            <h4 className="font-medium">{note.title}</h4>
            <p className="text-sm mt-1">{note.content}</p>
          </div>
        ))}
      </div>
    </Card>
  );
} 