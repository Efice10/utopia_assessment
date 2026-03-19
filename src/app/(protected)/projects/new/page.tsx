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
import { Textarea } from '@/components/ui/textarea';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.string().min(1, 'Please select a priority'),
  dueDate: z.string().min(1, 'Please select a due date'),
});

type FormData = z.infer<typeof formSchema>;

const priorities = ['High', 'Medium', 'Low'];

export default function NewProjectPage() {
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
    router.push('/projects/active');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back link */}
        <BackLink href="/projects" label="Back to Projects" />

        {/* Page header */}
        <PageHeader
          title="Create New Project"
          description="Fill in the details to create a new project"
        />

        {/* Form in a card */}
        <SimpleGlassCard className="max-w-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={value => setValue('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
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
