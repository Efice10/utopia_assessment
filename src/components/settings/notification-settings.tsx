'use client';

import { useState } from 'react';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface NotificationSettingsType {
  email: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    digest: boolean;
  };
  push: {
    comments: boolean;
    mentions: boolean;
    followers: boolean;
    messages: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    email: {
      marketing: true,
      security: true,
      updates: false,
      digest: true,
    },
    push: {
      comments: true,
      mentions: true,
      followers: false,
      messages: true,
    },
    frequency: 'daily',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEmailSetting = (
    key: keyof typeof settings.email,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value,
      },
    }));
  };

  const updatePushSetting = (
    key: keyof typeof settings.push,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value,
      },
    }));
  };

  const updateFrequency = (
    frequency: NotificationSettingsType['frequency']
  ) => {
    setSettings(prev => ({
      ...prev,
      frequency,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save notification settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch {
      throw new Error('Failed to save notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <AnimatedSettingsCard>
        <h2 className='text-2xl font-bold tracking-tight'>Notifications</h2>
        <p className='text-muted-foreground'>
          Manage how you receive notifications and updates.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Email Notifications */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Email Notifications</h3>
          <p className='text-muted-foreground text-sm'>
            Choose which emails you&apos;d like to receive.
          </p>
          <div className='mt-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-marketing'>Marketing emails</Label>
                <p className='text-muted-foreground text-sm'>
                  Receive emails about new features and promotions.
                </p>
              </div>
              <Switch
                id='email-marketing'
                checked={settings.email.marketing}
                onCheckedChange={value =>
                  updateEmailSetting('marketing', value)
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-security'>Security notifications</Label>
                <p className='text-muted-foreground text-sm'>
                  Important security updates and alerts.
                </p>
              </div>
              <Switch
                id='email-security'
                checked={settings.email.security}
                onCheckedChange={value => updateEmailSetting('security', value)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-updates'>Product updates</Label>
                <p className='text-muted-foreground text-sm'>
                  Get notified when we ship new features.
                </p>
              </div>
              <Switch
                id='email-updates'
                checked={settings.email.updates}
                onCheckedChange={value => updateEmailSetting('updates', value)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-digest'>Weekly digest</Label>
                <p className='text-muted-foreground text-sm'>
                  A summary of your activity and updates.
                </p>
              </div>
              <Switch
                id='email-digest'
                checked={settings.email.digest}
                onCheckedChange={value => updateEmailSetting('digest', value)}
              />
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Push Notifications */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Push Notifications</h3>
          <p className='text-muted-foreground text-sm'>
            Manage notifications on your devices.
          </p>
          <div className='mt-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-comments'>Comments</Label>
                <p className='text-muted-foreground text-sm'>
                  When someone comments on your content.
                </p>
              </div>
              <Switch
                id='push-comments'
                checked={settings.push.comments}
                onCheckedChange={value => updatePushSetting('comments', value)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-mentions'>Mentions</Label>
                <p className='text-muted-foreground text-sm'>
                  When someone mentions you in a comment.
                </p>
              </div>
              <Switch
                id='push-mentions'
                checked={settings.push.mentions}
                onCheckedChange={value => updatePushSetting('mentions', value)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-followers'>New followers</Label>
                <p className='text-muted-foreground text-sm'>
                  When someone follows you.
                </p>
              </div>
              <Switch
                id='push-followers'
                checked={settings.push.followers}
                onCheckedChange={value => updatePushSetting('followers', value)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='push-messages'>Direct messages</Label>
                <p className='text-muted-foreground text-sm'>
                  When you receive a direct message.
                </p>
              </div>
              <Switch
                id='push-messages'
                checked={settings.push.messages}
                onCheckedChange={value => updatePushSetting('messages', value)}
              />
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Notification Frequency */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <h3 className='text-lg font-semibold'>Notification Frequency</h3>
          <p className='text-muted-foreground text-sm'>
            How often would you like to receive notifications?
          </p>
          <div className='mt-4'>
            <RadioGroup
              value={settings.frequency}
              onValueChange={value =>
                updateFrequency(value as NotificationSettingsType['frequency'])
              }
              className='space-y-3'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='immediate' id='immediate' />
                <Label htmlFor='immediate' className='font-normal'>
                  Immediate - Get notified right away
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='daily' id='daily' />
                <Label htmlFor='daily' className='font-normal'>
                  Daily - Once per day summary
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='weekly' id='weekly' />
                <Label htmlFor='weekly' className='font-normal'>
                  Weekly - Weekly digest
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='never' id='never' />
                <Label htmlFor='never' className='font-normal'>
                  Never - Turn off all notifications
                </Label>
              </div>
            </RadioGroup>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      <Button onClick={handleSave} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save preferences'}
      </Button>
    </div>
  );
}
