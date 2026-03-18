'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  Calendar,
  ClipboardList,
  Eye,
} from 'lucide-react';

import { StatusBadge, StatCard, StatCardGrid } from '@/components/shared';
import { ModernTable } from '@/components/shared/modern-table';
import type { RowAction } from '@/components/shared/modern-table';
import { Button } from '@/components/ui/button';
import { useBranch, useBranchOrders } from '@/hooks';
import type { Order } from '@/types/database';

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

interface BranchDetailContentProps {
  id: string;
}

export function BranchDetailContent({ id }: BranchDetailContentProps) {
  const { data: branch, isLoading: isLoadingBranch, error: branchError } = useBranch(id);
  const { data: orders, isLoading: isLoadingOrders } = useBranchOrders(id);

  const isLoading = isLoadingBranch || isLoadingOrders;

  // Calculate stats
  const totalOrders = orders?.length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === 'closed' || o.status === 'reviewed').length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === 'new' || o.status === 'assigned').length ?? 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.quoted_price ?? 0), 0) ?? 0;

  const rowActions: RowAction<Order>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (row) => {
        window.location.href = `/orders/${row.id}`;
      },
    },
  ];

  const orderColumns = [
    {
      id: 'order_no',
      header: 'Order No',
      cell: ({ row }: { row: Order }) => (
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
      cell: ({ row }: { row: Order }) => (
        <div>
          <p className="font-medium">{row.customer_name}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      id: 'service',
      header: 'Service Type',
      cell: ({ row }: { row: Order }) => (
        <span className="capitalize">
          {row.service_type?.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }: { row: Order }) => (
        <span className="font-medium">
          {formatCurrency(row.quoted_price)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: Order }) => (
        <StatusBadge status={mapStatus(row.status)} />
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }: { row: Order }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="font-medium text-destructive">Error loading branch</p>
        <p className="text-sm text-muted-foreground">{branchError.message}</p>
        <Link href="/branches">
          <Button variant="outline" className="mt-4">
            Back to Branches
          </Button>
        </Link>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium">Branch not found</p>
        <Link href="/branches">
          <Button variant="outline" className="mt-4">
            Back to Branches
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/branches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{branch.name}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={branch.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
        </div>
        <Link href={`/branches/${branch.id}/edit`}>
          <Button variant="outline">
            Edit Branch
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatCardGrid columns={4}>
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={ClipboardList}
          variant="info"
        />
        <StatCard
          label="Completed"
          value={completedOrders}
          icon={ClipboardList}
          variant="success"
        />
        <StatCard
          label="Pending"
          value={pendingOrders}
          icon={ClipboardList}
          variant="warning"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={ClipboardList}
          variant="success"
        />
      </StatCardGrid>

      {/* Branch Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <h2 className="font-semibold">Branch Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="whitespace-pre-wrap">{branch.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                {branch.phone ? (
                  <a href={`tel:${branch.phone}`} className="text-primary hover:underline">
                    {branch.phone}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{formatDate(branch.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">New Orders</span>
              <span className="font-medium text-amber-600">
                {orders?.filter((o) => o.status === 'new').length ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In Progress</span>
              <span className="font-medium text-blue-600">
                {orders?.filter((o) => o.status === 'in_progress' || o.status === 'assigned').length ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Completed This Month</span>
              <span className="font-medium text-emerald-600">{completedOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Orders */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Orders at this Branch</h2>
        <ModernTable
          data={orders ?? []}
          columns={orderColumns}
          keyExtractor={(row: Order) => row.id}
          rowActions={rowActions}
          searchable={false}
          emptyTitle="No orders at this branch"
          emptyDescription="There are no orders assigned to this branch yet."
        />
      </div>
    </div>
  );
}
