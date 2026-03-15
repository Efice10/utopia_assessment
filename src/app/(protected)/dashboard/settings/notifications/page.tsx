import { NotificationSettings } from '@/components/settings/notification-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
  description:
    'Configure your notification preferences and communication settings.',
};

export default function NotificationSettingsPage() {
  return <NotificationSettings />;
}
