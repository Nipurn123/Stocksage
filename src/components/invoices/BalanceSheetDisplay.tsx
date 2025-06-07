import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Loader2, DownloadIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

// Interface for balance sheet data structure
interface BalanceSheetData {
  period: string;
  generatedAt: string;
  assets: {
    accountsReceivable: {
      total: number;
      breakdown: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90Plus: number;
      };
    };
    inventory?: number;
    prepaidExpenses?: number;
  };
  liabilities: {
    accountsPayable: {
      total: number;
      breakdown: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90Plus: number;
      };
    };
    taxes?: { 
      salesTax: number;
      otherTaxes: number;
    };
  };
  equity: {
    netAssets: number;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    currentRatio: number;
  };
  invoiceMetrics: {
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
    invoiceCount: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  projections?: {
    accountsReceivableCollections: {
      next30Days: number;
      next60Days: number;
      next90Days: number;
      beyond90Days: number;
    };
    cashflow: {
      inflows: number;
      outflows: number;
      net: number;
    };
    monthlyRevenueTrend: Record<string, number>;
  };
}

const BalanceSheetDisplay: React.FC = () => {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(
    () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 3);
      return date;
    }
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [includeProjections, setIncludeProjections] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
      
      // If dates are provided, use them for the query
      let queryString = '';
      if (formattedStartDate && formattedEndDate) {
        queryString = `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }

      const response = await fetch(`/api/invoices/balance-sheet${queryString}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch balance sheet');
      }

      if (data.success && data.data) {
        setBalanceSheet(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching balance sheet:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomBalanceSheet = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
      
      if (!formattedStartDate || !formattedEndDate) {
        throw new Error('Start date and end date are required');
      }

      const response = await fetch('/api/invoices/balance-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          includeProjections
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch custom balance sheet');
      }

      if (data.success && data.data) {
        setBalanceSheet(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching custom balance sheet:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadBalanceSheet = () => {
    if (!balanceSheet) return;

    // Convert balance sheet to JSON
    const jsonData = JSON.stringify(balanceSheet, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${balanceSheet.period.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading && !balanceSheet) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !balanceSheet) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
        <h3 className="text-red-800 font-medium">Error Loading Balance Sheet</h3>
        <p className="text-red-700 mt-1">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={fetchBalanceSheet}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 pb-4">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIncludeProjections(!includeProjections)}
            className={includeProjections ? "bg-primary/10" : ""}
          >
            {includeProjections ? "Include Projections ✓" : "Include Projections"}
          </Button>
          <Button onClick={fetchCustomBalanceSheet}>
            Generate Balance Sheet
          </Button>
          {balanceSheet && (
            <Button 
              variant="outline" 
              onClick={downloadBalanceSheet}
            >
              <DownloadIcon className="h-4 w-4 mr-2" /> Export
            </Button>
          )}
        </div>
      </div>

      {balanceSheet && (
        <>
          <div className="bg-muted/30 px-4 py-3 rounded-lg">
            <h2 className="text-lg font-semibold">
              Balance Sheet: {balanceSheet.period}
            </h2>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(balanceSheet.generatedAt).toLocaleString()}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
              <TabsTrigger value="metrics">Invoice Metrics</TabsTrigger>
              {balanceSheet.projections && (
                <TabsTrigger value="projections">Projections</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Total Assets:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.summary.totalAssets)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Total Liabilities:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.summary.totalLiabilities)}</dd>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <dt className="font-semibold">Net Worth:</dt>
                          <dd className="font-semibold">{formatCurrency(balanceSheet.summary.netWorth)}</dd>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <dt>Current Ratio:</dt>
                        <dd className="font-medium">{balanceSheet.summary.currentRatio.toFixed(2)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Equity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Net Assets:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.equity.netAssets)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accounts Receivable</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between font-semibold">
                      <dt>Total Accounts Receivable:</dt>
                      <dd>{formatCurrency(balanceSheet.assets.accountsReceivable.total)}</dd>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <h4 className="font-medium mb-2">Aging Breakdown:</h4>
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between">
                          <dt>Current:</dt>
                          <dd>{formatCurrency(balanceSheet.assets.accountsReceivable.breakdown.current)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>1-30 Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.assets.accountsReceivable.breakdown.overdue30)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>31-60 Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.assets.accountsReceivable.breakdown.overdue60)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>90+ Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.assets.accountsReceivable.breakdown.overdue90Plus)}</dd>
                        </div>
                      </div>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <dt>Current Inventory Value:</dt>
                      <dd className="font-medium">{formatCurrency(balanceSheet.assets.inventory || 0)}</dd>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Prepaid Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <dt>Total Prepaid Expenses:</dt>
                      <dd className="font-medium">{formatCurrency(balanceSheet.assets.prepaidExpenses || 0)}</dd>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="liabilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accounts Payable</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between font-semibold">
                      <dt>Total Accounts Payable:</dt>
                      <dd>{formatCurrency(balanceSheet.liabilities.accountsPayable.total)}</dd>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <h4 className="font-medium mb-2">Aging Breakdown:</h4>
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between">
                          <dt>Current:</dt>
                          <dd>{formatCurrency(balanceSheet.liabilities.accountsPayable.breakdown.current)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>1-30 Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.liabilities.accountsPayable.breakdown.overdue30)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>31-60 Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.liabilities.accountsPayable.breakdown.overdue60)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>90+ Days Overdue:</dt>
                          <dd>{formatCurrency(balanceSheet.liabilities.accountsPayable.breakdown.overdue90Plus)}</dd>
                        </div>
                      </div>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {balanceSheet.liabilities.taxes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Tax Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Sales Tax:</dt>
                        <dd>{formatCurrency(balanceSheet.liabilities.taxes.salesTax)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Other Taxes:</dt>
                        <dd>{formatCurrency(balanceSheet.liabilities.taxes.otherTaxes)}</dd>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <dt>Total Tax Liabilities:</dt>
                          <dd>{formatCurrency(balanceSheet.liabilities.taxes.salesTax + balanceSheet.liabilities.taxes.otherTaxes)}</dd>
                        </div>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Invoice Amounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Total Invoiced:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.invoiceMetrics.totalInvoiced)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Total Paid:</dt>
                        <dd className="font-medium text-emerald-600">{formatCurrency(balanceSheet.invoiceMetrics.totalPaid)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Total Pending:</dt>
                        <dd className="font-medium text-amber-600">{formatCurrency(balanceSheet.invoiceMetrics.totalPending)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Total Overdue:</dt>
                        <dd className="font-medium text-red-600">{formatCurrency(balanceSheet.invoiceMetrics.totalOverdue)}</dd>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <dt>Average Invoice Amount:</dt>
                          <dd className="font-medium">{formatCurrency(balanceSheet.invoiceMetrics.averageInvoiceAmount)}</dd>
                        </div>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Invoice Counts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Total Invoices:</dt>
                        <dd className="font-medium">{balanceSheet.invoiceMetrics.invoiceCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Paid Invoices:</dt>
                        <dd className="font-medium text-emerald-600">{balanceSheet.invoiceMetrics.paidCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Pending Invoices:</dt>
                        <dd className="font-medium text-amber-600">{balanceSheet.invoiceMetrics.pendingCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Overdue Invoices:</dt>
                        <dd className="font-medium text-red-600">{balanceSheet.invoiceMetrics.overdueCount}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {balanceSheet.projections && (
              <TabsContent value="projections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Accounts Receivable Collections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Next 30 Days:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.projections.accountsReceivableCollections.next30Days)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>31-60 Days:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.projections.accountsReceivableCollections.next60Days)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>61-90 Days:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.projections.accountsReceivableCollections.next90Days)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Beyond 90 Days:</dt>
                        <dd className="font-medium">{formatCurrency(balanceSheet.projections.accountsReceivableCollections.beyond90Days)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Projected Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt>Projected Inflows:</dt>
                        <dd className="font-medium text-emerald-600">{formatCurrency(balanceSheet.projections.cashflow.inflows)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Projected Outflows:</dt>
                        <dd className="font-medium text-red-600">{formatCurrency(balanceSheet.projections.cashflow.outflows)}</dd>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <dt className="font-semibold">Net Cash Flow:</dt>
                          <dd className={`font-semibold ${balanceSheet.projections.cashflow.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(balanceSheet.projections.cashflow.net)}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(balanceSheet.projections.monthlyRevenueTrend)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([month, amount]) => (
                          <div key={month} className="flex justify-between">
                            <dt>{month}</dt>
                            <dd className="font-medium">{formatCurrency(amount)}</dd>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default BalanceSheetDisplay; 