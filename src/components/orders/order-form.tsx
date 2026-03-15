'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';



import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateOrder, useTechnicians } from '@/hooks';
import type { ServiceType } from '@/types/database';

// Service types from PRD
const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: 'installation', label: 'Installation' },
  { value: 'servicing', label: 'Servicing' },
  { value: 'repair', label: 'Repair' },
  { value: 'gas_refill', label: 'Gas Refill' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'others', label: 'Others' },
];

// Zod schema for form validation
const orderSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  problem_description: z.string().min(10, 'Please describe the problem'),
  service_type: z.enum([
    'installation',
    'servicing',
    'repair',
    'gas_refill',
    'inspection',
    'others',
  ]),
  quoted_price: z.number().min(0, 'Price must be 0 or greater'),
  assigned_technician_id: z.string().optional(),
  admin_notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderFormData | null>(
    null
  );
  const [technicianName, setTechnicianName] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      address: '',
      problem_description: '',
      service_type: 'installation',
      quoted_price: 0,
      assigned_technician_id: '',
      admin_notes: '',
    },
  });

  const { data: technicians, isLoading: loadingTechnicians } = useTechnicians();
  const createOrder = useCreateOrder();

  const selectedTechnicianId = watch('assigned_technician_id');
  const selectedServiceType = watch('service_type');

  const onSubmit = async (data: OrderFormData) => {
    try {
      // Find technician name for summary
      const tech = technicians?.find((t) => t.id === data.assigned_technician_id);
      setTechnicianName(tech?.name || 'Unassigned');
      setSubmittedOrder(data);

      // Create order in database
      await createOrder.mutateAsync({
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address,
        problem_description: data.problem_description,
        service_type: data.service_type,
        quoted_price: data.quoted_price,
        assigned_technician_id: data.assigned_technician_id || null,
        admin_notes: data.admin_notes || null,
        created_by: 'admin', // In real app, this would be the logged-in user ID
      });

      // Show summary dialog
      setShowSummary(true);

      onSuccess?.();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleCreateAnother = () => {
    setShowSummary(false);
    setSubmittedOrder(null);
    reset();
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Service Order
          </CardTitle>
          <CardDescription>
            Create a new service order and assign a technician
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Customer Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    placeholder="Enter customer name"
                    {...register('customer_name')}
                    className={errors.customer_name ? 'border-destructive' : ''}
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-destructive">
                      {errors.customer_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="012-3456789"
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  Service Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Full service address"
                  rows={2}
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Service Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service_type">
                    Service Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedServiceType}
                    onValueChange={(value) =>
                      setValue('service_type', value as ServiceType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.service_type && (
                    <p className="text-sm text-destructive">
                      {errors.service_type.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoted_price">
                    Quoted Price (RM) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quoted_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('quoted_price', { valueAsNumber: true })}
                    className={errors.quoted_price ? 'border-destructive' : ''}
                  />
                  {errors.quoted_price && (
                    <p className="text-sm text-destructive">
                      {errors.quoted_price.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem_description">
                  Problem Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="problem_description"
                  placeholder="Describe the issue or service required..."
                  rows={3}
                  {...register('problem_description')}
                  className={
                    errors.problem_description ? 'border-destructive' : ''
                  }
                />
                {errors.problem_description && (
                  <p className="text-sm text-destructive">
                    {errors.problem_description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Assignment
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assigned_technician_id">Assign Technician</Label>
                  <Select
                    value={selectedTechnicianId || ''}
                    onValueChange={(value) =>
                      setValue('assigned_technician_id', value)
                    }
                    disabled={loadingTechnicians}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians?.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loadingTechnicians && (
                    <p className="text-sm text-muted-foreground">
                      Loading technicians...
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    placeholder="Any additional notes for the technician..."
                    rows={2}
                    {...register('admin_notes')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Order Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Created Successfully!</DialogTitle>
            <DialogDescription>
              The service order has been created and saved to the system.
            </DialogDescription>
          </DialogHeader>
          {submittedOrder && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-3 font-medium">Order Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Customer:</dt>
                    <dd className="font-medium">
                      {submittedOrder.customer_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd>{submittedOrder.phone}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Service Type:</dt>
                    <dd className="capitalize">
                      {submittedOrder.service_type.replace('_', ' ')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quoted Price:</dt>
                    <dd className="font-medium">
                      {formatCurrency(submittedOrder.quoted_price)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Assigned To:</dt>
                    <dd className="font-medium">{technicianName}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleCreateAnother}
                >
                  Create Another
                </Button>
                <Button onClick={handleViewOrders}>View All Orders</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
