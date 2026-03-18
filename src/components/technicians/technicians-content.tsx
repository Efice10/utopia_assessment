'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Search, Plus, Phone, Mail, Briefcase, Star, Loader2, Eye, Pencil } from 'lucide-react';

import { StatusBadge, StatCard, StatCardGrid } from '@/components/shared';
import { ModernTable } from '@/components/shared/modern-table';
import type { ColumnDef, RowAction } from '@/components/shared/modern-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTechnicians, useTechnicianStats, useSelectedBranch } from '@/hooks';
import { useAuthStore } from '@/lib/auth-store';
import type { User } from '@/types/database';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

export function TechniciansContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const { selectedBranchId } = useSelectedBranch();

  // For technicians, always use their own branch; for others, use selected branch
  const userBranchId = (user as { branch_id?: string }).branch_id;
  const effectiveBranchId = user?.role === 'technician' ? userBranchId : selectedBranchId;

  const { data: technicians, isLoading: isLoadingTechnicians, error: techniciansError } = useTechnicians(effectiveBranchId ?? undefined);
  const { data: stats, isLoading: isLoadingStats } = useTechnicianStats();

  const isLoading = isLoadingTechnicians || isLoadingStats;

  // Calculate aggregate stats
  const aggregateStats = stats?.reduce(
    (acc, tech) => ({
      totalJobs: acc.totalJobs + tech.totalJobs,
      completedJobs: acc.completedJobs + tech.completedJobs,
      pendingJobs: acc.pendingJobs + tech.pendingJobs,
      totalRevenue: acc.totalRevenue + tech.totalRevenue,
    }),
    { totalJobs: 0, completedJobs: 0, pendingJobs: 0, totalRevenue: 0 }
  );

  const completionRate = aggregateStats && aggregateStats.totalJobs > 0
    ? Math.round((aggregateStats.completedJobs / aggregateStats.totalJobs) * 100)
    : 0;

  // Filter technicians by search query
  const filteredTechnicians = technicians?.filter((tech) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tech.name?.toLowerCase().includes(query) ||
      tech.email?.toLowerCase().includes(query) ||
      tech.phone?.includes(query)
    );
  });

  // Get stats for a specific technician
  const getTechnicianStats = (techId: string) => {
    return stats?.find((s) => s.id === techId);
  };

  const rowActions: RowAction<User>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (row) => {
        window.location.href = `/technicians/${row.id}`;
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        window.location.href = `/technicians/${row.id}/edit`;
      },
    },
  ];

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      header: 'Technician',
      cell: ({ row }: { row: User }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-semibold text-primary">
              {row.name?.charAt(0).toUpperCase() || 'T'}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {row.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {row.email}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: ({ row }: { row: User }) => (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {row.phone || '—'}
        </span>
      ),
    },
    {
      id: 'stats',
      header: 'Performance',
      cell: ({ row }: { row: User }) => {
        const techStats = getTechnicianStats(row.id);
        if (!techStats) {
          return <span className="text-muted-foreground">No data</span>;
        }
        return (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{techStats.totalJobs} jobs</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>{Math.round(techStats.completionRate)}%</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'revenue',
      header: 'Revenue',
      cell: ({ row }: { row: User }) => {
        const techStats = getTechnicianStats(row.id);
        return (
          <span className="font-medium">
            {techStats ? formatCurrency(techStats.totalRevenue) : '—'}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: User }) => (
        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
      ),
    },
  ];

  // Only admins can add technicians
  const canAddTechnician = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technicians</h1>
          <p className="text-muted-foreground">
            Manage technicians and view their performance.
          </p>
        </div>
        {canAddTechnician && (
          <Link href="/technicians/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Technician
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <StatCardGrid columns={4}>
        <StatCard
          label="Total Technicians"
          value={technicians?.length || 0}
          icon={Briefcase}
          variant="info"
          animate
        />
        <StatCard
          label="Total Jobs"
          value={aggregateStats?.totalJobs || 0}
          icon={Briefcase}
          variant="default"
          animate
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={Star}
          variant={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(aggregateStats?.totalRevenue || 0)}
          icon={Briefcase}
          variant="success"
        />
      </StatCardGrid>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search technicians..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Technicians Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading technicians...</span>
        </div>
      ) : techniciansError ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Error loading technicians: {techniciansError.message}</p>
        </div>
      ) : (
        <ModernTable
          data={filteredTechnicians || []}
          columns={columns}
          keyExtractor={(row: User) => row.id}
          rowActions={rowActions}
          searchable={false}
          emptyTitle="No technicians found"
          emptyDescription="Add your first technician to get started."
        />
      )}
    </div>
  );
}
