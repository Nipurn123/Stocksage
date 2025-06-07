'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { toast } from 'react-hot-toast';

interface ScannedItem {
  barcode: string;
  quantity: number;
  timestamp: Date;
  productName?: string;
  productSku?: string;
  currentStock?: number;
}

interface BulkScannerProps {
  onComplete: (scannedItems: ScannedItem[]) => void;
  onCancel?: () => void;
}

export const BulkScanner: React.FC<BulkScannerProps> = ({ 
  onComplete,
  onCancel
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Handle barcode detection
  const handleBarcodeDetected = async (barcode: string) => {
    setCurrentBarcode(barcode);
    
    // Check if this barcode has already been scanned
    const existingItem = scannedItems.find(item => item.barcode === barcode);
    
    if (existingItem) {
      // Increment quantity if already scanned
      setScannedItems(prevItems => 
        prevItems.map(item => 
          item.barcode === barcode 
            ? { ...item, quantity: item.quantity + 1, timestamp: new Date() } 
            : item
        )
      );
      
      toast.success(`Added another ${existingItem.productName || barcode} (Total: ${(existingItem.quantity || 0) + 1})`);
      
      // Reset for next scan after a delay
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        setCurrentBarcode(null);
        setIsScanning(true);
      }, 1500);
      
      return;
    }
    
    // Fetch product details for new barcode
    setIsFetchingProduct(true);
    
    try {
      const response = await fetch(`/api/inventory/barcode?barcode=${encodeURIComponent(barcode)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        const { name, sku, currentStock } = data.product;
        
        setScannedItems(prev => [
          ...prev, 
          { 
            barcode, 
            quantity: 1, 
            timestamp: new Date(),
            productName: name,
            productSku: sku,
            currentStock
          }
        ]);
        
        toast.success(`Added ${name || barcode}`);
      } else {
        // Product not found, still add to list but without details
        setScannedItems(prev => [
          ...prev, 
          { barcode, quantity: 1, timestamp: new Date() }
        ]);
        
        toast.warning(`Added unknown product with barcode: ${barcode}`);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      // Still add to list even if fetch fails
      setScannedItems(prev => [
        ...prev, 
        { barcode, quantity: 1, timestamp: new Date() }
      ]);
      
      toast.error('Failed to fetch product details, but barcode was recorded');
    } finally {
      setIsFetchingProduct(false);
      
      // Reset for next scan after a delay
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        setCurrentBarcode(null);
        setIsScanning(true);
      }, 1500);
    }
  };

  // Handle manual quantity change
  const handleQuantityChange = (barcode: string, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    
    setScannedItems(prev => 
      prev.map(item => 
        item.barcode === barcode ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from scan list
  const handleRemoveItem = (barcode: string) => {
    setScannedItems(prev => prev.filter(item => item.barcode !== barcode));
    toast.success('Item removed');
  };

  // Complete the bulk scan
  const handleComplete = () => {
    if (scannedItems.length === 0) {
      toast.error('No items have been scanned');
      return;
    }
    
    onComplete(scannedItems);
  };

  // Toggle scanning state
  const toggleScanning = () => {
    setIsScanning(prev => !prev);
    if (!isScanning) {
      setCurrentBarcode(null);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bulk Scan Mode</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleScanning}
            className={`px-4 py-2 rounded-md ${
              isScanning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            aria-label={isScanning ? 'Pause scanning' : 'Start scanning'}
          >
            {isScanning ? 'Pause Scanning' : 'Start Scanning'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Cancel scanning"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {isScanning && (
        <div className="w-full max-w-md mx-auto">
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onClose={() => setIsScanning(false)}
          />
        </div>
      )}
      
      {currentBarcode && isFetchingProduct && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
          <span>Looking up product...</span>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-medium">Scanned Items ({scannedItems.length})</h3>
          <button
            onClick={handleComplete}
            disabled={scannedItems.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Complete scanning"
          >
            Complete
          </button>
        </div>
        
        {scannedItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No items scanned yet. Use the scanner to begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {scannedItems.map((item) => (
                  <tr key={item.barcode}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.productName || 'Unknown Product'}
                      </div>
                      {item.productSku && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {item.productSku}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.barcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item.barcode, item.quantity - 1)}
                          className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          aria-label="Decrease quantity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.barcode, parseInt(e.target.value) || 1)}
                          className="mx-2 w-16 p-1 text-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          aria-label="Item quantity"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.barcode, item.quantity + 1)}
                          className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          aria-label="Increase quantity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.barcode)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkScanner; 