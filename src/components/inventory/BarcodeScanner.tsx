'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { toast } from 'react-hot-toast';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose?: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onBarcodeDetected, 
  onClose 
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  // Initialize the barcode reader with specific formats
  useEffect(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_8,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_128
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    
    readerRef.current = new BrowserMultiFormatReader(hints);
    
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  // Get available camera devices
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      toast.error('Camera access is not supported in this browser');
      return;
    }

    const getDevices = async () => {
      try {
        // First request camera permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        
        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        toast.error('Unable to access camera. Please check permissions.');
      }
    };

    getDevices();
  }, []);

  // Start scanning for barcodes
  const startScanning = useCallback(() => {
    if (!webcamRef.current?.video || !readerRef.current) return;
    
    setIsScanning(true);
    const scanInterval = setInterval(() => {
      if (!webcamRef.current?.video || !readerRef.current) {
        clearInterval(scanInterval);
        return;
      }
      
      try {
        readerRef.current.decodeFromVideoElement(webcamRef.current.video)
          .then(result => {
            if (result) {
              const barcodeText = result.getText();
              onBarcodeDetected(barcodeText);
              clearInterval(scanInterval);
              setIsScanning(false);
              toast.success(`Barcode detected: ${barcodeText}`);
            }
          })
          .catch(err => {
            // Suppress errors during scanning
            // This will error frequently until a barcode is found
          });
      } catch (error) {
        console.error('Error during scanning:', error);
      }
    }, 100);

    return () => clearInterval(scanInterval);
  }, [onBarcodeDetected]);

  // Effect to start scanning when component is mounted and camera is selected
  useEffect(() => {
    if (selectedCamera && webcamRef.current?.video) {
      const scanner = startScanning();
      return () => {
        if (typeof scanner === 'function') scanner();
      };
    }
  }, [selectedCamera, startScanning]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
  };

  if (hasPermission === false) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-400">
          Camera access denied. Please enable camera permissions in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md mx-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Barcode Scanner</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {cameraDevices.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={handleCameraChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
          >
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${cameraDevices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {selectedCamera ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{
              deviceId: selectedCamera,
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white">Loading camera...</p>
          </div>
        )}
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="border-2 border-blue-500 w-3/4 h-1/2 flex items-center justify-center">
              {isScanning && (
                <div className="animate-pulse text-blue-500 font-bold">
                  Scanning...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Position the barcode within the frame to scan
      </div>
    </div>
  );
};

export default BarcodeScanner; 