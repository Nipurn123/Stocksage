'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  ScanLine, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Copy, 
  BadgeCheck, 
  Download,
  ArrowRight,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Toast from '@/components/ui/Toast';
import type { Invoice, InvoiceAnalysisResult } from '@/types/invoice';
import InvoiceAnalysis from '@/components/invoices/InvoiceAnalysis';

interface ScannerState {
  isLoading: boolean;
  error: string | null;
  result: InvoiceAnalysisResult | null;
}

export default function InvoiceScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState>({
    isLoading: false,
    error: null,
    result: null
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({
    message: '',
    type: null
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setScannerState({
      isLoading: false,
      error: null,
      result: null
    });
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScannerState(prev => ({
        ...prev,
        error: 'File size exceeds 10MB limit'
      }));
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setScannerState(prev => ({
        ...prev,
        error: 'Invalid file type. Please upload a JPG, PNG, WebP, or HEIC image.'
      }));
      return;
    }

    setSelectedFile(file);

    // Create and set preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clear the selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScannerState({
      isLoading: false,
      error: null,
      result: null
    });
  };

  // Handle invoice scanning
  const handleScanInvoice = async () => {
    if (!selectedFile) return;

    setScannerState({
      isLoading: true,
      error: null,
      result: null
    });

    try {
      // Create a form data object to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the API
      const response = await fetch('/api/invoices/analyze', {
        method: 'POST',
        body: formData
      });

      // Parse the response
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'An error occurred while scanning the invoice');
      }

      // If the analysis was successful but there was a database error
      if (result.success && result.dbError) {
        setToast({
          message: 'Invoice scanned successfully but could not be saved to the database',
          type: 'info'
        });
      } else if (result.success) {
        setToast({
          message: 'Invoice scanned successfully!',
          type: 'success'
        });
      } else {
        setToast({
          message: result.error || 'Failed to scan invoice',
          type: 'error'
        });
      }

      setScannerState({
        isLoading: false,
        error: null,
        result
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      setScannerState({
        isLoading: false,
        error: errorMessage,
        result: null
      });
      
      setToast({
        message: errorMessage,
        type: 'error'
      });
      
      console.error('Error scanning invoice:', err);
    }
  };

  // Handle creating invoice from extracted data
  const handleCreateInvoice = () => {
    if (!scannerState.result?.data) return;
    
    // In production, this would redirect to invoice creation with pre-filled data
    // For now, we'll just navigate to the create page
    const encodedData = encodeURIComponent(JSON.stringify(scannerState.result.data));
    window.location.href = `/invoice/create?data=${encodedData}`;
  };

  // Format currency values
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date values
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (err) {
      return dateString;
    }
  };

  // Copy invoice data to clipboard
  const copyToClipboard = () => {
    if (!scannerState.result?.data) return;
    
    navigator.clipboard.writeText(JSON.stringify(scannerState.result.data, null, 2))
      .then(() => {
        setToast({
          message: 'Invoice data copied to clipboard',
          type: 'success'
        });
      })
      .catch(() => {
        setToast({
          message: 'Failed to copy to clipboard',
          type: 'error'
        });
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Invoice Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Upload an invoice image to automatically extract data using WeaveMitra's advanced AI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Panel */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Upload Invoice</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              selectedFile 
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/heic"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className={`h-12 w-12 mb-3 ${
                selectedFile ? 'text-green-500' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP or HEIC (max. 10MB)
              </p>
            </label>
          </div>

          {scannerState.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{scannerState.error}</p>
            </div>
          )}

          {previewUrl && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Preview:</h3>
                <button 
                  onClick={handleClearFile}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
              </div>
              <div className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={previewUrl}
                  alt="Invoice preview"
                  className="w-full object-contain max-h-[400px]"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button 
              onClick={handleScanInvoice} 
              disabled={!selectedFile || scannerState.isLoading}
              className="w-full"
            >
              {scannerState.isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing Invoice...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4 mr-2" />
                  Scan Invoice
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Extracted Data</h2>
          
          <InvoiceAnalysis 
            result={scannerState.result}
            onCopy={copyToClipboard}
            onCreateInvoice={handleCreateInvoice}
          />
        </Card>
      </div>
      
      {/* Features Section */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Features of AI Invoice Scanner</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              1
            </div>
            <h3 className="font-medium">Automatic Data Extraction</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI automatically extracts key information from your invoice images with high accuracy
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              2
            </div>
            <h3 className="font-medium">Intelligent Line Item Detection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically identifies and extracts individual line items from complex invoice formats
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              3
            </div>
            <h3 className="font-medium">Create Invoice Instantly</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Convert scanned data directly into a new invoice in your system with a single click
            </p>
          </div>
        </div>
      </Card>
      
      {/* Toast notification */}
      {toast.type && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ message: '', type: null })}
        />
      )}
    </div>
  );
} 