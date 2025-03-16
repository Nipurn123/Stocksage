'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui';

export interface FileUploaderProps {
  onFileSelected: (file: File, previewUrl: string) => void;
  onReset: () => void;
  previewUrl: string | null;
  isLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  onReset,
  previewUrl,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      // Create preview URL based on file type
      const objectUrl = URL.createObjectURL(file);
      
      // For PDF files, append .pdf to the previewUrl to help identify it for display
      const previewUrl = file.type === 'application/pdf' 
        ? `${objectUrl}#.pdf` 
        : objectUrl;
        
      onFileSelected(file, previewUrl);
      setError(null);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.tiff'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div className="h-full w-full flex flex-col">
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex-1 flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-800/50 hover:bg-gray-100 dark:hover:bg-dark-700/50'
          } ${isDragReject || error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''} ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="space-y-3 text-center">
            <svg
              className={`mx-auto h-14 w-14 ${
                isDragReject || error
                  ? 'text-red-500'
                  : isDragActive
                  ? 'text-primary-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <p>
                  <span className="text-primary-600 dark:text-primary-400 font-medium">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG, PDF or GIF (max. 10MB)
            </p>
            {(isDragReject || error) && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error || 'Invalid file type. Please upload a valid image or PDF.'}
              </p>
            )}
          </div>
          <input {...getInputProps()} />
        </div>
      ) : (
        <div className="relative rounded-lg border border-gray-200 dark:border-dark-700 flex-1 flex items-center justify-center overflow-hidden">
          {previewUrl.includes('.pdf') ? (
            <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-dark-800 p-4">
              <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">PDF Document</span>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Invoice preview"
              className="max-h-[calc(100vh-200px)] max-w-full object-contain"
              style={{ display: 'block' }}
              onError={(e) => {
                // Handle image loading error
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTE3LjI5MyAyLjI5M2MtMC4zOS0wLjM5LTEuMDI0LTAuMzktMS40MTQgMGwtMTQgMTRjLTAuMzkgMC4zOS0wLjM5IDEuMDI0IDAgMS40MTQgMC4xOTUgMC4xOTUgMC40NTEgMC4yOTMgMC43MDcgMC4yOTNzMC41MTItMC4wOTggMC43MDctMC4yOTNsMTQtMTRjMC4zOS0wLjM5IDAuMzktMS4wMjQgMC0xLjQxNHpNNCA0aDEyYzAuNTUyIDAgMSAwLjQ0OCAxIDFzLTAuNDQ4IDEtMSAxaC0xMmMtMC41NTIgMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xIDEtMXpNNCA4aDEyYzAuNTUyIDAgMSAwLjQ0OCAxIDFzLTAuNDQ4IDEtMSAxaC0xMmMtMC41NTIgMC0xLTAuNDQ4LTEtMXMwLjQ0OC0xIDEtMXpNNCAxMmgxMmMwLjU1MiAwIDEgMC40NDggMSAxcy0wLjQ0OCAxLTEgMWgtMTJjLTAuNTUyIDAtMS0wLjQ0OC0xLTFzMC40NDgtMSAxLTF6TTQgMThoMTJ2MmgtMTJ2LTJ6Ii8+PC9zdmc+';
              }}
            />
          )}
          
          {!isLoading && (
            <button 
              className="absolute top-3 right-3 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 