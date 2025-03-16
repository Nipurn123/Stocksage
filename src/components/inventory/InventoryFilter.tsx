import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Checkbox, 
  Label,
  Select
} from '@/components/ui';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

interface InventoryFilterProps {
  filters: {
    search: string;
    category: string;
    lowStock: boolean;
    outOfStock: boolean;
    sortBy: string;
    sortDirection: string;
  };
  onFilterChange: (filters: any) => void;
}

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Office Supplies',
  'Furniture',
  'Kitchen',
  'Clothing',
  'Uncategorized'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'sku', label: 'SKU' },
  { value: 'price', label: 'Price' },
  { value: 'currentStock', label: 'Stock' },
  { value: 'category', label: 'Category' },
  { value: 'createdAt', label: 'Created Date' }
];

export default function InventoryFilter({ filters, onFilterChange }: InventoryFilterProps) {
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
    // Count active filters
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.lowStock) count++;
    if (filters.outOfStock) count++;
    if (filters.sortBy !== 'name' || filters.sortDirection !== 'asc') count++;
    setActiveFilters(count);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, search: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange(localFilters);
    }
  };

  const handleCategoryChange = (value: string) => {
    setLocalFilters({ 
      ...localFilters, 
      category: value === 'All Categories' ? '' : value 
    });
  };

  const handleLowStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, lowStock: e.target.checked });
  };

  const handleOutOfStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, outOfStock: e.target.checked });
  };

  const handleSortByChange = (value: string) => {
    setLocalFilters({ ...localFilters, sortBy: value });
  };

  const handleSortDirectionToggle = () => {
    setLocalFilters({ 
      ...localFilters, 
      sortDirection: localFilters.sortDirection === 'asc' ? 'desc' : 'asc' 
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setShowFilterPanel(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      category: '',
      lowStock: false,
      outOfStock: false,
      sortBy: 'name',
      sortDirection: 'asc'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    setShowFilterPanel(false);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto relative">
          <Input
            placeholder="Search products..."
            value={localFilters.search}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="pl-10 w-full sm:w-80"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          {localFilters.search && (
            <button
              onClick={() => {
                setLocalFilters({ ...localFilters, search: '' });
                onFilterChange({ ...localFilters, search: '' });
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant={showFilterPanel ? 'secondary' : 'outline'}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Select 
              value={localFilters.sortBy} 
              onChange={(e) => handleSortByChange(e.target.value)}
              className="w-[140px]"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSortDirectionToggle}
              className="px-2"
            >
              <ArrowUpDown className={`h-4 w-4 ${localFilters.sortDirection === 'desc' ? 'transform rotate-180' : ''}`} />
              <span className="sr-only">
                {localFilters.sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {showFilterPanel && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="category-select" className="mb-2 block">Category</Label>
              <Select 
                id="category-select"
                value={localFilters.category || 'All Categories'} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="stock-status" className="mb-2 block">Stock Status</Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="low-stock" 
                    checked={localFilters.lowStock} 
                    onCheckedChange={(checked) => setLocalFilters({ ...localFilters, lowStock: checked as boolean })} 
                  />
                  <Label htmlFor="low-stock" className="ml-2 font-normal">
                    Show Low Stock Items
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="out-of-stock" 
                    checked={localFilters.outOfStock} 
                    onCheckedChange={(checked) => setLocalFilters({ ...localFilters, outOfStock: checked as boolean })} 
                  />
                  <Label htmlFor="out-of-stock" className="ml-2 font-normal">
                    Show Out of Stock Items
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button variant="primary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 