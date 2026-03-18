'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Building2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateBranch } from '@/hooks';

// Zod schema for form validation
const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  onSuccess?: () => void;
}

export function BranchForm({ onSuccess }: BranchFormProps) {
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const [submittedBranch, setSubmittedBranch] = useState<BranchFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  const createBranch = useCreateBranch();

  const onSubmit = async (data: BranchFormData) => {
    try {
      setSubmittedBranch(data);

      // Create branch in database
      await createBranch.mutateAsync({
        name: data.name,
        address: data.address,
        phone: data.phone ?? null,
        is_active: true,
      });

      // Show summary dialog
      setShowSummary(true);

      onSuccess?.();
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  const handleCreateAnother = () => {
    setShowSummary(false);
    setSubmittedBranch(null);
    reset();
  };

  const handleViewBranches = () => {
    router.push('/branches');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Branch
          </CardTitle>
          <CardDescription>
            Create a new branch location for your operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Branch Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Branch Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Branch Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., KL Main Branch"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="03-12345678"
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
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Full branch address"
                  rows={3}
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
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
                    Creating Branch...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Branch
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Branch Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              Branch Created Successfully!
            </DialogTitle>
            <DialogDescription>
              The branch has been created and is now active.
            </DialogDescription>
          </DialogHeader>
          {submittedBranch && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-3 font-medium">Branch Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Branch Name:</dt>
                    <dd className="font-medium">{submittedBranch.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Address:</dt>
                    <dd className="text-right max-w-[200px]">{submittedBranch.address}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd>{submittedBranch.phone ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="text-emerald-600 font-medium">Active</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={handleCreateAnother}>
                  Create Another
                </Button>
                <Button onClick={handleViewBranches}>View All Branches</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
