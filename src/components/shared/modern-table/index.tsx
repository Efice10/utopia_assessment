'use client';

import * as React from 'react';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  List,
  LayoutList,
  ChevronDown,
  ChevronUp,
  X,
  Columns3,
  SlidersHorizontal,
  MoreHorizontal,
  Check,
  ArrowUpDown,
  Palette,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { EmptyState } from '../empty-state';
import { Skeleton } from '../skeleton-loading';

import type { LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type TableViewMode = 'table' | 'card' | 'compact';
export type TableDensity = 'comfortable' | 'dense';
export type RowHighlight = 'warning' | 'danger' | 'success' | 'info' | 'new' | null;

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: { row: T; value: unknown }) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  sticky?: 'left' | 'right';
}

export interface RowAction<T> {
  id: string;
  label?: string;
  icon?: LucideIcon;
  onClick?: (row: T) => void;
  variant?: 'default' | 'destructive' | 'success' | 'danger';
  hidden?: (row: T) => boolean;
  divider?: boolean;
}

export interface QuickAction<T> {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (row: T) => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

export interface ModernTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;

  // Row options
  getRowHighlight?: (row: T) => RowHighlight;
  enableRowHighlight?: boolean; // Default false - set to true to show row colors
  rowActions?: RowAction<T>[];
  quickActions?: QuickAction<T>[];
  onRowClick?: (row: T) => void;

  // Sorting
  sortState?: SortState;
  onSort?: (state: SortState) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;

  // Bulk actions
  bulkActions?: RowAction<T[]>[];

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (query: string) => void;

  // Loading & Empty states
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;

  // Card view renderer
  cardRenderer?: (row: T) => React.ReactNode;

  // Styling
  className?: string;
}

// ============================================================================
// ROW HIGHLIGHT STYLES
// ============================================================================

const rowHighlightStyles: Record<NonNullable<RowHighlight>, string> = {
  warning: 'bg-amber-500/5 border-l-4 border-l-amber-500',
  danger: 'bg-red-500/5 border-l-4 border-l-red-500',
  success: 'bg-emerald-500/5 border-l-4 border-l-emerald-500',
  info: 'bg-blue-500/5 border-l-4 border-l-blue-500',
  new: 'bg-teal-500/5 border-l-4 border-l-teal-500',
};

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

function QuickActionButton<T>({
  action,
  row,
}: {
  action: QuickAction<T>;
  row: T;
}) {
  const variantStyles = {
    default: 'hover:bg-muted',
    primary: 'hover:bg-primary/10 hover:text-primary',
    success: 'hover:bg-emerald-500/10 hover:text-emerald-600',
    warning: 'hover:bg-amber-500/10 hover:text-amber-600',
    danger: 'hover:bg-red-500/10 hover:text-red-600',
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      className={cn('h-7 px-2 gap-1', variantStyles[action.variant || 'default'])}
      onClick={e => {
        e.stopPropagation();
        action.onClick(row);
      }}
    >
      <action.icon className='h-3.5 w-3.5' />
      <span className='text-xs'>{action.label}</span>
    </Button>
  );
}

// ============================================================================
// TABLE ROW
// ============================================================================

function TableRow<T>({
  row,
  columns,
  density,
  highlight,
  rowActions,
  quickActions,
  onRowClick,
  selectable,
  isSelected,
  onSelect,
  visibleColumns,
}: {
  row: T;
  columns: ColumnDef<T>[];
  density: TableDensity;
  highlight: RowHighlight;
  rowActions?: RowAction<T>[];
  quickActions?: QuickAction<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  visibleColumns: string[];
  keyExtractor?: (row: T) => string;
}) {
  const paddingClass = density === 'comfortable' ? 'py-4 px-4' : 'py-2 px-3';

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => onRowClick?.(row)}
      className={cn(
        'group relative border-b border-gray-100 dark:border-gray-800 transition-all duration-200',
        'hover:bg-muted/50',
        onRowClick && 'cursor-pointer',
        isSelected && 'bg-primary/5',
        highlight && rowHighlightStyles[highlight]
      )}
    >
      {/* Selection checkbox */}
      {selectable && (
        <td className={cn(paddingClass, 'w-12')}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={e => e.stopPropagation()}
          />
        </td>
      )}

      {/* Data cells */}
      {columns
        .filter(col => visibleColumns.includes(col.id))
        .map(column => {
          const value = column.accessorKey
            ? row[column.accessorKey]
            : column.accessorFn?.(row);
          const content = column.cell
            ? column.cell({ row, value })
            : String(value ?? '');

          return (
            <td
              key={column.id}
              className={cn(
                paddingClass,
                'text-sm',
                column.sticky === 'left' && 'sticky left-0 bg-card z-10',
                column.sticky === 'right' && 'sticky right-0 bg-card z-10'
              )}
              style={{ width: column.width }}
            >
              {content}
            </td>
          );
        })}

      {/* Actions cell - Always visible (static) */}
      {(rowActions || quickActions) && (
        <td className={cn(paddingClass, 'w-auto text-center')}>
          <div className='flex items-center justify-center gap-1'>
            {/* Quick actions - always visible */}
            {quickActions?.map(action => (
              <QuickActionButton key={action.id} action={action} row={row} />
            ))}

            {/* More actions dropdown - always visible */}
            {rowActions && rowActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0 opacity-60 hover:opacity-100'
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {rowActions
                    .filter(action => action.divider || !action.hidden?.(row))
                    .map(action => (
                      action.divider ? (
                        <DropdownMenuSeparator key={action.id} />
                      ) : (
                        <DropdownMenuItem
                          key={action.id}
                          onClick={e => {
                            e.stopPropagation();
                            action.onClick?.(row);
                          }}
                          className={cn(
                            action.variant === 'destructive' && 'text-destructive',
                            action.variant === 'danger' && 'text-destructive'
                          )}
                        >
                          {action.icon && <action.icon className='mr-2 h-4 w-4' />}
                          {action.label}
                        </DropdownMenuItem>
                      )
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
}

// ============================================================================
// CARD VIEW
// ============================================================================

function CardView<T>({
  data,
  keyExtractor,
  cardRenderer,
  getRowHighlight,
  onRowClick,
  selectable,
  selectedRows,
  onSelect,
}: {
  data: T[];
  keyExtractor: (row: T) => string;
  cardRenderer?: (row: T) => React.ReactNode;
  getRowHighlight?: (row: T) => RowHighlight;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows: string[];
  onSelect: (id: string, selected: boolean) => void;
}) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      <AnimatePresence>
        {data.map(row => {
          const id = keyExtractor(row);
          const highlight = getRowHighlight?.(row);
          const isSelected = selectedRows.includes(id);

          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'relative rounded-xl border bg-card p-4 shadow-sm transition-all',
                'hover:shadow-md hover:border-primary/20',
                onRowClick && 'cursor-pointer',
                isSelected && 'ring-2 ring-primary',
                highlight && rowHighlightStyles[highlight]
              )}
            >
              {selectable && (
                <div className='absolute top-3 right-3'>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={checked => onSelect(id, !!checked)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
              {cardRenderer ? cardRenderer(row) : (
                <div className='text-sm text-muted-foreground'>
                  No card renderer provided
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function TableLoadingSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className='space-y-2'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex gap-4 p-4'>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className='h-4 flex-1' />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModernTable<T>({
  data,
  columns,
  keyExtractor,
  getRowHighlight,
  enableRowHighlight = false,
  rowActions,
  quickActions,
  onRowClick,
  sortState,
  onSort,
  selectable,
  selectedRows = [],
  onSelectionChange,
  bulkActions,
  searchable,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearch,
  loading,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  emptyIcon,
  cardRenderer,
  className,
}: ModernTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<TableViewMode>('table');
  const [density, setDensity] = React.useState<TableDensity>('comfortable');
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(
    columns.map(c => c.id)
  );
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [showRowHighlight, setShowRowHighlight] = React.useState(enableRowHighlight);

  const viewModes = [
    { mode: 'table' as const, icon: List, label: 'Table' },
    { mode: 'card' as const, icon: LayoutGrid, label: 'Cards' },
    { mode: 'compact' as const, icon: LayoutList, label: 'Compact' },
  ];

  // Selection helpers
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map(keyExtractor));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, id]);
    } else {
      onSelectionChange?.(selectedRows.filter(r => r !== id));
    }
  };

  const handleSort = (columnId: string) => {
    if (!onSort) return;

    if (sortState?.column === columnId) {
      onSort({
        column: columnId,
        direction: sortState.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSort({ column: columnId, direction: 'asc' });
    }
  };

  // Density adjustments for compact mode
  const effectiveDensity = viewMode === 'compact' ? 'dense' : density;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {/* Left: Search */}
        <div className='flex flex-1 items-center gap-2'>
          {searchable && (
            <motion.div
              animate={{ width: isSearchFocused ? 280 : 220 }}
              className='relative'
            >
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={e => onSearch?.(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className='pl-9 pr-4 h-9 bg-muted/50 border-0 focus-visible:ring-1'
              />
            </motion.div>
          )}
        </div>

        {/* Right: View controls */}
        <div className='flex items-center gap-2'>
          {/* View mode switcher */}
          <div className='flex items-center rounded-lg border bg-muted/30 p-0.5'>
            {viewModes.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant='ghost'
                size='sm'
                onClick={() => setViewMode(mode)}
                className={cn(
                  'h-7 px-2.5 gap-1.5',
                  viewMode === mode && 'bg-background shadow-sm'
                )}
                title={label}
              >
                <Icon className='h-4 w-4' />
              </Button>
            ))}
          </div>

          {/* Density toggle */}
          {viewMode === 'table' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-9 gap-2'>
                  <SlidersHorizontal className='h-4 w-4' />
                  <span className='hidden sm:inline'>
                    {density === 'comfortable' ? 'Comfort' : 'Dense'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setDensity('comfortable')}>
                  {density === 'comfortable' && <Check className='mr-2 h-4 w-4' />}
                  <span className={cn(density !== 'comfortable' && 'ml-6')}>
                    Comfortable
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDensity('dense')}>
                  {density === 'dense' && <Check className='mr-2 h-4 w-4' />}
                  <span className={cn(density !== 'dense' && 'ml-6')}>Dense</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column visibility */}
          {viewMode === 'table' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-9'>
                  <Columns3 className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                {columns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.includes(col.id)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setVisibleColumns([...visibleColumns, col.id]);
                      } else {
                        setVisibleColumns(visibleColumns.filter(id => id !== col.id));
                      }
                    }}
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Row highlight toggle - only show when getRowHighlight is provided */}
          {getRowHighlight && (
            <Button
              variant={showRowHighlight ? 'default' : 'outline'}
              size='sm'
              className='h-9'
              onClick={() => setShowRowHighlight(!showRowHighlight)}
              title={showRowHighlight ? 'Hide row colors' : 'Show row colors'}
            >
              <Palette className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedRows.length > 0 && bulkActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='overflow-hidden'
          >
            <div className='flex items-center justify-between rounded-lg bg-primary/10 px-4 py-2'>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium'>
                  {selectedRows.length} selected
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onSelectionChange?.([])}
                  className='h-7 px-2 text-xs'
                >
                  <X className='mr-1 h-3 w-3' />
                  Clear
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                {bulkActions.map(action => (
                  <Button
                    key={action.id}
                    variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
                    size='sm'
                    className='h-7 gap-1.5'
                    onClick={() => {
                      const selectedData = data.filter(row =>
                        selectedRows.includes(keyExtractor(row))
                      );
                      (action as RowAction<T[]>).onClick?.(selectedData);
                    }}
                  >
                    {action.icon && <action.icon className='h-3.5 w-3.5' />}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table content */}
      <div className='rounded-xl border border-gray-200 dark:border-gray-800 bg-card/50 backdrop-blur-sm overflow-hidden'>
        {loading ? (
          <TableLoadingSkeleton columns={columns.length} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : viewMode === 'card' ? (
          <div className='p-4'>
            <CardView
              data={data}
              keyExtractor={keyExtractor}
              cardRenderer={cardRenderer}
              getRowHighlight={showRowHighlight ? getRowHighlight : undefined}
              onRowClick={onRowClick}
              selectable={selectable}
              selectedRows={selectedRows}
              onSelect={handleSelectRow}
            />
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 dark:border-gray-800 bg-muted/30'>
                  {selectable && (
                    <th className='py-3 px-4 w-12'>
                      <Checkbox
                        checked={someSelected ? 'indeterminate' : allSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {columns
                    .filter(col => visibleColumns.includes(col.id))
                    .map(column => (
                      <th
                        key={column.id}
                        className={cn(
                          'py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                          column.sortable && 'cursor-pointer select-none hover:text-foreground',
                          column.sticky === 'left' && 'sticky left-0 bg-muted/30 z-10',
                          column.sticky === 'right' && 'sticky right-0 bg-muted/30 z-10'
                        )}
                        style={{ width: column.width }}
                        onClick={() => column.sortable && handleSort(column.id)}
                      >
                        <div className='flex items-center gap-1'>
                          {column.header}
                          {column.sortable && (
                            <span className='ml-1'>
                              {sortState?.column === column.id ? (
                                sortState.direction === 'asc' ? (
                                  <ChevronUp className='h-4 w-4' />
                                ) : (
                                  <ChevronDown className='h-4 w-4' />
                                )
                              ) : (
                                <ArrowUpDown className='h-3 w-3 opacity-40' />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  {(rowActions || quickActions) && (
                    <th className='py-3 px-4 w-auto text-center text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <LayoutGroup>
                <tbody>
                  <AnimatePresence>
                    {data.map(row => {
                      const id = keyExtractor(row);
                      return (
                        <TableRow
                          key={id}
                          row={row}
                          columns={columns}
                          keyExtractor={keyExtractor}
                          density={effectiveDensity}
                          highlight={showRowHighlight ? (getRowHighlight?.(row) ?? null) : null}
                          rowActions={rowActions}
                          quickActions={quickActions}
                          onRowClick={onRowClick}
                          selectable={selectable}
                          isSelected={selectedRows.includes(id)}
                          onSelect={checked => handleSelectRow(id, checked)}
                          visibleColumns={visibleColumns}
                        />
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </LayoutGroup>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
