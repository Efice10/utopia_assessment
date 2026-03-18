'use client';

import { useState } from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  Users,
  ClipboardList,
  Wrench,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Trophy,
  Building2,
} from 'lucide-react';

import { JobsChart } from '@/components/dashboard/jobs-chart';
import { KPIFilters } from '@/components/dashboard/kpi-filters';
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import {
  PageHeader,
  PageTransition,
  StatCard,
  StatCardGrid,
  SimpleGlassCard,
  StatusBadge } from '@/components/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrders, useTechnicians, useLeaderboard, useJobsChartData, useRevenueChartData, useSelectedBranch } from '@/hooks';
import { useAuthStore } from '@/lib/auth-store';
import type { KPIFilters as KPIFiltersType } from '@/types/kpi';

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
  });
}

function getStatusBadgeVariant(status: string): 'warning' | 'info' | 'success' | 'destructive' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'destructive'> = {
    new: 'warning',
    assigned: 'warning',
    in_progress: 'info',
    job_done: 'success',
    reviewed: 'success',
    closed: 'success',
  };
  return map[status] || 'warning';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { selectedBranchId, selectedBranch, isHQ } = useSelectedBranch();
  const [kpiFilters, setKpiFilters] = useState<KPIFiltersType>({
    period: 'all_time',
  });

  // Build filters with branch
  const orderFilters = selectedBranchId ? { branchId: selectedBranchId } : undefined;
  const kpiFiltersWithBranch: KPIFiltersType = {
    ...kpiFilters,
    branchId: selectedBranchId ?? undefined,
  };

  const { data: orders, isLoading: ordersLoading } = useOrders(orderFilters);
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians(selectedBranchId ?? undefined);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(kpiFiltersWithBranch);
  const { data: jobsChartData, isLoading: jobsChartLoading } = useJobsChartData(kpiFiltersWithBranch);
  const { data: revenueChartData, isLoading: revenueChartLoading } = useRevenueChartData(kpiFiltersWithBranch);

  const isLoading = ordersLoading || techniciansLoading;

  // Calculate stats from real data
  const stats = {
    totalOrders: orders?.length ?? 0,
    pending: orders?.filter((o) => ['new', 'assigned'].includes(o.status)).length ?? 0,
    inProgress: orders?.filter((o) => o.status === 'in_progress').length ?? 0,
    completed: orders?.filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status)).length ?? 0,
    totalRevenue: orders
      ?.filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status))
      .reduce((sum, o) => sum + (o.quoted_price || 0), 0) ?? 0,
    totalTechnicians: technicians?.length ?? 0,
    activeTechnicians: technicians?.filter((t) => t.is_active).length ?? 0,
  };

  // Get recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) ?? [];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className='space-y-8 p-6'>
        {/* Page Header */}
        <PageHeader
          title={`Welcome${user?.name ? `, ${user.name}` : ''}!`}
          description={
            selectedBranch
              ? `Overview for ${selectedBranch.name}${isHQ ? ' (HQ - All Branches)' : ''}`
              : "Here's an overview of your operations."
          }
        >
          <div className='flex items-center gap-2'>
            {selectedBranch && (
              <Badge variant='outline' className='gap-1'>
                <Building2 className='h-3 w-3' />
                {selectedBranch.name}
                {isHQ && <span className='text-primary'>(HQ)</span>}
              </Badge>
            )}
            <Link href='/orders/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New Order
              </Button>
            </Link>
          </div>
        </PageHeader>

        {/* Stats Cards */}
        <StatCardGrid columns={4}>
          <StatCard
            label='Total Orders'
            value={stats.totalOrders}
            icon={ClipboardList}
            variant='info'
          />
          <StatCard
            label='Pending'
            value={stats.pending}
            icon={Clock}
            variant='warning'
          />
          <StatCard
            label='In Progress'
            value={stats.inProgress}
            icon={Wrench}
            variant='info'
          />
          <StatCard
            label='Completed'
            value={stats.completed}
            icon={CheckCircle2}
            variant='success'
          />
        </StatCardGrid>

        {/* Revenue & Technicians */}
        <StatCardGrid columns={2}>
          <StatCard
            label='Total Revenue'
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            variant='success'
          />
          <StatCard
            label='Active Technicians'
            value={`${stats.activeTechnicians} / ${stats.totalTechnicians}`}
            icon={Users}
            variant='info'
          />
        </StatCardGrid>

        {/* Quick Actions */}
        <div>
          <h2 className='text-lg font-semibold mb-4'>Quick Actions</h2>
          <div className='grid gap-6 md:grid-cols-3'>
            <Link href='/orders'>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className='rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg cursor-pointer transition-shadow'
              >
                <div className='inline-flex rounded-xl p-3 mb-4 bg-blue-500/10'>
                  <ClipboardList className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Orders</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Manage all service orders
                </p>
                <span className='text-sm text-primary font-medium inline-flex items-center'>
                  View Orders <ArrowRight className='ml-1 h-4 w-4' />
                </span>
              </motion.div>
            </Link>

            <Link href='/technicians'>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className='rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg cursor-pointer transition-shadow'
              >
                <div className='inline-flex rounded-xl p-3 mb-4 bg-emerald-500/10'>
                  <Users className='h-6 w-6 text-emerald-600' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Technicians</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  View technician teams
                </p>
                <span className='text-sm text-primary font-medium inline-flex items-center'>
                  View Team <ArrowRight className='ml-1 h-4 w-4' />
                </span>
              </motion.div>
            </Link>

            <Link href='/orders/new'>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className='rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg cursor-pointer transition-shadow'
              >
                <div className='inline-flex rounded-xl p-3 mb-4 bg-violet-500/10'>
                  <Plus className='h-6 w-6 text-violet-600' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Create Order</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Add a new service order
                </p>
                <span className='text-sm text-primary font-medium inline-flex items-center'>
                  Create New <ArrowRight className='ml-1 h-4 w-4' />
                </span>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* KPI Dashboard Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-semibold'>Performance Analytics</h2>
            </div>
            <KPIFilters filters={kpiFilters} onFiltersChange={setKpiFilters} />
          </div>

          <Tabs defaultValue='charts' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='charts'>Charts</TabsTrigger>
              <TabsTrigger value='leaderboard'>Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value='charts' className='space-y-4'>
              <div className='grid gap-4 lg:grid-cols-2'>
                <JobsChart data={jobsChartData || []} isLoading={jobsChartLoading} />
                <RevenueChart data={revenueChartData || []} isLoading={revenueChartLoading} />
              </div>
            </TabsContent>

            <TabsContent value='leaderboard'>
              <SimpleGlassCard className='p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <Trophy className='h-5 w-5 text-yellow-500' />
                  <h3 className='font-semibold'>Technician Leaderboard</h3>
                </div>
                <LeaderboardTable data={leaderboard || []} isLoading={leaderboardLoading} />
              </SimpleGlassCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Orders */}
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <SimpleGlassCard className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold'>Recent Orders</h3>
                <Link href='/orders' className='text-sm text-primary hover:underline'>
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className='text-center py-8'>
                  <ClipboardList className='w-12 h-12 mx-auto text-muted-foreground mb-2' />
                  <p className='text-muted-foreground'>No orders yet</p>
                  <Link href='/orders/new'>
                    <Button variant='outline' size='sm' className='mt-4'>
                      Create First Order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='space-y-3'>
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className='flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                          <span className='text-xs font-medium text-primary'>
                            {order.order_no?.slice(-4)}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-sm'>{order.customer_name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {order.service_type?.replace('_', ' ')} • {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium text-sm'>{formatCurrency(order.quoted_price)}</p>
                        <StatusBadge status={getStatusBadgeVariant(order.status)} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SimpleGlassCard>
          </div>

          {/* Status Overview */}
          <div>
            <SimpleGlassCard className='p-6'>
              <h3 className='font-semibold mb-4'>Status Overview</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-amber-500' />
                    <span className='text-sm'>Pending</span>
                  </div>
                  <span className='font-semibold'>{stats.pending}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-blue-500' />
                    <span className='text-sm'>In Progress</span>
                  </div>
                  <span className='font-semibold'>{stats.inProgress}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-emerald-500' />
                    <span className='text-sm'>Completed</span>
                  </div>
                  <span className='font-semibold'>{stats.completed}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='mt-6'>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-muted-foreground'>Completion Rate</span>
                  <span className='font-medium'>
                    {stats.totalOrders > 0
                      ? Math.round((stats.completed / stats.totalOrders) * 100)
                      : 0}%
                  </span>
                </div>
                <div className='h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-emerald-500 rounded-full transition-all'
                    style={{
                      width: `${stats.totalOrders > 0
                        ? (stats.completed / stats.totalOrders) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            </SimpleGlassCard>

            {/* Technicians Preview */}
            <SimpleGlassCard className='p-6 mt-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold'>Technicians</h3>
                <Link href='/technicians' className='text-sm text-primary hover:underline'>
                  View all
                </Link>
              </div>
              {technicians && technicians.length > 0 ? (
                <div className='flex -space-x-2'>
                  {technicians.slice(0, 4).map((tech) => (
                    <Avatar key={tech.id} className='h-10 w-10 border-2 border-background'>
                      <AvatarFallback className='text-xs'>
                        {tech.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {technicians.length > 4 && (
                    <div className='h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium'>
                      +{technicians.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No technicians found</p>
              )}
              <p className='text-sm text-muted-foreground mt-3'>
                {stats.activeTechnicians} active technicians
              </p>
            </SimpleGlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
