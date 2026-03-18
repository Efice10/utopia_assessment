'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Plus, Search, Filter, Loader2, Eye, Pencil } from 'lucide-react';

import { StatusBadge } from '@/components/shared';
import { ModernTable } from '@/components/shared/modern-table';
import type { RowAction } from '@/components/shared/modern-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, useSelectedBranch } from '@/hooks';
import { useAuthStore } from '@/lib/auth-store';
import type { OrderWithRelations } from '@/types/database';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'job_done', label: 'Job Done' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'closed', label: 'Closed' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    new: 'warning',
    assigned: 'info',
    in_progress: 'info',
    job_done: 'success',
    reviewed: 'success',
    closed: 'default',
  };
  return statusMap[status] || 'default';
}

export function OrdersContent() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected branch for filtering
  const { selectedBranchId, selectedBranch, isLoading: isBranchLoading } = useSelectedBranch();
  const { user } = useAuthStore();

  // For technicians, always use their assigned branch
  const userBranchId = (user as { branch_id?: string }).branch_id;
  const effectiveBranchId = user?.role === 'technician' ? userBranchId : selectedBranchId;

  // Build filters object - always filter by branch
  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(effectiveBranchId && { branchId: effectiveBranchId }),
  };

  // Don't fetch orders until branch is selected (prevents showing all orders briefly)
  const { data: orders, isLoading, error } = useOrders(
    effectiveBranchId ? filters : undefined,
    !!effectiveBranchId // Only enable query when branch is selected
  );

  // Filter orders by search query
  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(query) ||
      order.order_no?.toLowerCase().includes(query) ||
      order.phone?.includes(query) ||
      order.address?.toLowerCase().includes(query)
    );
  });

  const rowActions: RowAction<OrderWithRelations>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (row) => {
        window.location.href = `/orders/${row.id}`;
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        window.location.href = `/orders/${row.id}/edit`;
      },
    },
  ];

  const columns = [
    {
      id: 'order_no',
      header: 'Order No',
      cell: ({ row }: { row: OrderWithRelations }) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.order_no}
        </Link>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }: { row: OrderWithRelations }) => (
        <div>
          <p className="font-medium">{row.customer_name}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      id: 'service',
      header: 'Service Type',
      cell: ({ row }: { row: OrderWithRelations }) => (
        <span className="capitalize">
          {row.service_type?.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'technician',
      header: 'Technician',
      cell: ({ row }: { row: OrderWithRelations }) => {
        const name = row.technician?.name;
        return name ? <span>{name}</span> : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      id: 'price',
      header: 'Quoted Price',
      cell: ({ row }: { row: OrderWithRelations }) => (
        <span className="font-medium">
          {formatCurrency(row.quoted_price)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: OrderWithRelations }) => (
        <StatusBadge status={mapStatus(row.status)} />
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }: { row: OrderWithRelations }) => (
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
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            {user?.role === 'technician'
              ? 'Manage orders assigned to your branch'
              : selectedBranch
                ? `Manage orders for ${selectedBranch.name}`
                : 'Manage service orders and track their status.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      {isBranchLoading || isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {isBranchLoading ? 'Loading branch...' : 'Loading orders...'}
          </span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Error loading orders: {error.message}</p>
        </div>
      ) : (
        <ModernTable
          data={filteredOrders || []}
          columns={columns}
          keyExtractor={(row: OrderWithRelations) => row.id}
          rowActions={rowActions}
          searchable={false}
          emptyTitle="No orders found"
          emptyDescription="Create your first order to get started."
        />
      )}
    </div>
  );
}
