export interface BalanceSheetItem {
  name: string;
  amount: number;
}

export interface BalanceSheetData {
  asOf: string;
  assets: {
    current: BalanceSheetItem[];
    nonCurrent: BalanceSheetItem[];
  };
  liabilities: {
    current: BalanceSheetItem[];
    nonCurrent: BalanceSheetItem[];
  };
  equity: BalanceSheetItem[];
}

export interface Period {
  id: string;
  label: string;
  data: BalanceSheetData;
}

// Mock data for historical balance sheets
export const historicalBalanceSheets: Period[] = [
  {
    id: 'q4-2023',
    label: 'Q4 2023',
    data: {
      asOf: '2023-12-31',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 125000 },
          { name: 'Short-term Investments', amount: 75000 },
          { name: 'Accounts Receivable', amount: 185000 },
          { name: 'Inventory', amount: 210000 },
          { name: 'Prepaid Expenses', amount: 35000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 350000 },
          { name: 'Property, Plant and Equipment', amount: 890000 },
          { name: 'Intangible Assets', amount: 125000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 95000 },
          { name: 'Short-term Debt', amount: 60000 },
          { name: 'Current Portion of Long-term Debt', amount: 75000 },
          { name: 'Accrued Expenses', amount: 45000 },
          { name: 'Income Taxes Payable', amount: 30000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 420000 },
          { name: 'Deferred Tax Liabilities', amount: 65000 },
          { name: 'Pension Obligations', amount: 115000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 640000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  },
  {
    id: 'q3-2023',
    label: 'Q3 2023',
    data: {
      asOf: '2023-09-30',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 110000 },
          { name: 'Short-term Investments', amount: 70000 },
          { name: 'Accounts Receivable', amount: 175000 },
          { name: 'Inventory', amount: 195000 },
          { name: 'Prepaid Expenses', amount: 30000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 340000 },
          { name: 'Property, Plant and Equipment', amount: 880000 },
          { name: 'Intangible Assets', amount: 120000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 90000 },
          { name: 'Short-term Debt', amount: 55000 },
          { name: 'Current Portion of Long-term Debt', amount: 70000 },
          { name: 'Accrued Expenses', amount: 40000 },
          { name: 'Income Taxes Payable', amount: 25000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 430000 },
          { name: 'Deferred Tax Liabilities', amount: 60000 },
          { name: 'Pension Obligations', amount: 110000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 610000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  },
  {
    id: 'q2-2023',
    label: 'Q2 2023',
    data: {
      asOf: '2023-06-30',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 105000 },
          { name: 'Short-term Investments', amount: 65000 },
          { name: 'Accounts Receivable', amount: 165000 },
          { name: 'Inventory', amount: 190000 },
          { name: 'Prepaid Expenses', amount: 28000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 330000 },
          { name: 'Property, Plant and Equipment', amount: 870000 },
          { name: 'Intangible Assets', amount: 115000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 85000 },
          { name: 'Short-term Debt', amount: 50000 },
          { name: 'Current Portion of Long-term Debt', amount: 65000 },
          { name: 'Accrued Expenses', amount: 38000 },
          { name: 'Income Taxes Payable', amount: 22000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 440000 },
          { name: 'Deferred Tax Liabilities', amount: 58000 },
          { name: 'Pension Obligations', amount: 105000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 580000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  },
  {
    id: 'q1-2023',
    label: 'Q1 2023',
    data: {
      asOf: '2023-03-31',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 100000 },
          { name: 'Short-term Investments', amount: 60000 },
          { name: 'Accounts Receivable', amount: 160000 },
          { name: 'Inventory', amount: 185000 },
          { name: 'Prepaid Expenses', amount: 25000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 320000 },
          { name: 'Property, Plant and Equipment', amount: 860000 },
          { name: 'Intangible Assets', amount: 110000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 80000 },
          { name: 'Short-term Debt', amount: 45000 },
          { name: 'Current Portion of Long-term Debt', amount: 60000 },
          { name: 'Accrued Expenses', amount: 35000 },
          { name: 'Income Taxes Payable', amount: 20000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 450000 },
          { name: 'Deferred Tax Liabilities', amount: 55000 },
          { name: 'Pension Obligations', amount: 100000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 550000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  },
  {
    id: 'q4-2022',
    label: 'Q4 2022',
    data: {
      asOf: '2022-12-31',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 95000 },
          { name: 'Short-term Investments', amount: 55000 },
          { name: 'Accounts Receivable', amount: 155000 },
          { name: 'Inventory', amount: 180000 },
          { name: 'Prepaid Expenses', amount: 22000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 310000 },
          { name: 'Property, Plant and Equipment', amount: 850000 },
          { name: 'Intangible Assets', amount: 105000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 75000 },
          { name: 'Short-term Debt', amount: 40000 },
          { name: 'Current Portion of Long-term Debt', amount: 55000 },
          { name: 'Accrued Expenses', amount: 32000 },
          { name: 'Income Taxes Payable', amount: 18000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 460000 },
          { name: 'Deferred Tax Liabilities', amount: 52000 },
          { name: 'Pension Obligations', amount: 95000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 520000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  },
  {
    id: 'q3-2022',
    label: 'Q3 2022',
    data: {
      asOf: '2022-09-30',
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: 90000 },
          { name: 'Short-term Investments', amount: 50000 },
          { name: 'Accounts Receivable', amount: 150000 },
          { name: 'Inventory', amount: 175000 },
          { name: 'Prepaid Expenses', amount: 20000 }
        ],
        nonCurrent: [
          { name: 'Long-term Investments', amount: 300000 },
          { name: 'Property, Plant and Equipment', amount: 840000 },
          { name: 'Intangible Assets', amount: 100000 },
          { name: 'Goodwill', amount: 75000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: 70000 },
          { name: 'Short-term Debt', amount: 35000 },
          { name: 'Current Portion of Long-term Debt', amount: 50000 },
          { name: 'Accrued Expenses', amount: 30000 },
          { name: 'Income Taxes Payable', amount: 15000 }
        ],
        nonCurrent: [
          { name: 'Long-term Debt', amount: 470000 },
          { name: 'Deferred Tax Liabilities', amount: 50000 },
          { name: 'Pension Obligations', amount: 90000 }
        ]
      },
      equity: [
        { name: 'Common Stock', amount: 500000 },
        { name: 'Retained Earnings', amount: 495000 },
        { name: 'Additional Paid-in Capital', amount: 75000 },
        { name: 'Treasury Stock', amount: -25000 }
      ]
    }
  }
]; 