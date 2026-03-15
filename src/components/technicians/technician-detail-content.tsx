'use client';

import Link from 'next/link';

import {
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  Star,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Eye,
} from 'lucide-react';

import { StatusBadge, StatCard, StatCardGrid } from '@/components/shared';
import { ModernTable } from '@/components/shared/modern-table';
import type { RowAction } from '@/components/shared/modern-table';
import { Button } from '@/components/ui/button';
import { useUser, useOrders, useTechnicianStats } from '@/hooks';
import type { OrderWithRelations } from '@/types/database';

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

interface TechnicianDetailContentProps {
  id: string;
}

export function TechnicianDetailContent({ id }: TechnicianDetailContentProps) {
  const { data: technician, isLoading: isLoadingTechnician, error: technicianError } = useUser(id);
  const { data: orders, isLoading: isLoadingOrders } = useOrders({ technicianId: id });
  const { data: allStats, isLoading: isLoadingStats } = useTechnicianStats();

  const isLoading = isLoadingTechnician || isLoadingOrders || isLoadingStats;
  const technicianStats = allStats?.find((s) => s.id === id);

  const rowActions: RowAction<OrderWithRelations>[] = [
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
      id: 'price',
      header: 'Price',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (technicianError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="font-medium text-destructive">Error loading technician</p>
        <p className="text-sm text-muted-foreground">{technicianError.message}</p>
        <Link href="/technicians">
          <Button variant="outline" className="mt-4">
            Back to Technicians
          </Button>
        </Link>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium">Technician not found</p>
        <Link href="/technicians">
          <Button variant="outline" className="mt-4">
            Back to Technicians
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
          <Link href="/technicians">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-semibold text-primary">
                {technician.name?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{technician.name}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={technician.is_active ? 'active' : 'inactive'}
                />
              </div>
            </div>
          </div>
        </div>
        <Link href={`/technicians/${technician.id}/edit`}>
          <Button variant="outline">
            Edit Technician
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatCardGrid columns={4}>
        <StatCard
          label="Total Jobs"
          value={technicianStats?.totalJobs || 0}
          icon={Briefcase}
          variant="info"
        />
        <StatCard
          label="Completed Jobs"
          value={technicianStats?.completedJobs || 0}
          icon={Star}
          variant="success"
        />
        <StatCard
          label="Completion Rate"
          value={`${Math.round(technicianStats?.completionRate || 0)}%`}
          icon={Star}
          variant={(technicianStats?.completionRate || 0) >= 80 ? 'success' : (technicianStats?.completionRate || 0) >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(technicianStats?.totalRevenue || 0)}
          icon={DollarSign}
          variant="success"
        />
      </StatCardGrid>

      {/* Technician Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <h2 className="font-semibold">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${technician.email}`} className="text-primary hover:underline">
                  {technician.email || '—'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${technician.phone}`} className="text-primary hover:underline">
                  {technician.phone || '—'}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p>{formatDate(technician.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <div className="bg-card rounded-xl border p-6 space-y-6">
          <h2 className="font-semibold">Job Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Jobs</span>
              <span className="font-medium text-amber-600">{technicianStats?.pendingJobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In Progress</span>
              <span className="font-medium text-blue-600">
                {orders?.filter((o) => o.status === 'in_progress').length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Completed This Month</span>
              <span className="font-medium text-emerald-600">{technicianStats?.completedJobs || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Orders */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Assigned Orders</h2>
        <ModernTable
          data={orders || []}
          columns={orderColumns}
          keyExtractor={(row: OrderWithRelations) => row.id}
          rowActions={rowActions}
          searchable={false}
          emptyTitle="No orders assigned"
          emptyDescription="This technician has no orders assigned yet."
        />
      </div>
    </div>
  );
}
