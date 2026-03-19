'use client';

import { useState } from 'react';

import { Calendar, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TimePeriodPreset, KPIFilters as KPIFiltersType } from '@/types/kpi';

interface KPIFiltersProps {
  filters: KPIFiltersType;
  onFiltersChange: (filters: KPIFiltersType) => void;
}

const periodLabels: Record<TimePeriodPreset, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  all_time: 'All Time',
  custom: 'Custom',
};

export function KPIFilters({ filters, onFiltersChange }: KPIFiltersProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handlePeriodChange = (period: TimePeriodPreset) => {
    if (period === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onFiltersChange({ ...filters, period });
    }
  };

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {/* Period Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='gap-2'>
            <Calendar className='w-4 h-4' />
            {periodLabels[filters.period]}
            <ChevronDown className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          {Object.entries(periodLabels).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handlePeriodChange(key as TimePeriodPreset)}
              className={filters.period === key ? 'bg-accent' : ''}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Range */}
      {showCustom && (
        <div className='flex items-center gap-2'>
          <input
            type='date'
            value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateFrom: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className='h-9 rounded-md border bg-background px-3 text-sm'
          />
          <span className='text-muted-foreground'>to</span>
          <input
            type='date'
            value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateTo: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className='h-9 rounded-md border bg-background px-3 text-sm'
          />
        </div>
      )}
    </div>
  );
}
