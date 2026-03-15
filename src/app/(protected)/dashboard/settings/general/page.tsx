import { GeneralSettings } from '@/components/settings/general-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'General',
  description: 'Manage your general account settings and preferences.',
};

export default function GeneralSettingsPage() {
  return <GeneralSettings />;
}
