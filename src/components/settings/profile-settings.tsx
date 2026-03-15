'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  AnimatedSettingsCard,
  AnimatedSettingsForm,
} from '@/components/ui/animated-settings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const profileSettingsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

export function ProfileSettings() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      bio: 'Product designer and developer passionate about creating great user experiences.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
    },
  });

  const onSubmit = async (_data: ProfileSettingsData) => {
    try {
      // TODO: Implement API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch {
      throw new Error('Failed to save profile');
    }
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload functionality
  };

  return (
    <div className='space-y-6'>
      <AnimatedSettingsCard>
        <h2 className='text-2xl font-bold tracking-tight'>Profile</h2>
        <p className='text-muted-foreground'>
          Manage your public profile information.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      <AnimatedSettingsCard delay={0.1}>
        <h3 className='text-lg font-medium'>Avatar</h3>
        <div className='flex items-center gap-4'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src='/avatars/user.jpg' alt='Profile' />
            <AvatarFallback className='text-lg'>JD</AvatarFallback>
          </Avatar>
          <div className='space-y-2'>
            <Button onClick={handleAvatarUpload}>Upload new avatar</Button>
            <p className='text-muted-foreground text-sm'>
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>
      </AnimatedSettingsCard>

      <Separator />

      <AnimatedSettingsForm
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
      >
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input id='firstName' {...register('firstName')} />
            {errors.firstName && (
              <p className='text-destructive text-sm'>
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input id='lastName' {...register('lastName')} />
            {errors.lastName && (
              <p className='text-destructive text-sm'>
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' {...register('email')} />
          {errors.email && (
            <p className='text-destructive text-sm'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phone'>Phone Number</Label>
          <Input
            id='phone'
            type='tel'
            placeholder='+1 (555) 123-4567'
            {...register('phone')}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='bio'>Bio</Label>
          <Textarea
            id='bio'
            placeholder='Tell us about yourself...'
            {...register('bio')}
          />
          <p className='text-muted-foreground text-sm'>
            Brief description for your profile.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              placeholder='San Francisco, CA'
              {...register('location')}
            />
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
