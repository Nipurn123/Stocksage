'use client';

import React, { useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface GlobalErrorHandlerProps {
  children: ReactNode;
}

/**
 * Global error handler component to catch unhandled errors and promise rejections
 */
export default function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  useEffect(() => {
    // Handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      console.error('Unhandled error:', event.error || event.message);
      
      // Show a toast notification for the error
      toast.error('An unexpected error occurred. Please try again.', {
        id: 'global-error',
      });
      
      // You can add error reporting/logging here if needed
    };

    // Handler for unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      
      const reason = event.reason;
      let errorMsg = 'An operation failed. Please try again.';
      
      console.error('Unhandled promise rejection:', reason);
      
      // Special handling for [object Event] rejections
      if (reason && reason.toString() === '[object Event]') {
        console.error('Event object rejection detected');
        
        try {
          // Try to get more details from the event
          if (reason.type) {
            errorMsg = `${reason.type} error occurred. Please try again.`;
          }
          
          // Try to extract message from target
          if (reason.target && reason.target.error) {
            errorMsg = reason.target.error.message || errorMsg;
          }
        } catch (extractError) {
          console.error('Failed to extract error details from Event:', extractError);
        }
      } else if (reason instanceof Error) {
        // Handle standard Error objects
        errorMsg = reason.message || errorMsg;
      } else if (typeof reason === 'string') {
        // Handle string reasons
        errorMsg = reason;
      }
      
      // Show a toast notification for the rejection
      toast.error(errorMsg, {
        id: 'promise-rejection',
      });
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return <>{children}</>;
} 