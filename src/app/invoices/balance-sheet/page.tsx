'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { format, subMonths } from 'date-fns';
import { ChevronLeft, Download } from 'lucide-react';
import Link from 'next/link';

// Define types for our balance sheet data
interface AgingBreakdown {
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90Plus: number;
}

interface AccountsReceivable {
  total: number;
  breakdown: AgingBreakdown;
}

interface AccountsPayable {
  total: number;
  breakdown: AgingBreakdown;
}

interface TaxLiabilities {
  salesTax: number;
  otherTaxes: number;
}

interface Assets {
  accountsReceivable: AccountsReceivable;
  inventory: number;
  prepaidExpenses: number;
}

interface Liabilities {
  accountsPayable: AccountsPayable;
  taxes?: TaxLiabilities;
}

interface Summary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currentRatio: number;
}

interface InvoiceMetrics {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  averageInvoiceAmount: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

interface ProjectedCollections {
  next30Days: number;
  next60Days: number;
  next90Days: number;
  beyond90Days: number;
}

interface Cashflow {
  inflows: number;
  outflows: number;
  net: number;
}

interface Projections {
  accountsReceivableCollections: ProjectedCollections;
  cashflow: Cashflow;
  monthlyRevenueTrend: Record<string, number>;
}

interface BalanceSheetData {
  period: string;
  assets: Assets;
  liabilities: Liabilities;
  equity?: Record<string, number>;
  summary: Summary;
  invoiceMetrics: InvoiceMetrics;
  projections?: Projections;
}

// Define the function to fetch balance sheet data
const fetchBalanceSheetData = async (startDate: string, endDate: string, includeProjections = false) => {
  const url = `/api/invoices/balance-sheet?startDate=${startDate}&endDate=${endDate}`;
  // Add includeProjections to URL params if true
  const fullUrl = includeProjections ? `${url}&includeProjections=true` : url;
  const response = await fetch(fullUrl);
  
  if (!response.ok) {
    throw new Error('Failed to fetch balance sheet data');
  }
  
  return response.json();
};

// Define the Balance Sheet page component
const BalanceSheetPage = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [balanceSheetData, setBalanceSheetData] = React.useState<BalanceSheetData | null>(null);
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [includeProjections, setIncludeProjections] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('summary');

  // Fetch balance sheet data when component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Format dates for API
        const startDate = format(dateRange.from, 'yyyy-MM-dd');
        const endDate = format(dateRange.to, 'yyyy-MM-dd');
        
        const result = await fetchBalanceSheetData(startDate, endDate, includeProjections);
        setBalanceSheetData(result.data);
      } catch (error) {
        console.error('Error fetching balance sheet:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to generate balance sheet with new options
  const generateBalanceSheet = async () => {
    setIsLoading(true);
    try {
      // Format dates for API
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Use POST endpoint for more control
      const response = await fetch('/api/invoices/balance-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          includeProjections,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate balance sheet');
      }
      
      const result = await response.json();
      setBalanceSheetData(result.data);
    } catch (error) {
      console.error('Error generating balance sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">
            Generate a balance sheet from your invoice data
          </p>
        </div>
        <Link href="/invoices">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
      </div>

      <Card 
        title="Generate Balance Sheet"
        subtitle="Select a date range and options to generate a balance sheet"
        footer={
          <>
            <div className="flex space-x-3">
              <Button 
                onClick={generateBalanceSheet}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Balance Sheet'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/invoices/balance-sheet', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        generateTestData: true
                      }),
                    });
                    
                    if (response.ok) {
                      alert('Test data generated successfully! You can now generate the balance sheet.');
                    } else {
                      alert('Failed to generate test data.');
                    }
                  } catch (error) {
                    console.error('Error generating test data:', error);
                    alert('Error generating test data.');
                  }
                }}
              >
                Generate Test Data
              </Button>
            </div>
          </>
        }
        className="mb-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="font-medium">Date Range</div>
            <div className="flex flex-col space-y-2">
              <div>
                <label className="block text-sm mb-1">From:</label>
                <input 
                  type="date" 
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setDateRange(prev => ({
                      ...prev,
                      from: newDate
                    }));
                  }}
                  className="w-full border rounded-md px-3 py-2"
                  title="Start date"
                  aria-label="Start date"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">To:</label>
                <input 
                  type="date" 
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setDateRange(prev => ({
                      ...prev,
                      to: newDate
                    }));
                  }}
                  className="w-full border rounded-md px-3 py-2"
                  title="End date"
                  aria-label="End date"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Options</div>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeProjections}
                  onChange={(e) => setIncludeProjections(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Include Financial Projections</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {balanceSheetData && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Balance Sheet for {balanceSheetData.period}
            </h2>
            <Button variant="outline" onClick={() => {
              const jsonData = JSON.stringify(balanceSheetData, null, 2);
              const blob = new Blob([jsonData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `balance-sheet-${balanceSheetData.period.replace(/\s+/g, '-')}.json`;
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
              <TabsTrigger value="invoice-metrics">Invoice Metrics</TabsTrigger>
              {balanceSheetData.projections && (
                <TabsTrigger value="projections">Projections</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="summary">
              <div className="grid gap-6 md:grid-cols-2">
                <Card title="Financial Summary">
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt>Total Assets</dt>
                      <dd className="font-semibold">{formatCurrency(balanceSheetData.summary.totalAssets)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Liabilities</dt>
                      <dd className="font-semibold">{formatCurrency(balanceSheetData.summary.totalLiabilities)}</dd>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg">
                        <dt className="font-bold">Net Worth</dt>
                        <dd className="font-bold">{formatCurrency(balanceSheetData.summary.netWorth)}</dd>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <dt>Current Ratio</dt>
                      <dd className="font-semibold">{balanceSheetData.summary.currentRatio.toFixed(2)}</dd>
                    </div>
                  </dl>
                </Card>

                <Card title="Key Metrics">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.invoiceMetrics.totalPending + balanceSheetData.invoiceMetrics.totalOverdue)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(balanceSheetData.invoiceMetrics.totalPaid)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{balanceSheetData.invoiceMetrics.invoiceCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. Invoice</p>
                      <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.invoiceMetrics.averageInvoiceAmount)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assets">
              <div className="grid gap-6">
                <Card 
                  title="Accounts Receivable"
                  subtitle="Money owed to your business from customers"
                >
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold">
                      Total: {formatCurrency(balanceSheetData.assets.accountsReceivable.total)}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Aging Analysis:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card title="Current" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.accountsReceivable.breakdown.current)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.assets.accountsReceivable.breakdown.current / balanceSheetData.assets.accountsReceivable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="1-30 Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.accountsReceivable.breakdown.overdue30)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.assets.accountsReceivable.breakdown.overdue30 / balanceSheetData.assets.accountsReceivable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="31-60 Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.accountsReceivable.breakdown.overdue60)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.assets.accountsReceivable.breakdown.overdue60 / balanceSheetData.assets.accountsReceivable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="90+ Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.accountsReceivable.breakdown.overdue90Plus)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.assets.accountsReceivable.breakdown.overdue90Plus / balanceSheetData.assets.accountsReceivable.total) * 100)}% of total
                        </p>
                      </Card>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Inventory">
                    <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.inventory || 0)}</p>
                    <p className="text-sm text-muted-foreground">
                      Value of goods held in stock
                    </p>
                  </Card>
                  <Card title="Prepaid Expenses">
                    <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.prepaidExpenses || 0)}</p>
                    <p className="text-sm text-muted-foreground">
                      Expenses paid in advance
                    </p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liabilities">
              <div className="grid gap-6">
                <Card 
                  title="Accounts Payable"
                  subtitle="Money your business owes to suppliers"
                >
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold">
                      Total: {formatCurrency(balanceSheetData.liabilities.accountsPayable.total)}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Aging Analysis:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card title="Current" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.liabilities.accountsPayable.breakdown.current)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.liabilities.accountsPayable.breakdown.current / balanceSheetData.liabilities.accountsPayable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="1-30 Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.liabilities.accountsPayable.breakdown.overdue30)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.liabilities.accountsPayable.breakdown.overdue30 / balanceSheetData.liabilities.accountsPayable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="31-60 Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.liabilities.accountsPayable.breakdown.overdue60)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.liabilities.accountsPayable.breakdown.overdue60 / balanceSheetData.liabilities.accountsPayable.total) * 100)}% of total
                        </p>
                      </Card>
                      <Card title="90+ Days" className="p-4">
                        <p className="text-2xl font-bold">{formatCurrency(balanceSheetData.liabilities.accountsPayable.breakdown.overdue90Plus)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((balanceSheetData.liabilities.accountsPayable.breakdown.overdue90Plus / balanceSheetData.liabilities.accountsPayable.total) * 100)}% of total
                        </p>
                      </Card>
                    </div>
                  </div>
                </Card>

                {balanceSheetData.liabilities.taxes && (
                  <Card title="Tax Liabilities">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Sales Tax</p>
                          <p className="text-sm text-muted-foreground">Sales taxes collected but not yet remitted</p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.liabilities.taxes.salesTax)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Other Taxes</p>
                          <p className="text-sm text-muted-foreground">Other tax obligations</p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.liabilities.taxes.otherTaxes)}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">Total Tax Liabilities</p>
                          <p className="text-xl font-bold">{formatCurrency(balanceSheetData.liabilities.taxes.salesTax + balanceSheetData.liabilities.taxes.otherTaxes)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invoice-metrics">
              <div className="grid gap-6 md:grid-cols-2">
                <Card title="Invoice Amounts">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Invoiced</p>
                      <p className="text-xl font-bold">{formatCurrency(balanceSheetData.invoiceMetrics.totalInvoiced)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Paid</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(balanceSheetData.invoiceMetrics.totalPaid)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Pending</p>
                      <p className="text-xl font-bold text-amber-600">{formatCurrency(balanceSheetData.invoiceMetrics.totalPending)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Overdue</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(balanceSheetData.invoiceMetrics.totalOverdue)}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Average Invoice Amount</p>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.invoiceMetrics.averageInvoiceAmount)}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Invoice Counts">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Invoices</p>
                      <p className="text-xl font-bold">{balanceSheetData.invoiceMetrics.invoiceCount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Paid Invoices</p>
                      <p className="text-xl font-bold text-green-600">{balanceSheetData.invoiceMetrics.paidCount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Pending Invoices</p>
                      <p className="text-xl font-bold text-amber-600">{balanceSheetData.invoiceMetrics.pendingCount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Overdue Invoices</p>
                      <p className="text-xl font-bold text-red-600">{balanceSheetData.invoiceMetrics.overdueCount}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {balanceSheetData.projections && (
              <TabsContent value="projections">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card 
                    title="Accounts Receivable Collections"
                    subtitle="Projected collections based on aging"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Next 30 Days</p>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.projections.accountsReceivableCollections.next30Days)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">31-60 Days</p>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.projections.accountsReceivableCollections.next60Days)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">61-90 Days</p>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.projections.accountsReceivableCollections.next90Days)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Beyond 90 Days</p>
                        <p className="text-xl font-bold">{formatCurrency(balanceSheetData.projections.accountsReceivableCollections.beyond90Days)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    title="Projected Cash Flow"
                    subtitle="Expected cash movement"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Projected Inflows</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(balanceSheetData.projections.cashflow.inflows)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Projected Outflows</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(balanceSheetData.projections.cashflow.outflows)}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">Net Cash Flow</p>
                          <p className={`text-xl font-bold ${balanceSheetData.projections.cashflow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(balanceSheetData.projections.cashflow.net)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="md:col-span-2"
                    title="Monthly Revenue Trends"
                    subtitle="Historical revenue by month"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(balanceSheetData.projections.monthlyRevenueTrend)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([month, amount]) => (
                          <div key={month} className="flex justify-between items-center p-4 border rounded-lg">
                            <p className="font-medium">{month}</p>
                            <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}

      {isLoading && !balanceSheetData && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage; 