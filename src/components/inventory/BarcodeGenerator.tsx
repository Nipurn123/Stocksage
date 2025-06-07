'use client';

import React, { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeGeneratorProps {
  value: string;
  type: 'barcode' | 'qrcode';
  productInfo?: {
    name: string;
    sku: string;
    price: number;
    description?: string;
  };
  width?: number;
  height?: number;
  displayValue?: boolean;
  size?: number; // For QR code
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  type,
  productInfo,
  width = 2,
  height = 100,
  displayValue = true,
  size = 128
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  
  // Generate barcode
  useEffect(() => {
    if (type === 'barcode' && barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          margin: 10,
          background: 'transparent',
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [type, value, width, height, displayValue]);
  
  // Generate QR code
  useEffect(() => {
    if (type === 'qrcode' && qrCodeRef.current && value) {
      try {
        // If product info is provided, create a JSON string for the QR code
        const qrValue = productInfo 
          ? JSON.stringify({
              barcode: value,
              name: productInfo.name,
              sku: productInfo.sku,
              price: productInfo.price,
              description: productInfo.description,
            })
          : value;
          
        QRCode.toCanvas(qrCodeRef.current, qrValue, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }, [type, value, productInfo, size]);
  
  // Function to save barcode as image
  const handleSave = () => {
    let element: SVGSVGElement | HTMLCanvasElement | null = null;
    let filename = '';
    
    if (type === 'barcode' && barcodeRef.current) {
      element = barcodeRef.current;
      filename = `barcode-${value}.png`;
    } else if (type === 'qrcode' && qrCodeRef.current) {
      element = qrCodeRef.current;
      filename = `qrcode-${value}.png`;
    }
    
    if (!element) return;
    
    // Convert SVG/Canvas to image and download
    const serializer = new XMLSerializer();
    let source = '';
    
    if (element instanceof SVGSVGElement) {
      const svgData = serializer.serializeToString(element);
      source = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    } else if (element instanceof HTMLCanvasElement) {
      source = element.toDataURL('image/png');
    }
    
    if (!source) return;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = source;
    link.click();
  };
  
  // Function to print barcode
  const handlePrint = () => {
    let element: SVGSVGElement | HTMLCanvasElement | null = null;
    
    if (type === 'barcode' && barcodeRef.current) {
      element = barcodeRef.current;
    } else if (type === 'qrcode' && qrCodeRef.current) {
      element = qrCodeRef.current;
    }
    
    if (!element) return;
    
    // Create a new window with just the barcode/QR code
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;
    
    // Add product information if available
    let productInfoHtml = '';
    if (productInfo) {
      productInfoHtml = `
        <div style="margin-top: 20px; text-align: center; font-family: Arial, sans-serif;">
          <p style="margin: 5px 0;"><strong>${productInfo.name}</strong></p>
          <p style="margin: 5px 0;">SKU: ${productInfo.sku}</p>
          <p style="margin: 5px 0;">Price: $${productInfo.price.toFixed(2)}</p>
          ${productInfo.description ? `<p style="margin: 5px 0;">${productInfo.description}</p>` : ''}
        </div>
      `;
    }
    
    // Write the contents to the new window
    if (element instanceof SVGSVGElement) {
      const svgData = new XMLSerializer().serializeToString(element);
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; }
              .barcode-container { text-align: center; }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              ${svgData}
              ${productInfoHtml}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
    } else if (element instanceof HTMLCanvasElement) {
      const imgData = element.toDataURL('image/png');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; }
              .qrcode-container { text-align: center; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <div class="qrcode-container">
              <img src="${imgData}" alt="QR Code" />
              ${productInfoHtml}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
    }
    
    printWindow.document.close();
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {type === 'barcode' ? (
        <svg ref={barcodeRef} className="w-full max-w-xs"></svg>
      ) : (
        <canvas ref={qrCodeRef} className="w-full max-w-xs"></canvas>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Save as image"
        >
          Save as Image
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Print"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default BarcodeGenerator; 