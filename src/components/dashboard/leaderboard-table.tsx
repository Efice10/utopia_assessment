'use client';

import { Trophy, Medal } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@/types/kpi';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600'>
        <Trophy className='w-5 h-5' />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500'>
        <Medal className='w-5 h-5' />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600'>
        <Medal className='w-5 h-5' />
      </div>
    );
  }
  return null;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading?: boolean;
}

export function LeaderboardTable({ data, isLoading }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-16 bg-muted/50 rounded-lg animate-pulse' />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>No data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {data.map((entry) => (
        <div
          key={entry.technicianId}
          className='flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'
        >
          <div className='flex items-center gap-2'>
            {entry.rank <= 3 ? (
              getRankBadge(entry.rank)
            ) : (
              <span className='text-sm font-medium text-muted-foreground'>
                #{entry.rank}
              </span>
            )}
            <Avatar className='h-10 w-10'>
              <AvatarFallback>{getInitials(entry.technicianName)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <p className='font-medium'>{entry.technicianName}</p>
              <p className='text-sm text-muted-foreground'>
                {entry.jobsCompleted} jobs completed
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p className='font-semibold'>{formatCurrency(entry.totalRevenue)}</p>
            <p className='text-xs text-muted-foreground'>
              {entry.completionRate.toFixed(1)}% completion
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
