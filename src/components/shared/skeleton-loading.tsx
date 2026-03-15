'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Base skeleton with shimmer animation
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/50',
        'before:absolute before:inset-0',
        'before:-translate-x-full before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}

// Skeleton for stat cards
function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl p-6 dark:bg-gray-900/80 dark:border-gray-700/50',
        className
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-16' />
        </div>
        <Skeleton className='h-12 w-12 rounded-xl' />
      </div>
    </div>
  );
}

// Skeleton for table rows
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className='border-b border-gray-100 dark:border-gray-800'>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className='px-4 py-4'>
          <Skeleton className='h-4 w-full max-w-[120px]' />
        </td>
      ))}
    </tr>
  );
}

// Full table skeleton
function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className='rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl overflow-hidden dark:bg-gray-900/80 dark:border-gray-700/50'>
      {/* Header */}
      <div className='border-b border-gray-100 dark:border-gray-800 bg-muted/30 px-4 py-3'>
        <div className='flex gap-4'>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className='h-4 w-24' />
          ))}
        </div>
      </div>
      {/* Rows */}
      <table className='w-full'>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card content skeleton
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl p-6 dark:bg-gray-900/80 dark:border-gray-700/50',
        className
      )}
    >
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>
    </div>
  );
}

// Profile/Avatar skeleton
function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

// Text line skeleton
function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className='h-4'
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

// Dashboard stats skeleton
function DashboardStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Page skeleton with header and content
function PageSkeleton() {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {/* Page header */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-64' />
      </div>

      {/* Stats */}
      <DashboardStatsSkeleton />

      {/* Content */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}

// List item skeleton
function ListItemSkeleton() {
  return (
    <div className='flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800'>
      <AvatarSkeleton size='md' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-3 w-48' />
      </div>
      <Skeleton className='h-6 w-16 rounded-full' />
    </div>
  );
}

// Form skeleton
function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className='space-y-6'>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full rounded-lg' />
        </div>
      ))}
      <Skeleton className='h-10 w-32 rounded-lg' />
    </div>
  );
}

export {
  Skeleton,
  StatCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  DashboardStatsSkeleton,
  PageSkeleton,
  ListItemSkeleton,
  FormSkeleton,
};
