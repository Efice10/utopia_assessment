'use client';

import { useState } from 'react';

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
import { useAuthStore } from '@/lib/auth-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const profileSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;

export function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const onSubmit = async (data: ProfileSettingsData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({
        ...user,
        name: data.name,
        phone: data.phone,
      });

      // Show success (you could add a toast here)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Only JPG, PNG, and GIF files are allowed');
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setUser({
        ...user,
        avatar: publicUrl,
      });

      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
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
            <AvatarImage src={user?.avatar} alt={user?.name ?? 'Profile'} />
            <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
          </Avatar>
          <div className='space-y-2'>
            <Label htmlFor='avatar-upload'>
              <Button asChild disabled={uploadingAvatar}>
                <span>
                  {uploadingAvatar ? 'Uploading...' : 'Upload new avatar'}
                </span>
              </Button>
            </Label>
            <input
              id='avatar-upload'
              type='file'
              accept='image/jpeg,image/png,image/gif'
              className='hidden'
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
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
        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input id='name' {...register('name')} />
          {errors.name && (
            <p className='text-destructive text-sm'>{errors.name.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' {...register('email')} disabled />
          <p className='text-muted-foreground text-sm'>
            Email cannot be changed. Contact admin if needed.
          </p>
          {errors.email && (
            <p className='text-destructive text-sm'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phone'>Phone Number</Label>
          <Input
            id='phone'
            type='tel'
            placeholder='+60 12-3456789'
            {...register('phone')}
          />
        </div>

        <AnimatedSettingsCard delay={0.3}>
          <Button type='submit' disabled={isLoading || !isDirty}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </AnimatedSettingsCard>
      </AnimatedSettingsForm>
    </div>
  );
}
