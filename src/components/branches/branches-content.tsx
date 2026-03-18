'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Plus, Search, Loader2, Eye, Pencil, Building2 } from 'lucide-react';

import { StatusBadge } from '@/components/shared';
import { ModernTable } from '@/components/shared/modern-table';
import type { RowAction } from '@/components/shared/modern-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranches } from '@/hooks';
import type { Branch } from '@/types/database';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function BranchesContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: branches, isLoading, error } = useBranches();

  // Filter branches by search query
  const filteredBranches = branches?.filter((branch) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      branch.name?.toLowerCase().includes(query) ||
      branch.address?.toLowerCase().includes(query) ||
      branch.phone?.includes(query)
    );
  });

  const rowActions: RowAction<Branch>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (row) => {
        window.location.href = `/branches/${row.id}`;
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        window.location.href = `/branches/${row.id}/edit`;
      },
    },
  ];

  const columns = [
    {
      id: 'name',
      header: 'Branch Name',
      cell: ({ row }: { row: Branch }) => (
        <Link
          href={`/branches/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {row.name}
          </div>
        </Link>
      ),
    },
    {
      id: 'address',
      header: 'Address',
      cell: ({ row }: { row: Branch }) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {row.address}
        </span>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: ({ row }: { row: Branch }) => (
        <span>{row.phone ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: Branch }) => (
        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }: { row: Branch }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage branch locations and their information.
          </p>
        </div>
        <Button asChild>
          <Link href="/branches/new">
            <Plus className="mr-2 h-4 w-4" />
            New Branch
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Branches Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading branches...</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Error loading branches: {error.message}</p>
        </div>
      ) : (
        <ModernTable
          data={filteredBranches ?? []}
          columns={columns}
          keyExtractor={(row: Branch) => row.id}
          rowActions={rowActions}
          searchable={false}
          emptyTitle="No branches found"
          emptyDescription="Create your first branch to get started."
        />
      )}
    </div>
  );
}
