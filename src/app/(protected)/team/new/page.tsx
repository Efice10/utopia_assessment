'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  PageHeader,
  PageTransition,
  BackLink,
  SimpleGlassCard,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  department: z.string().min(1, 'Please select a department'),
});

type FormData = z.infer<typeof formSchema>;

const roles = [
  'Senior Developer',
  'Junior Developer',
  'Product Manager',
  'Designer',
  'QA Engineer',
  'DevOps Engineer',
  'Marketing Manager',
];

const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
];

export default function NewTeamMemberPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (_data: FormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate back to list page after success
    router.push('/team');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Back link to list */}
      <BackLink href="/team" label="Back to Team" />

      {/* Page header */}
      <PageHeader
        title="Add New Team Member"
        description="Fill in the details to add a new team member"
      />

      {/* Form in a card */}
      <SimpleGlassCard className="max-w-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={value => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={value => setValue('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-sm text-destructive">{errors.department.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/team')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SimpleGlassCard>
      </div>
    </PageTransition>
  );
}
