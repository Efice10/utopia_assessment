'use client';

import { useState } from 'react';

import { Shield, User } from 'lucide-react';

import {
  AnimatedSettingsCard,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: 'profile-visibility',
      title: 'Public Profile',
      description: 'Allow others to see your profile information',
      enabled: true,
    },
    {
      id: 'activity-status',
      title: 'Activity Status',
      description: 'Show when you were last active',
      enabled: false,
    },
    {
      id: 'analytics',
      title: 'Analytics & Improvements',
      description: 'Help us improve by sharing anonymous usage data',
      enabled: true,
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Receive emails about new features and promotions',
      enabled: false,
    },
    {
      id: 'third-party',
      title: 'Third-party Integrations',
      description: 'Allow connected services to access your data',
      enabled: true,
    },
  ]);

  const [dataRetention, setDataRetention] = useState('1-year');

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Exporting data...');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion flow
    console.log('Delete account requested...');
  };

  return (
    <div className="space-y-6">
      <AnimatedSettingsCard>
        <h2 className="text-2xl font-bold tracking-tight">Privacy</h2>
        <p className="text-muted-foreground">
          Manage your privacy settings and data preferences.
        </p>
      </AnimatedSettingsCard>
      <Separator />

      {/* Privacy Settings */}
      <AnimatedSettingsSection delay={0.1}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Privacy Preferences</h3>
          <p className="text-muted-foreground text-sm">
            Control what information is visible and how your data is used.
          </p>
          <div className="mt-4 space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    {setting.description}
                  </p>
                </div>
                <button
                  type="button"
                  id={setting.id}
                  role="switch"
                  aria-checked={setting.enabled}
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Data Retention */}
      <AnimatedSettingsSection delay={0.2}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Data Retention</h3>
          <p className="text-muted-foreground text-sm">
            Choose how long we keep your data.
          </p>
          <div className="mt-4 space-y-2">
            {[
              { value: '3-months', label: '3 Months' },
              { value: '6-months', label: '6 Months' },
              { value: '1-year', label: '1 Year' },
              { value: 'forever', label: 'Forever' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDataRetention(option.value)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                  dataRetention === option.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/20'
                }`}
              >
                <span>{option.label}</span>
                {dataRetention === option.value && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Data Management */}
      <AnimatedSettingsSection delay={0.3}>
        <AnimatedSettingsCard>
          <h3 className="text-lg font-semibold">Data Management</h3>
          <p className="text-muted-foreground text-sm">
            Export or delete your personal data.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-muted-foreground text-sm">
                    Download a copy of all your data
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Export
              </Button>
            </div>
          </div>
        </AnimatedSettingsCard>
      </AnimatedSettingsSection>

      {/* Danger Zone */}
      <AnimatedSettingsSection delay={0.4}>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <Badge variant="destructive" className="text-xs">
                Irreversible
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Permanently delete your account and all associated data.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </AnimatedSettingsSection>

      {/* Save Button */}
      <AnimatedSettingsSection delay={0.5}>
        <Button>Save Preferences</Button>
      </AnimatedSettingsSection>
    </div>
  );
}
