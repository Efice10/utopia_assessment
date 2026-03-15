import { ApiSettings } from '@/components/settings/api-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys',
  description: 'Manage API keys for programmatic access to your account.',
};

export default function ApiSettingsPage() {
  return <ApiSettings />;
}
