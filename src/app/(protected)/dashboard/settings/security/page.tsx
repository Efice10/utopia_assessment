import { SecuritySettings } from '@/components/settings/security-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Manage your account security, password, and authentication settings.',
};

export default function SecuritySettingsPage() {
  return <SecuritySettings />;
}
