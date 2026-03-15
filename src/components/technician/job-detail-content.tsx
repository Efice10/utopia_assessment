'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Wrench,
  CheckCircle,
  Loader2,
  DollarSign,
  MessageSquare,
  Upload,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOrder, useUpdateOrder } from '@/hooks';
import { useCreateServiceRecord } from '@/hooks/use-service-records';

const schema = z.object({
  work_done: z.string().min(1, 'Work done is required'),
  extra_charges: z.number().min(0, 'Extra charges must be 0 or greater').optional(),
  remarks: z.string().optional(),
  payment_amount: z.number().min(0, 'Payment amount must be 0 or greater').optional(),
  payment_method: z.enum(['cash', 'online_transfer', 'card']).optional(),
});

type FormData = z.infer<typeof schema>;

export function JobDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: order, isLoading: orderLoading, error: orderError } = useOrder(id);
  const updateOrder = useUpdateOrder();
  const createServiceRecord = useCreateServiceRecord();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      work_done: '',
      extra_charges: 0,
      remarks: '',
      payment_amount: 0,
      payment_method: undefined,
    },
  });

  const extraCharges = form.watch('extra_charges') || 0;
  const finalAmount = (order?.quoted_price || 0) + extraCharges;

  if (orderLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (orderError) {
    return (
      <div className='text-center py-12 text-destructive'>
        Error loading job: {orderError.message}
      </div>
    );
  }

  if (!order) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        Order not found
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 6) {
      alert('Maximum 6 files allowed');
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Create service record
      await createServiceRecord.mutateAsync({
        order_id: order.id,
        technician_id: order.assigned_technician_id || 'tech-001',
        work_done: data.work_done,
        extra_charges: data.extra_charges || 0,
        files: files.map((f) => f.name),
        remarks: data.remarks || '',
        final_amount: finalAmount,
        payment_amount: data.payment_amount,
        payment_method: data.payment_method,
        completed_at: new Date().toISOString(),
      });

      // Update order status to job_done
      await updateOrder.mutateAsync({
        id: order.id,
        updates: { status: 'job_done' },
      });

      alert('Job completed successfully!');
      router.push('/jobs');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to complete job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const generateWhatsAppUrl = () => {
    if (!order) return '';

    const message = `Hi ${order.customer_name},

Job ${order.order_no} has been completed.
Please check and leave feedback.

Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  const mapOrderStatus = (status: string): 'warning' | 'info' | 'success' => {
    if (['new', 'assigned'].includes(status)) return 'warning';
    if (status === 'in_progress') return 'info';
    return 'success';
  };

  return (
    <div className='min-h-screen flex flex-col bg-muted/30'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b px-4 py-4'>
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='p-2 rounded-full hover:bg-muted'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='flex-1'>
            <h1 className='text-lg font-semibold'>Job Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 p-4 pb-32 space-y-4'>
        {/* Order Card */}
        <div className='bg-card rounded-xl border p-4'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <p className='font-semibold'>{order.order_no}</p>
              <p className='text-sm text-muted-foreground'>
                {formatDate(order.created_at)}
              </p>
            </div>
            <StatusBadge status={mapOrderStatus(order.status)} />
          </div>

          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>{order.customer_name}</span>
            </div>
            <div className='flex items-start gap-2 text-muted-foreground'>
              <MapPin className='w-4 h-4 mt-0.5 shrink-0' />
              <span>{order.address}</span>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Phone className='w-4 h-4 shrink-0' />
              <span>{order.phone}</span>
            </div>
          </div>

          <div className='flex items-center justify-between pt-4 border-t'>
            <div>
              <p className='text-xs text-muted-foreground'>Service Type</p>
              <p className='font-medium capitalize'>
                {order.service_type?.replace('_', ' ')}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-muted-foreground'>Quoted Price</p>
              <p className='font-semibold text-primary'>
                {formatCurrency(order.quoted_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className='bg-card rounded-xl border p-4'>
          <h3 className='font-medium mb-2'>Problem Description</h3>
          <p className='text-sm text-muted-foreground'>
            {order.problem_description}
          </p>
          {order.admin_notes && (
            <div className='mt-3 pt-3 border-t'>
              <p className='text-xs text-muted-foreground mb-1'>Admin Notes</p>
              <p className='text-sm'>{order.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Completion Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <div className='bg-card rounded-xl border p-4 space-y-4'>
            <h3 className='font-medium flex items-center gap-2'>
              <Wrench className='w-4 h-4 text-muted-foreground' />
              Complete Job
            </h3>

            <div>
              <Label htmlFor='work_done'>Work Done *</Label>
              <Textarea
                id='work_done'
                {...form.register('work_done')}
                rows={4}
                placeholder='Describe what work was done...'
              />
              {form.formState.errors.work_done && (
                <p className='text-sm text-destructive mt-1'>
                  {form.formState.errors.work_done.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='extra_charges'>Extra Charges (RM)</Label>
                <Input
                  id='extra_charges'
                  type='number'
                  step='0.01'
                  min='0'
                  {...form.register('extra_charges', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor='final_amount'>Final Amount (RM)</Label>
                <Input
                  id='final_amount'
                  value={finalAmount.toFixed(2)}
                  disabled
                  className='bg-muted font-semibold'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='remarks'>Remarks</Label>
              <Textarea
                id='remarks'
                {...form.register('remarks')}
                rows={2}
                placeholder='Any additional notes...'
              />
            </div>
          </div>

          {/* File Upload */}
          <div className='bg-card rounded-xl border p-4'>
            <div className='flex items-center justify-between mb-3'>
              <Label>Photos/Documents</Label>
              <span className='text-xs text-muted-foreground'>
                {files.length}/6 files
              </span>
            </div>

            <div className='border-2 border-dashed rounded-lg p-4'>
              <input
                type='file'
                multiple
                accept='image/*,video/*,.pdf'
                onChange={handleFileChange}
                className='hidden'
                id='file-upload'
              />
              <label
                htmlFor='file-upload'
                className='flex flex-col items-center justify-center cursor-pointer py-6'
              >
                <Upload className='w-8 h-8 text-muted-foreground mb-2' />
                <span className='text-sm font-medium'>Upload Photos/Videos</span>
                <span className='text-xs text-muted-foreground'>
                  PNG, JPG, PDF, MP4 up to 10MB each
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className='grid grid-cols-3 gap-2 mt-3'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className='relative aspect-square rounded-lg overflow-hidden bg-muted'
                  >
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='flex items-center justify-center w-full h-full bg-muted'>
                        <span className='text-xs text-muted-foreground truncate px-2'>
                          {file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type='button'
                      onClick={() => removeFile(index)}
                      className='absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className='bg-card rounded-xl border p-4 space-y-4'>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-4 h-4 text-muted-foreground' />
              <span className='font-medium text-sm'>Payment (Optional)</span>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='payment_amount'>Payment Received (RM)</Label>
                <Input
                  id='payment_amount'
                  type='number'
                  step='0.01'
                  min='0'
                  {...form.register('payment_amount', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor='payment_method'>Payment Method</Label>
                <select
                  id='payment_method'
                  {...form.register('payment_method')}
                  className='w-full h-9 rounded-md border bg-background px-3 text-sm'
                >
                  <option value=''>Select...</option>
                  <option value='cash'>Cash</option>
                  <option value='online_transfer'>Online Transfer</option>
                  <option value='card'>Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='sticky bottom-4 bg-background border-t pt-4 space-y-3'>
            <Button
              type='submit'
              className='w-full h-12'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className='w-5 h-5 mr-2' />
                  Complete Job
                </>
              )}
            </Button>

            {order.status === 'job_done' && (
              <Button
                type='button'
                variant='outline'
                className='w-full h-12'
                onClick={() => {
                  const url = generateWhatsAppUrl();
                  window.open(url, '_blank');
                }}
              >
                <MessageSquare className='w-5 h-5 mr-2' />
                Send WhatsApp to Customer
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
