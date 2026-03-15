'use client';

import * as React from 'react';

import { Search, X, SlidersHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  children?: React.ReactNode;
  className?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  children,
  className,
}: FilterBarProps) {
  // Count active filters (non-empty, non-"all" values)
  const activeFilterCount = Object.entries(filterValues).filter(
    ([, value]) => value && value !== 'all' && value !== ''
  ).length;

  const hasActiveFilters = activeFilterCount > 0 || searchValue.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Search Input */}
        {onSearchChange && (
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-9 pr-9'
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        )}

        {/* Filters and Actions */}
        <div className='flex flex-wrap items-center gap-2'>
          {/* Filter Selects */}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || 'all'}
              onValueChange={(value) => onFilterChange?.(filter.key, value)}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Clear Filters Button */}
          {hasActiveFilters && onClearFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onClearFilters}
              className='h-9 px-3 text-muted-foreground hover:text-foreground'
            >
              <X className='mr-1 h-4 w-4' />
              Clear
              {activeFilterCount > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1.5 h-5 w-5 rounded-full p-0 text-xs'
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Additional Actions (passed as children) */}
          {children}
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <SlidersHorizontal className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm text-muted-foreground'>Active filters:</span>
          {Object.entries(filterValues).map(([key, value]) => {
            if (!value || value === 'all' || value === '') return null;
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);
            return (
              <Badge
                key={key}
                variant='secondary'
                className='gap-1 pr-1'
              >
                <span className='text-muted-foreground'>{filter?.label}:</span>
                {option?.label || value}
                <button
                  onClick={() => onFilterChange?.(key, 'all')}
                  className='ml-1 rounded-full p-0.5 hover:bg-muted'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE SEARCH BAR (for pages that only need search)
// ============================================================================

interface SimpleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SimpleSearchBarProps) {
  return (
    <div className={cn('relative max-w-sm', className)}>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='pl-9 pr-9'
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
