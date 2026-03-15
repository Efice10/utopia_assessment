'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  AnimatedSettingsCard,
  AnimatedSettingsForm,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions] = useState([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome',
      location: 'San Francisco, CA',
      lastActive: 'Now',
      current: true,
      icon: Monitor,
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'San Francisco, CA',
      lastActive: '2 hours ago',
      current: false,
      icon: Smartphone,
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (_data: PasswordChangeData) => {
    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      reset();
      // Show success message
    } catch {
      throw new Error('Failed to change password');
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    // TODO: Implement session revocation
    // sessionId will be used when implementing the actual functionality
    void sessionId;
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    // TODO: Implement 2FA setup flow
  };

  return (
    <div className='space-y-6'>
      <AnimatedSettingsCard>
        <h2 className='text-2xl font-bold tracking-tight'>Security</h2>
        <p className='text-muted-foreground'>
          Manage your account security and privacy settings.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Password Change */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Change Password</h3>
          <p className='text-muted-foreground text-sm'>
            Update your password to keep your account secure.
          </p>
          <AnimatedSettingsForm
            onSubmit={handleSubmit(onSubmit)}
            className='mt-4 space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>Current Password</Label>
              <Input
                id='currentPassword'
                type='password'
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className='text-destructive text-sm'>
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='newPassword'>New Password</Label>
              <Input
                id='newPassword'
                type='password'
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className='text-destructive text-sm'>
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm New Password</Label>
              <Input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className='text-destructive text-sm'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </AnimatedSettingsForm>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Two-Factor Authentication */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Two-Factor Authentication</h3>
          <p className='text-muted-foreground text-sm'>
            Add an extra layer of security to your account.
          </p>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Two-factor authentication</span>
                {twoFactorEnabled ? (
                  <Badge variant='secondary' className='text-green-600'>
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant='outline'>Disabled</Badge>
                )}
              </div>
              <p className='text-muted-foreground text-sm'>
                {twoFactorEnabled
                  ? 'Your account is protected with 2FA.'
                  : 'Secure your account with two-factor authentication.'}
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? 'outline' : 'default'}
              onClick={handleEnable2FA}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </Button>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Active Sessions */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Active Sessions</h3>
          <p className='text-muted-foreground text-sm'>
            Manage devices that are signed in to your account.
          </p>
          <div className='space-y-4'>
            {sessions.map(session => (
              <div
                key={session.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div className='flex items-center gap-3'>
                  <session.icon className='text-muted-foreground h-5 w-5' />
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{session.device}</span>
                      {session.current && (
                        <Badge variant='secondary' className='text-xs'>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {session.browser} • {session.location} •{' '}
                      {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className='bg-destructive/10 mt-4 flex items-start gap-3 rounded-lg p-4'>
            <AlertTriangle className='text-destructive mt-0.5 h-5 w-5 flex-shrink-0' />
            <div>
              <p className='text-destructive text-sm font-medium'>
                Security Notice
              </p>
              <p className='text-muted-foreground text-sm'>
                If you see any suspicious activity, revoke those sessions
                immediately and change your password.
              </p>
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>
    </div>
  );
}
