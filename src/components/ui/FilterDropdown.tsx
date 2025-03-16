import React from 'react';
import { Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface FilterDropdownProps {
  filters: {
    category: string[];
    stockStatus: string[];
    priceRange: {
      min: number | null;
      max: number | null;
    };
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      category: string[];
      stockStatus: string[];
      priceRange: {
        min: number | null;
        max: number | null;
      };
      dateRange: {
        from: Date | null;
        to: Date | null;
      };
    }>
  >;
  onClose: () => void;
  categories: string[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filters,
  setFilters,
  onClose,
  categories,
}) => {
  // Toggle category filter
  const toggleCategory = (category: string) => {
    setFilters((prev) => {
      if (prev.category.includes(category)) {
        return {
          ...prev,
          category: prev.category.filter((c) => c !== category),
        };
      } else {
        return {
          ...prev,
          category: [...prev.category, category],
        };
      }
    });
  };

  // Toggle stock status filter
  const toggleStockStatus = (status: string) => {
    setFilters((prev) => {
      if (prev.stockStatus.includes(status)) {
        return {
          ...prev,
          stockStatus: prev.stockStatus.filter((s) => s !== status),
        };
      } else {
        return {
          ...prev,
          stockStatus: [...prev.stockStatus, status],
        };
      }
    });
  };

  // Update price range
  const updatePriceRange = (
    type: 'min' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue,
      },
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: [],
      stockStatus: [],
      priceRange: { min: null, max: null },
      dateRange: { from: null, to: null },
    });
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium">Filter Products</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X size={14} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-medium mb-2">Categories</h4>
          <div className="space-y-1">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                  onClick={() => toggleCategory(category)}
                >
                  <div className={`h-4 w-4 rounded border ${
                    filters.category.includes(category)
                      ? 'bg-blue-600 border-blue-600 flex items-center justify-center'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {filters.category.includes(category) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm">{category}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No categories available</p>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <h4 className="text-sm font-medium mb-2">Stock Status</h4>
          <div className="space-y-1">
            {['in-stock', 'low-stock', 'out-of-stock'].map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                onClick={() => toggleStockStatus(status)}
              >
                <div className={`h-4 w-4 rounded border ${
                  filters.stockStatus.includes(status)
                    ? 'bg-blue-600 border-blue-600 flex items-center justify-center'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {filters.stockStatus.includes(status) && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm">
                  {status === 'in-stock'
                    ? 'In Stock'
                    : status === 'low-stock'
                    ? 'Low Stock'
                    : 'Out of Stock'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium mb-2">Price Range</h4>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min !== null ? filters.priceRange.min : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePriceRange('min', e.target.value)}
              className="h-9"
            />
            <span className="text-gray-400">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max !== null ? filters.priceRange.max : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePriceRange('max', e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h4 className="text-sm font-medium mb-2">Date Added</h4>
          <div className="p-1 border rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left font-normal w-full h-9"
                >
                  <span>
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {filters.dateRange.from.toLocaleDateString()} -{' '}
                          {filters.dateRange.to.toLocaleDateString()}
                        </>
                      ) : (
                        filters.dateRange.from.toLocaleDateString()
                      )
                    ) : (
                      'Select date range'
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange.from ? {
                    from: filters.dateRange.from,
                    to: filters.dateRange.to || undefined,
                  } : undefined}
                  onSelect={(range) => {
                    if (range) {
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          from: 'from' in range ? range.from : null,
                          to: 'to' in range && range.to ? range.to : null,
                        },
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: { from: null, to: null },
                      }));
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Applied Filters */}
        {(filters.category.length > 0 ||
          filters.stockStatus.length > 0 ||
          filters.priceRange.min !== null ||
          filters.priceRange.max !== null ||
          filters.dateRange.from !== null) && (
          <div>
            <h4 className="text-sm font-medium mb-2">Applied Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category.map((category) => (
                <Badge
                  key={`category-${category}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {category}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                  />
                </Badge>
              ))}

              {filters.stockStatus.map((status) => (
                <Badge
                  key={`status-${status}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {status === 'in-stock'
                    ? 'In Stock'
                    : status === 'low-stock'
                    ? 'Low Stock'
                    : 'Out of Stock'}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleStockStatus(status);
                    }}
                  />
                </Badge>
              ))}

              {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filters.priceRange.min !== null && `$${filters.priceRange.min}`}
                  {filters.priceRange.min !== null && filters.priceRange.max !== null ? ' - ' : ''}
                  {filters.priceRange.max !== null && `$${filters.priceRange.max}`}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { min: null, max: null },
                      }));
                    }}
                  />
                </Badge>
              )}

              {filters.dateRange.from && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filters.dateRange.from.toLocaleDateString()}
                  {filters.dateRange.to && ` - ${filters.dateRange.to.toLocaleDateString()}`}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: { from: null, to: null },
                      }));
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown; 