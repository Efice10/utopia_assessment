'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Wrench,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react';

import { StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import type { OrderWithRelations } from '@/types/database';

type JobStatus = 'pending' | 'in_progress' | 'completed';

const statusTabs: { value: JobStatus; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in_progress', label: 'In Progress', icon: AlertCircle },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
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

function mapOrderStatus(status: string): JobStatus {
  if (status === 'new' || status === 'assigned') return 'pending';
  if (status === 'in_progress') return 'in_progress';
  if (status === 'job_done' || status === 'reviewed' || status === 'closed') return 'completed';
  return 'pending';
}

export function JobsContent() {
  const [activeTab, setActiveTab] = useState<JobStatus>('pending');
  const { user } = useAuthStore();

  // Only fetch orders assigned to this technician
  const { data: orders, isLoading, error } = useOrders(
    user?.id ? { technicianId: user.id } : undefined,
    !!user?.id
  );

  // Filter orders by status tab
  const filteredJobs = orders?.filter((order) => {
    const jobStatus = mapOrderStatus(order.status);
    return jobStatus === activeTab;
  });

  const jobCounts = {
    pending: orders?.filter((o) => ['new', 'assigned'].includes(o.status)).length || 0,
    in_progress: orders?.filter((o) => o.status === 'in_progress').length || 0,
    completed: orders?.filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status)).length || 0,
  };

  return (
    <div className='flex flex-col min-h-screen bg-muted/30'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b'>
        <div className='px-4 py-4'>
          <h1 className='text-xl font-bold'>My Jobs</h1>
          <p className='text-sm text-muted-foreground'>
            View and complete your assigned jobs
          </p>
        </div>

        {/* Status Tabs */}
        <div className='flex border-t'>
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            const count = jobCounts[tab.value];

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className='w-4 h-4' />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job List */}
      <div className='flex-1 p-4 space-y-3'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : error ? (
          <div className='text-center py-12 text-destructive'>
            Error loading jobs: {error.message}
          </div>
        ) : filteredJobs?.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
              <Wrench className='w-8 h-8 text-muted-foreground' />
            </div>
            <p className='font-medium'>No {activeTab.replace('_', ' ')} jobs</p>
            <p className='text-sm text-muted-foreground mt-1'>
              {activeTab === 'pending'
                ? 'New jobs will appear here when assigned'
                : activeTab === 'in_progress'
                ? 'Jobs you start will appear here'
                : 'Completed jobs will appear here'}
            </p>
          </div>
        ) : (
          filteredJobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: OrderWithRelations }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  const handleStartJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/jobs/${job.id}/complete`);
  };

  const jobStatus = mapOrderStatus(job.status);

  return (
    <div
      onClick={handleClick}
      className='bg-card rounded-xl border p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]'
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div>
          <p className='font-semibold text-sm'>{job.order_no}</p>
          <p className='text-xs text-muted-foreground'>
            {formatDate(job.created_at)}
          </p>
        </div>
        <StatusBadge status={jobStatus} />
      </div>

      {/* Customer Info */}
      <div className='space-y-2 mb-3'>
        <div className='flex items-center gap-2 text-sm'>
          <span className='font-medium'>{job.customer_name}</span>
        </div>
        <div className='flex items-start gap-2 text-sm text-muted-foreground'>
          <MapPin className='w-4 h-4 mt-0.5 shrink-0' />
          <span className='line-clamp-2'>{job.address}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Phone className='w-4 h-4 shrink-0' />
          <span>{job.phone}</span>
        </div>
      </div>

      {/* Service Type & Price */}
      <div className='flex items-center justify-between pt-3 border-t'>
        <div>
          <p className='text-xs text-muted-foreground'>Service Type</p>
          <p className='text-sm font-medium capitalize'>
            {job.service_type?.replace('_', ' ')}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-xs text-muted-foreground'>Quoted Price</p>
          <p className='text-sm font-semibold text-primary'>
            {formatCurrency(job.quoted_price)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {jobStatus === 'pending' && (
        <div className='mt-3 pt-3 border-t'>
          <Button
            size='sm'
            className='w-full'
            onClick={handleStartJob}
          >
            <Wrench className='w-4 h-4 mr-2' />
            Start Job
          </Button>
        </div>
      )}

      {jobStatus === 'in_progress' && (
        <div className='mt-3 pt-3 border-t'>
          <Button
            size='sm'
            variant='default'
            className='w-full'
            onClick={handleStartJob}
          >
            Complete Job
            <ChevronRight className='w-4 h-4 ml-2' />
          </Button>
        </div>
      )}
    </div>
  );
}
