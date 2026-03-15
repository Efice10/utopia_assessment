import { ProfileSettings } from '@/components/settings/profile-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your public profile information and personal details.',
};

export default function ProfileSettingsPage() {
  return <ProfileSettings />;
}
