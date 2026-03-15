'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  AnimatedSettingsCard,
  AnimatedSettingsForm,
} from '@/components/ui/animated-settings';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const generalSettingsSchema = z.object({
  organizationName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  language: z.string(),
  timezone: z.string(),
  autoSave: z.boolean(),
  emailNotifications: z.boolean(),
});

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;

export function GeneralSettings() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      organizationName: 'Acme Inc',
      website: 'https://acme.com',
      description: 'A forward-thinking company building the future.',
      language: 'en',
      timezone: 'UTC',
      autoSave: true,
      emailNotifications: true,
    },
  });

  const onSubmit = async (_data: GeneralSettingsData) => {
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch {
      throw new Error('Failed to save settings');
    }
  };

  return (
    <div className='space-y-6'>
      <AnimatedSettingsCard>
        <h2 className='text-2xl font-bold tracking-tight'>General</h2>
        <p className='text-muted-foreground'>
          Manage your general account settings.
        </p>
      </AnimatedSettingsCard>
      <Separator />
      <AnimatedSettingsForm
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
      >
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='organizationName'>Organization Name</Label>
            <Input id='organizationName' {...register('organizationName')} />
            {errors.organizationName && (
              <p className='text-destructive text-sm'>
                {errors.organizationName.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='website'>Website</Label>
            <Input
              id='website'
              type='url'
              placeholder='https://example.com'
              {...register('website')}
            />
            {errors.website && (
              <p className='text-destructive text-sm'>
                {errors.website.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Tell us about your organization...'
              {...register('description')}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='language'>Language</Label>
              <Select
                value={watch('language')}
                onValueChange={value => setValue('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='es'>Spanish</SelectItem>
                  <SelectItem value='fr'>French</SelectItem>
                  <SelectItem value='de'>German</SelectItem>
                  <SelectItem value='ja'>Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='timezone'>Timezone</Label>
              <Select
                value={watch('timezone')}
                onValueChange={value => setValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='UTC'>UTC</SelectItem>
                  <SelectItem value='America/New_York'>Eastern Time</SelectItem>
                  <SelectItem value='America/Chicago'>Central Time</SelectItem>
                  <SelectItem value='America/Denver'>Mountain Time</SelectItem>
                  <SelectItem value='America/Los_Angeles'>
                    Pacific Time
                  </SelectItem>
                  <SelectItem value='Europe/London'>GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Preferences</h3>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='autoSave'>Auto-save</Label>
              <p className='text-muted-foreground text-sm'>
                Automatically save your work as you type.
              </p>
            </div>
            <Switch
              id='autoSave'
              checked={watch('autoSave')}
              onCheckedChange={checked => setValue('autoSave', checked)}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='emailNotifications'>Email notifications</Label>
              <p className='text-muted-foreground text-sm'>
                Receive email notifications for important updates.
              </p>
            </div>
            <Switch
              id='emailNotifications'
              checked={watch('emailNotifications')}
              onCheckedChange={checked =>
                setValue('emailNotifications', checked)
              }
            />
          </div>
        </div>

        <AnimatedSettingsCard delay={0.3}>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </AnimatedSettingsCard>
      </AnimatedSettingsForm>
    </div>
  );
}
