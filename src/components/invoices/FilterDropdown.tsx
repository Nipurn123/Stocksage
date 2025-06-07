'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Popover, 
  PopoverContent, 
  PopoverTrigger, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Calendar, 
  Input, 
  Label, 
  Badge 
} from '@/components/ui';
import { Filter, Calendar as CalendarIcon, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';

interface FilterDropdownProps {
  onApplyFilters: (filters: {
    dateRange?: { from: Date; to: Date };
    amount?: { min: number; max: number };
    vendors?: string[];
    customFields?: Record<string, string>;
  }) => void;
}

export function FilterDropdown({ onApplyFilters }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('date');
  
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
      filters.vendors = vendorFilter.split(',').map(v => v.trim());
    }
    
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const clearFilters = () => {
    setDateRange({});
    setMinAmount('');
    setMaxAmount('');
    setVendorFilter('');
    onApplyFilters({});
    setIsOpen(false);
  };
  
  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1); // First day of last month
    
    const lastDayOfLastMonth = new Date(today);
    lastDayOfLastMonth.setDate(0); // Last day of last month
    
    setDateRange({
      from: lastMonth,
      to: lastDayOfLastMonth
    });
  };
  
  const setThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateRange({
      from: firstDayOfMonth,
      to: today
    });
  };
  
  const setLast30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setDateRange({
      from: thirtyDaysAgo,
      to: today
    });
  };
  
  const setLast90Days = () => {
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    setDateRange({
      from: ninetyDaysAgo,
      to: today
    });
  };
  
  const hasActiveFilters = !!(dateRange.from && dateRange.to) || !!minAmount || !!maxAmount || !!vendorFilter;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasActiveFilters ? "default" : "outline"} 
          className={`flex items-center gap-2 border border-gray-300 dark:border-gray-700 ${hasActiveFilters ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' : 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'} transition-all duration-200`}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-white/20 hover:bg-white/20 text-white border-none"
            >
              {Object.entries({
                Date: dateRange.from && dateRange.to,
                Amount: minAmount || maxAmount,
                Vendor: vendorFilter
              }).filter(([, value]) => !!value).length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[340px] p-0 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-md shadow-lg transition-colors duration-200" 
        align="end"
      >
        <Tabs 
          defaultValue="date" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <TabsList className="grid grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="date"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400 transition-colors duration-200"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Date
              </TabsTrigger>
              <TabsTrigger 
                value="amount"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400 transition-colors duration-200"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Amount
              </TabsTrigger>
              <TabsTrigger 
                value="vendor"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400 transition-colors duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Vendor
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <TabsContent value="date" className="mt-0">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={setThisMonth}
                    className="text-xs border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    This Month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={setLastMonth}
                    className="text-xs border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    Last Month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={setLast30Days}
                    className="text-xs border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    Last 30 Days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={setLast90Days}
                    className="text-xs border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  >
                    Last 90 Days
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                  <div className="space-y-1">
                    <Label htmlFor="date-range" className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">Date Range</Label>
                    <div className="flex flex-col text-sm mt-2">
                      <div className="grid gap-2">
                        <div>
                          {dateRange.from && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                              From: <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{format(dateRange.from, 'PP')}</span>
                            </div>
                          )}
                          {dateRange.to && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                              To: <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{format(dateRange.to, 'PP')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      className="border-0 p-0 bg-transparent"
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_range_middle: "bg-primary/20 dark:bg-primary/30 transition-colors duration-200",
                        day_range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day: "text-gray-900 dark:text-gray-100 transition-colors duration-200",
                        day_outside: "text-gray-400 dark:text-gray-600 opacity-50 transition-colors duration-200",
                        day_disabled: "text-gray-400 dark:text-gray-600 opacity-50 transition-colors duration-200",
                        caption: "text-gray-700 dark:text-gray-300 transition-colors duration-200",
                        nav_button: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-colors duration-200",
                        table: "border-collapse space-y-1",
                        head_cell: "text-gray-500 dark:text-gray-400 font-medium text-xs transition-colors duration-200",
                        cell: "p-0",
                        root: "bg-transparent"
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="amount" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-amount" className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">
                  Minimum Amount ($)
                </Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-amount" className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">
                  Maximum Amount ($)
                </Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder="No limit"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="vendor" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-filter" className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">
                  Vendor Names
                </Label>
                <Input
                  id="vendor-filter"
                  placeholder="Enter vendor names separated by commas"
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Example: Supplier Co., Vendor Inc.
                </p>
              </div>
            </TabsContent>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                Clear
              </Button>
            )}
            <div className={hasActiveFilters ? 'ml-auto' : 'mx-auto'}>
              <Button 
                onClick={handleApplyFilters}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
} 