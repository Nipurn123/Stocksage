'use client';

import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Calendar,
  Input,
  Label,
} from '@/components/ui';
import { FunnelIcon, XMarkIcon, CalendarIcon, CurrencyDollarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { format, isValid } from 'date-fns';

interface FilterDropdownProps {
  onApplyFilters: (filters: {
    dateRange?: { from: Date; to: Date };
    amount?: { min: number; max: number };
    vendors?: string[];
    customFields?: Record<string, string>;
  }) => void;
}

export default function FilterDropdown({ onApplyFilters }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'date' | 'amount' | 'vendor'>('date');
  
  // Check if any filters are applied
  const hasActiveFilters = !!(
    (dateRange.from && dateRange.to) || 
    minAmount || 
    maxAmount || 
    vendorFilter
  );

  // Count active filters
  const activeFilterCount = [
    dateRange.from && dateRange.to ? 1 : 0,
    minAmount || maxAmount ? 1 : 0,
    vendorFilter ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);
  
  const handleApplyFilters = () => {
    const filters: any = {};
    
    if (dateRange.from && dateRange.to) {
      filters.dateRange = {
        from: dateRange.from,
        to: dateRange.to
      };
    }
    
    if (minAmount || maxAmount) {
      filters.amount = {
        min: minAmount ? parseFloat(minAmount) : 0,
        max: maxAmount ? parseFloat(maxAmount) : Infinity
      };
    }
    
    if (vendorFilter) {
      filters.vendors = [vendorFilter];
    }
    
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const handleClearFilters = () => {
    setDateRange({});
    setMinAmount('');
    setMaxAmount('');
    setVendorFilter('');
    onApplyFilters({});
    setIsOpen(false);
  };

  // Preset date ranges
  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    let from: Date = today;
    
    switch (preset) {
      case 'today':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'week':
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break;
      case 'quarter':
        from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case 'year':
        from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break;
    }
    
    setDateRange({ from, to: today });
  };
  
  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant={hasActiveFilters ? "primary" : "outline"} 
            size="sm"
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-800 dark:text-blue-100">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[350px] p-0 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg z-50" 
          align="end"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('date')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === 'date'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date Range
                </div>
              </button>
              <button
                onClick={() => setActiveTab('amount')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === 'amount'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Amount
                </div>
              </button>
              <button
                onClick={() => setActiveTab('vendor')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === 'vendor'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                  Vendor
                </div>
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'date' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDatePreset('today')}
                    className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('week')}
                    className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Last 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('month')}
                    className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Last 30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatePreset('year')}
                    className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Last Year
                  </button>
                </div>
                
                <div>
                  <Calendar
                    mode="range"
                    selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(newDateRange) => {
                      if (newDateRange) {
                        setDateRange(newDateRange as { from: Date; to?: Date });
                      } else {
                        setDateRange({});
                      }
                    }}
                    initialFocus
                    className="border rounded-md p-2"
                  />
                </div>
                
                {dateRange.from && dateRange.to && (
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {isValid(dateRange.from) && isValid(dateRange.to) && (
                        <>
                          {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear date range"
                      onClick={() => setDateRange({})}
                      className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'amount' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="min-amount" className="text-sm">Min Amount ($)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="Min Amount"
                    className="mt-1"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="max-amount" className="text-sm">Max Amount ($)</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="Max Amount"
                    className="mt-1"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
                
                {(minAmount || maxAmount) && (
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      {minAmount && maxAmount 
                        ? `$${minAmount} - $${maxAmount}`
                        : minAmount 
                          ? `Min: $${minAmount}` 
                          : `Max: $${maxAmount}`}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear amount range"
                      onClick={() => {
                        setMinAmount('');
                        setMaxAmount('');
                      }}
                      className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'vendor' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendor-filter" className="text-sm">Vendor Name</Label>
                  <Input
                    id="vendor-filter"
                    type="text"
                    placeholder="Search vendors"
                    className="mt-1"
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                  />
                  
                  {vendorFilter && (
                    <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-2 flex items-center justify-between">
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        Vendor: {vendorFilter}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear vendor filter"
                        onClick={() => setVendorFilter('')}
                        className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                className="flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
              <Button 
                size="sm" 
                onClick={handleApplyFilters}
                disabled={!(dateRange.from && dateRange.to) && !minAmount && !maxAmount && !vendorFilter}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 