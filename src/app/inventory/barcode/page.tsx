'use client';

import React, { useState } from 'react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import Card from '@/components/ui/Card';
import { BulkScanner } from '@/components/inventory/BulkScanner';
import { toast } from 'react-hot-toast';
import { QrCode, ClipboardList, BarChart } from 'lucide-react';

interface ScannedItem {
  barcode: string;
  quantity: number;
  timestamp: Date;
  productName?: string;
  productSku?: string;
  currentStock?: number;
}

enum OperationType {
  STOCK_IN = 'in',
  STOCK_OUT = 'out',
  STOCKTAKE = 'stocktake'
}

export default function BarcodeScanningPage() {
  const [activeTab, setActiveTab] = useState<OperationType>(OperationType.STOCK_IN);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<{
    success: ScannedItem[];
    failed: { item: ScannedItem; error: string }[];
  }>({ success: [], failed: [] });

  // Handle scan completion
  const handleScanComplete = (items: ScannedItem[]) => {
    setScannedItems(items);
    setIsScanComplete(true);
  };

  // Start a new scan
  const handleNewScan = () => {
    setScannedItems([]);
    setIsScanComplete(false);
    setProcessingResults({ success: [], failed: [] });
  };

  // Process scanned items
  const processItems = async () => {
    setIsProcessing(true);
    const successfulItems: ScannedItem[] = [];
    const failedItems: { item: ScannedItem; error: string }[] = [];

    try {
      // Use the batch processing endpoint
      const response = await fetch('/api/inventory/barcode/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: scannedItems,
          type: activeTab,
          source: 'barcode-scanner',
          notes: `Processed via barcode scanner on ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Process results
        const results = data.results || [];
        
        interface ProcessingResult {
          barcode: string;
          success: boolean;
          error?: string;
          productId?: string;
          productName?: string;
        }

        for (let i = 0; i < scannedItems.length; i++) {
          const item = scannedItems[i];
          const result = results.find((r: ProcessingResult) => r.barcode === item.barcode);
          
          if (result && result.success) {
            successfulItems.push(item);
          } else {
            failedItems.push({ 
              item, 
              error: result ? (result.error || 'Unknown error') : 'No result returned'
            });
          }
        }
      } else {
        // Handle API failure
        scannedItems.forEach(item => {
          failedItems.push({ 
            item, 
            error: data.error || 'API request failed'
          });
        });
      }
    } catch (error) {
      console.error('Error processing items:', error);
      // If the entire request fails, mark all items as failed
      scannedItems.forEach(item => {
        failedItems.push({ 
          item, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      });
    }

    setProcessingResults({
      success: successfulItems,
      failed: failedItems,
    });

    setIsProcessing(false);

    // Show toast notification
    if (failedItems.length === 0) {
      toast.success(`Successfully processed ${successfulItems.length} items`);
    } else {
      toast.error(`Failed to process ${failedItems.length} of ${scannedItems.length} items`);
    }
  };

  // Get the title and description based on the operation type
  const getOperationInfo = () => {
    switch (activeTab) {
      case OperationType.STOCK_IN:
        return {
          title: 'Stock In',
          description: 'Add inventory by scanning product barcodes'
        };
      case OperationType.STOCK_OUT:
        return {
          title: 'Stock Out',
          description: 'Remove inventory by scanning product barcodes'
        };
      case OperationType.STOCKTAKE:
        return {
          title: 'Stocktake',
          description: 'Update actual inventory levels by scanning products'
        };
    }
  };

  const { title, description } = getOperationInfo();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barcode Scanning</h1>
          <p className="text-muted-foreground">
            Quickly update inventory by scanning product barcodes
          </p>
        </div>
      </div>

      <Card 
        title={title}
        subtitle={description}
      >
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as OperationType);
            // Reset the state when changing tabs
            handleNewScan();
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger 
              value={OperationType.STOCK_IN} 
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Stock In</span>
            </TabsTrigger>
            <TabsTrigger 
              value={OperationType.STOCK_OUT} 
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Stock Out</span>
            </TabsTrigger>
            <TabsTrigger 
              value={OperationType.STOCKTAKE} 
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Stocktake</span>
            </TabsTrigger>
          </TabsList>

          {/* All tabs share the same content */}
          <TabsContent value={activeTab} className="mt-4">
            {!isScanComplete && (
              <BulkScanner
                onComplete={handleScanComplete}
                onCancel={handleNewScan}
              />
            )}

            {isScanComplete && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                  <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                    Scan Complete
                  </h3>
                  <p className="text-green-700 dark:text-green-400">
                    Successfully scanned {scannedItems.length} items. Please review and process.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handleNewScan}>
                    New Scan
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={processItems}
                    disabled={isProcessing || scannedItems.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-transparent rounded-full border-t-white"></div>
                        Processing...
                      </>
                    ) : (
                      `Process ${scannedItems.length} Items`
                    )}
                  </Button>
                </div>

                {processingResults.success.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md mt-4">
                    <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                      Successfully Processed
                    </h3>
                    <p className="text-green-700 dark:text-green-400">
                      {processingResults.success.length} items were successfully processed.
                    </p>
                  </div>
                )}

                {processingResults.failed.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mt-4">
                    <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                      Failed to Process
                    </h3>
                    <ul className="text-red-700 dark:text-red-400 list-disc pl-5">
                      {processingResults.failed.map((failed, index) => (
                        <li key={index}>
                          {failed.item.productName || failed.item.barcode}: {failed.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 