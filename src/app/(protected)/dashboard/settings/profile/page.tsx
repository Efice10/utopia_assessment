import { ProfileSettings } from '@/components/settings/profile-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your public profile information and personal details.',
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and avatar.
        </p>
      </div>
      <ProfileSettings />
    </div>
  );
}
