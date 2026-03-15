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
} from 'lucide-react';

import { StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useOrder, useUpdateOrder, useDeleteOrder, useTechnicians } from '@/hooks';
import type { OrderStatus } from '@/types/database';

import type {
  Clock} from 'lucide-react';

const statusOptions: { value: OrderStatus; label: string; icon: typeof Clock }[] = [
  { value: 'new', label: 'New', icon: AlertCircle },
  { value: 'assigned', label: 'Assigned', icon: User },
  { value: 'in_progress', label: 'In Progress', icon: Wrench },
  { value: 'job_done', label: 'Job Done', icon: CheckCircle },
  { value: 'reviewed', label: 'Reviewed', icon: FileText },
  { value: 'closed', label: 'Closed', icon: CheckCircle },
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface OrderDetailContentProps {
  id: string;
}

export function OrderDetailContent({ id }: OrderDetailContentProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: order, isLoading, error } = useOrder(id);
  const { data: technicians } = useTechnicians();
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
      await deleteOrder.mutateAsync(order.id);
      router.push('/orders');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
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

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/orders'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>{order.order_no}</h1>
            <p className='text-muted-foreground'>
              Created {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Link href={`/orders/${order.id}/edit`}>
            <Button variant='outline'>
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
          </Link>
          <Button
            variant='destructive'
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      {/* Status & Actions */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Order Info */}
        <div className='bg-card rounded-xl border p-6 space-y-6'>
          <div>
            <h2 className='font-semibold mb-4'>Customer Information</h2>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <User className='w-5 h-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>{order.customer_name}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Phone className='w-5 h-5 text-muted-foreground' />
                <a href={`tel:${order.phone}`} className='text-primary hover:underline'>
                  {order.phone}
                </a>
              </div>
              <div className='flex items-start gap-3'>
                <MapPin className='w-5 h-5 text-muted-foreground mt-0.5' />
                <p>{order.address}</p>
              </div>
            </div>
          </div>

          <div className='border-t pt-6'>
            <h2 className='font-semibold mb-4'>Service Details</h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Service Type</span>
                <span className='font-medium capitalize'>
                  {order.service_type?.replace('_', ' ')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Quoted Price</span>
                <span className='font-semibold text-primary'>
                  {formatCurrency(order.quoted_price)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Status</span>
                <StatusBadge
                  status={order.status}
                />
              </div>
            </div>
          </div>

          <div className='border-t pt-6'>
            <h2 className='font-semibold mb-4'>Problem Description</h2>
            <p className='text-sm text-muted-foreground'>
              {order.problem_description}
            </p>
          </div>

          {order.admin_notes && (
            <div className='border-t pt-6'>
              <h2 className='font-semibold mb-4'>Admin Notes</h2>
              <p className='text-sm text-muted-foreground'>
                {order.admin_notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='space-y-6'>
          {/* Update Status */}
          <div className='bg-card rounded-xl border p-6'>
            <h2 className='font-semibold mb-4'>Update Status</h2>
            <div className='grid grid-cols-2 gap-2'>
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isActive = order.status === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isUpdating || isActive}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign Technician */}
          <div className='bg-card rounded-xl border p-6'>
            <h2 className='font-semibold mb-4'>Assign Technician</h2>
            <select
              value={order.assigned_technician_id || ''}
              onChange={(e) => handleTechnicianChange(e.target.value)}
              disabled={isUpdating}
              className='w-full h-10 rounded-md border bg-background px-3 text-sm'
            >
              <option value=''>Unassigned</option>
              {technicians?.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            {order.technician && (
              <div className='mt-4 p-3 bg-muted rounded-lg'>
                <p className='text-sm font-medium'>{order.technician.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {order.technician.email}
                </p>
              </div>
            )}
          </div>

          {/* Service Record */}
          {order.service_record && (
            <div className='bg-card rounded-xl border p-6'>
              <h2 className='font-semibold mb-4'>Service Record</h2>
              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Work Done</p>
                  <p>{order.service_record.work_done}</p>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Final Amount</span>
                  <span className='font-semibold'>
                    {formatCurrency(order.service_record.final_amount)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Completed</span>
                  <span>{formatDate(order.service_record.completed_at)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-card rounded-xl border p-6 max-w-md mx-4'>
            <h2 className='text-lg font-semibold mb-2'>Delete Order?</h2>
            <p className='text-muted-foreground mb-4'>
              This action cannot be undone. The order "{order.order_no}" will be permanently deleted.
            </p>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
