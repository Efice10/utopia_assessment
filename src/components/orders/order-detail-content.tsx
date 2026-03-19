'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Wrench,
  FileText,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MessageSquare,
  Settings,
  ClipboardList,
  UserCheck,
} from 'lucide-react';

import { NotificationHistory } from '@/components/orders/notification-history';
import { StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useOrder, useUpdateOrder, useDeleteOrder, useTechnicians } from '@/hooks';
import type { OrderStatus } from '@/types/database';

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
}

const STATUS_FLOW: OrderStatus[] = ['new', 'assigned', 'in_progress', 'job_done', 'reviewed', 'closed'];

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  assigned: { label: 'Assigned', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  in_progress: { label: 'In Progress', color: 'text-violet-600', bgColor: 'bg-violet-500/10' },
  job_done: { label: 'Job Done', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  reviewed: { label: 'Reviewed', color: 'text-teal-600', bgColor: 'bg-teal-500/10' },
  closed: { label: 'Closed', color: 'text-slate-600', bgColor: 'bg-slate-500/10' },
};

interface OrderDetailContentProps {
  id: string;
}

export function OrderDetailContent({ id }: OrderDetailContentProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: order, isLoading, error } = useOrder(id);
  const { data: technicians } = useTechnicians(order?.branch_id ?? undefined);
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTechnicianChange = async (technicianId: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        updates: {
          assigned_technician_id: technicianId || null,
          status: technicianId ? 'assigned' : 'new',
        },
      });
    } catch (error) {
      console.error('Failed to assign technician:', error);
      alert('Failed to assign technician');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      await deleteOrder.mutateAsync({ id: order.id, orderNo: order.order_no });
      router.push('/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <AlertCircle className='w-12 h-12 mx-auto text-destructive mb-4' />
        <p className='font-medium text-destructive'>Error loading order</p>
        <p className='text-sm text-muted-foreground'>{error.message}</p>
        <Link href='/orders'>
          <Button variant='outline' className='mt-4'>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='text-center py-12'>
        <FileText className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
        <p className='font-medium'>Order not found</p>
        <Link href='/orders'>
          <Button variant='outline' className='mt-4'>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className='flex flex-col gap-4'>
      {/* Header Bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/orders'>
            <Button variant='ghost' size='icon' className='rounded-xl'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
          </Link>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
              <ClipboardList className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>{order.order_no}</h1>
              <p className='text-sm text-muted-foreground'>
                {formatRelativeTime(order.created_at)}
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Link href={`/orders/${order.id}/edit`}>
            <Button variant='outline' className='rounded-xl'>
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
          </Link>
          <Button
            variant='destructive'
            onClick={() => setShowDeleteConfirm(true)}
            className='rounded-xl'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min'>

        {/* Status Progress - Full Width */}
        <div className='md:col-span-2 lg:col-span-4 rounded-2xl border bg-card p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-semibold flex items-center gap-2'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              Order Status
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <div className='flex items-center justify-between'>
            {STATUS_FLOW.map((status, index) => {
              const config = statusConfig[status];
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status} className='flex items-center flex-1 last:flex-none'>
                  <button
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating}
                    className='flex flex-col items-center group'
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? `${config.bgColor} ${config.color}`
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''} ${
                        !isUpdating ? 'group-hover:scale-110' : ''
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className='w-5 h-5' />
                      ) : (
                        <div className='w-2 h-2 rounded-full bg-current' />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium ${
                        isCurrent ? config.color : 'text-muted-foreground'
                      }`}
                    >
                      {config.label}
                    </span>
                  </button>
                  {index < STATUS_FLOW.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStatusIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Info - Large Card */}
        <div className='md:col-span-2 rounded-2xl border bg-gradient-to-br from-blue-500/5 to-violet-500/5 p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <User className='w-4 h-4 text-muted-foreground' />
            Customer
          </h2>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center'>
                <span className='text-xl font-bold text-primary'>
                  {order.customer_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className='text-lg font-semibold'>{order.customer_name}</p>
                <p className='text-sm text-muted-foreground'>Customer</p>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3'>
              <a
                href={`tel:${order.phone}`}
                className='flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background transition-colors'
              >
                <div className='h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <Phone className='w-4 h-4 text-emerald-600' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Phone</p>
                  <p className='font-medium text-emerald-600'>{order.phone}</p>
                </div>
              </a>
              <div className='flex items-start gap-3 p-3 rounded-xl bg-background/50'>
                <div className='h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0'>
                  <MapPin className='w-4 h-4 text-blue-600' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Address</p>
                  <p className='font-medium'>{order.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Type & Price */}
        <div className='rounded-2xl border bg-card p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <Wrench className='w-4 h-4 text-muted-foreground' />
            Service
          </h2>
          <div className='space-y-4'>
            <div className='p-4 rounded-xl bg-muted/50'>
              <p className='text-xs text-muted-foreground mb-1'>Type</p>
              <p className='font-semibold capitalize'>
                {order.service_type?.replace('_', ' ')}
              </p>
            </div>
            <div className='p-4 rounded-xl bg-emerald-500/10'>
              <p className='text-xs text-emerald-600 mb-1'>Quoted Price</p>
              <p className='text-2xl font-bold text-emerald-600'>
                {formatCurrency(order.quoted_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='rounded-2xl border bg-card p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <Settings className='w-4 h-4 text-muted-foreground' />
            Quick Actions
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            <a
              href={`tel:${order.phone}`}
              className='flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors'
            >
              <Phone className='w-5 h-5' />
              <span className='text-xs font-medium'>Call</span>
            </a>
            <a
              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors'
            >
              <MessageSquare className='w-5 h-5' />
              <span className='text-xs font-medium'>WhatsApp</span>
            </a>
            <Link
              href={`/orders/${order.id}/edit`}
              className='flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors'
            >
              <Edit className='w-5 h-5' />
              <span className='text-xs font-medium'>Edit</span>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='flex flex-col items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors'
            >
              <Trash2 className='w-5 h-5' />
              <span className='text-xs font-medium'>Delete</span>
            </button>
          </div>
        </div>

        {/* Assign Technician */}
        <div className='md:col-span-2 rounded-2xl border bg-card p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <UserCheck className='w-4 h-4 text-muted-foreground' />
            Assigned Technician
          </h2>
          <div className='space-y-4'>
            <select
              value={order.assigned_technician_id || ''}
              onChange={(e) => handleTechnicianChange(e.target.value)}
              disabled={isUpdating}
              className='w-full h-12 rounded-xl border bg-background px-4 text-sm font-medium'
            >
              <option value=''>Select a technician...</option>
              {technicians?.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            {order.technician && (
              <div className='flex items-center gap-4 p-4 rounded-xl bg-muted/50'>
                <div className='h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center'>
                  <span className='text-lg font-bold text-violet-600'>
                    {order.technician.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className='font-semibold'>{order.technician.name}</p>
                  <p className='text-sm text-muted-foreground'>{order.technician.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Problem Description - Wide Card */}
        <div className='md:col-span-2 rounded-2xl border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <FileText className='w-4 h-4 text-muted-foreground' />
            Problem Description
          </h2>
          <div className='p-4 rounded-xl bg-background/50'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap'>
              {order.problem_description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Admin Notes */}
        {order.admin_notes && (
          <div className='md:col-span-2 rounded-2xl border bg-gradient-to-br from-slate-500/5 to-gray-500/5 p-5'>
            <h2 className='font-semibold mb-4 flex items-center gap-2'>
              <FileText className='w-4 h-4 text-muted-foreground' />
              Admin Notes
            </h2>
            <div className='p-4 rounded-xl bg-background/50'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                {order.admin_notes}
              </p>
            </div>
          </div>
        )}

        {/* Service Record */}
        {order.service_record && (
          <div className='md:col-span-2 rounded-2xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5'>
            <h2 className='font-semibold mb-4 flex items-center gap-2'>
              <CheckCircle className='w-4 h-4 text-emerald-600' />
              Service Record
            </h2>
            <div className='space-y-4'>
              <div className='p-4 rounded-xl bg-background/50'>
                <p className='text-xs text-muted-foreground mb-1'>Work Done</p>
                <p className='text-sm'>{order.service_record.work_done}</p>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='p-4 rounded-xl bg-emerald-500/10'>
                  <p className='text-xs text-emerald-600 mb-1'>Final Amount</p>
                  <p className='text-xl font-bold text-emerald-600'>
                    {formatCurrency(order.service_record.final_amount)}
                  </p>
                </div>
                <div className='p-4 rounded-xl bg-muted/50'>
                  <p className='text-xs text-muted-foreground mb-1'>Completed</p>
                  <p className='font-medium'>
                    {formatDate(order.service_record.completed_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className='md:col-span-2 rounded-2xl border bg-card p-5'>
          <h2 className='font-semibold mb-4 flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-muted-foreground' />
            Timeline
          </h2>
          <div className='grid grid-cols-2 gap-3'>
            <div className='p-3 rounded-xl bg-muted/50'>
              <p className='text-xs text-muted-foreground'>Created</p>
              <p className='text-sm font-medium'>{formatDate(order.created_at)}</p>
            </div>
            <div className='p-3 rounded-xl bg-muted/50'>
              <p className='text-xs text-muted-foreground'>Last Updated</p>
              <p className='text-sm font-medium'>{formatDate(order.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Notification History - Full Width */}
        <div className='md:col-span-2 lg:col-span-4 rounded-2xl border bg-card p-5'>
          <NotificationHistory
            orderId={order.id}
            customerPhone={order.phone}
            technicianId={order.assigned_technician_id || undefined}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-card rounded-2xl border p-6 max-w-md w-full'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center'>
                <Trash2 className='w-5 h-5 text-red-600' />
              </div>
              <h2 className='text-lg font-semibold'>Delete Order?</h2>
            </div>
            <p className='text-muted-foreground mb-6'>
              This action cannot be undone. The order &quot;{order.order_no}&quot; will be permanently deleted.
            </p>
            <div className='flex gap-3 justify-end'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
                className='rounded-xl'
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                className='rounded-xl'
              >
                Delete Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
