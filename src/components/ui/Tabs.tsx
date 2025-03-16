'use client';

import React, { useState, useEffect } from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  tabs?: { key: string; title: string }[];
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  tabsListId: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = '',
  tabs 
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  // Generate unique ID for the tabslist for ARIA relationships
  const tabsListId = React.useId();

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    value: internalValue,
    onValueChange: handleValueChange,
    tabsListId
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsList must be used within a Tabs component');
  }
  
  return (
    <div
      id={context.tabsListId}
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass an aria-controls prop to TabsTrigger if it doesn't already have one
          return React.cloneElement(child as React.ReactElement, {
            "aria-controls": (child.props as any)["aria-controls"] || undefined,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-controls"?: string;
}

export function TabsTrigger({ 
  value, 
  children, 
  className = '',
  id,
  disabled = false,
  "aria-controls": ariaControls,
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange, tabsListId } = context;
  const isSelected = selectedValue === value;
  const tabId = id || `tab-${value}`;
  const panelId = ariaControls || `panel-${value}`;
  
  return (
    <button
      role="tab"
      type="button"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-labelledby={tabsListId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={`
        relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
        ${isSelected ? 'bg-white dark:bg-gray-950 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function TabsContent({ value, children, className = '', id }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { value: selectedValue } = context;
  const isSelected = selectedValue === value;
  const panelId = id || `panel-${value}`;
  const tabId = `tab-${value}`;
  
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isSelected}
      tabIndex={0}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {isSelected && children}
    </div>
  );
} 