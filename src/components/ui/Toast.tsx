'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | null;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto dismiss the toast after duration
  useEffect(() => {
    if (message && type) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, type, duration, onClose]);

  if (!type || !message) return null;

  // Generate classes based on toast type
  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  // Icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-md shadow-lg border 
        ${getTypeClasses()} 
        ${isVisible ? 'animate-fadeIn' : 'animate-fadeOut opacity-0'} 
        transition-opacity duration-300`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          type="button" 
          className="ml-3 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Add Toast component to index.ts exports
export default Toast; 