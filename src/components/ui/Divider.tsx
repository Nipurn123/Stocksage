import React from 'react';

interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return (
    <div className={`h-px bg-gray-300 dark:bg-gray-700 w-full ${className}`} />
  );
}; 