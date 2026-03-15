import { PrivacySettings } from '@/components/settings/privacy-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Manage your privacy settings and data preferences.',
};

export default function PrivacySettingsPage() {
  return <PrivacySettings />;
}
