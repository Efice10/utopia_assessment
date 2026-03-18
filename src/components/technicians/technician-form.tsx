'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  UserPlus,
  Building2,
  MapPin,
  Briefcase,
  Wrench,
  Plus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUser, useAddUserBranch, useBranches } from '@/hooks';
import { useAuthStore } from '@/lib/auth-store';

// Malaysian phone number regex
const phoneRegex = /^(\+?6?01)[0-46-9]\d{8,9}$/;

const technicianSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .regex(phoneRegex, { message: 'Please enter a valid Malaysian phone number' }),
  address: z.string().min(5, 'Address is required'),
  ic_number: z.string().regex(/^[0-9]{6,20}-?[0-9]{4}?$/, {
    message: 'Please enter a valid IC number (12 digits)',
  }),
  specialties: z.string().min(1, 'At least one specialty is required'),
  notes: z.string().optional(),
  branch_id: z.string().min(1, 'Branch is required'),
  is_active: z.boolean(),
});

type TechnicianFormData = z.infer<typeof technicianSchema>;

interface TechnicianFormProps {
  onSuccess?: () => void;
}

export function TechnicianForm({ onSuccess }: TechnicianFormProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(true);
  const createUser = useCreateUser();
  const addUserBranch = useAddUserBranch();
  const { user } = useAuthStore();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  // Determine if user is manager (admin can choose branch)
  const isManager = user?.role === 'manager';

  // For managers, auto-use their branch
  const defaultBranchId = isManager ? user?.branch_id : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      ic_number: '',
      specialties: '',
      notes: '',
      branch_id: defaultBranchId ?? '',
      is_active: true,
    },
  });

  const selectedBranchId = watch('branch_id');

  const onSubmit = async (data: TechnicianFormData) => {
    try {
      // Create the user
      const newUser = await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'technician',
        is_active: data.is_active,
      });

      // Assign branch to the technician
      await addUserBranch.mutateAsync({
        userId: newUser.id,
        branchId: data.branch_id,
        isPrimary: true,
      });

      toast.success('Technician created successfully', {
        description: `${data.name} has been added as a technician.`,
      });

      onSuccess?.();
      router.push('/technicians');
    } catch (error) {
      toast.error('Failed to create technician', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Technician
        </CardTitle>
        <CardDescription>
          Create a new technician account and assign them to a branch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="ic_number">
                  IC Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ic_number"
                  placeholder="e.g., 900123456789"
                  {...register('ic_number')}
                  className={errors.ic_number ? 'border-destructive' : ''}
                />
                {errors.ic_number && (
                  <p className="text-sm text-destructive">
                    {errors.ic_number.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <div className="space-y-2">
              <Label htmlFor="address">
                Home Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                rows={2}
                {...register('address')}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Work Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialties">
                  Specialties <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="specialties"
                  placeholder="e.g., AC, Refrigerator, Washing Machine"
                  {...register('specialties')}
                  className={errors.specialties ? 'border-destructive' : ''}
                />
                {errors.specialties && (
                  <p className="text-sm text-destructive">
                    {errors.specialties.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this technician..."
                  rows={2}
                  {...register('notes')}
                />
              </div>
            </div>
          </div>

          {/* Branch Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Branch Assignment
            </h3>
            {isManager ? (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {branches?.find((b) => b.id === user?.branch_id)?.name ??
                        'Your Branch'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Technicians will be assigned to your branch automatically
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="branch_id">
                  Assign to Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedBranchId}
                  onValueChange={(value) => setValue('branch_id', value)}
                  disabled={branchesLoading}
                >
                  <SelectTrigger
                    className={errors.branch_id ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{branch.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branch_id && (
                  <p className="text-sm text-destructive">
                    {errors.branch_id.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Account Status
            </h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive technicians cannot be assigned to new orders
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => {
                  setIsActive(checked);
                  setValue('is_active', checked);
                }}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/technicians')}
              disabled={createUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Technician
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
