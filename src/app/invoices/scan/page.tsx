'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button, Card } from '@/components/ui';
import { FileUploader, InvoiceAnalysis } from '@/components/invoices';
import { toast } from 'react-hot-toast';
import type { InvoiceAnalysisResult } from '@/types/invoice';

export default function InvoiceScannerPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<InvoiceAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File, preview: string) => {
    setFile(selectedFile);
    setPreviewUrl(preview);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
  };

  const handleAnalyzeInvoice = async () => {
    if (!file) {
      toast.error('Please upload an invoice image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      toast.loading('Analyzing your invoice with Gemini AI...', {
        id: 'analyze-invoice',
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/invoices/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze invoice');
      }

      toast.success('Invoice analysis complete!', {
        id: 'analyze-invoice',
      });
      
      setAnalysisResult(result);
      
      // If analysis failed but we got a specific error message from the API
      if (!result.success && result.error) {
        toast.error(result.error, { id: 'analyze-error' });
      }
    } catch (error) {
      console.error('Error analyzing invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze invoice', {
        id: 'analyze-invoice',
      });
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analysisResult || !analysisResult.success || !analysisResult.data) {
      toast.error('No valid invoice data to save');
      return;
    }

    // If already saved, show notification
    if (analysisResult.invoiceId || savedInvoiceId) {
      toast.success('Invoice already saved to database');
      return;
    }

    try {
      setIsSaving(true);
      toast.loading('Saving invoice to database...', {
        id: 'save-invoice',
      });

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: analysisResult.data
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save invoice');
      }

      toast.success('Invoice saved to database!', {
        id: 'save-invoice',
      });
      
      // Update saved invoice ID
      setSavedInvoiceId(result.id);
      
      // Update analysis result with invoice ID if it doesn't already have one
      if (!analysisResult.invoiceId) {
        setAnalysisResult({
          ...analysisResult,
          invoiceId: result.id
        });
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice', {
        id: 'save-invoice',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult || !analysisResult.success || !analysisResult.data) {
      toast.error('No valid invoice data to download');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      toast.loading('Generating invoice PDF...', {
        id: 'download-pdf',
      });

      const response = await fetch('/api/invoices/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: analysisResult.data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF as a blob
      const pdfBlob = await response.blob();
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${analysisResult.data.invoiceNumber || 'scanned'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF generated and downloaded!', {
        id: 'download-pdf',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF', {
        id: 'download-pdf',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-heading mb-3">
        <h1 className="page-title">Invoice Scanner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload invoice images to automatically extract data using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
        <div className="relative lg:col-span-1 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full p-5 overflow-hidden">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Upload Invoice</h2>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <FileUploader
                onFileSelected={handleFileSelected}
                onReset={handleReset}
                previewUrl={previewUrl}
                isLoading={isAnalyzing}
              />
            </div>
          </Card>
          
          {file && !isAnalyzing && !analysisResult && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto px-5">
              <Button onClick={handleAnalyzeInvoice} fullWidth className="shadow-lg">
                Analyze Invoice
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-full p-5 overflow-hidden">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Analysis Results</h2>
            <div className="flex-grow overflow-auto">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing invoice with Gemini AI...</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">This may take up to 15-20 seconds</p>
                </div>
              ) : analysisResult ? (
                <div className="flex flex-col h-full">
                  <div className="flex-grow overflow-auto pb-2">
                    <InvoiceAnalysis result={analysisResult} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">
                    Upload an invoice and click "Analyze Invoice" to see the results here.
                  </p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    Supported formats: JPG, PNG, PDF, GIF (max. 10MB)
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {analysisResult && !isAnalyzing && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button 
                onClick={handleSaveToDatabase} 
                className="shadow-md"
                disabled={isSaving || !!savedInvoiceId || !!analysisResult.invoiceId}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Saving...
                  </>
                ) : savedInvoiceId || analysisResult.invoiceId ? (
                  <>
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to Database
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                variant="outline" 
                className="shadow-md"
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-primary-600 rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 