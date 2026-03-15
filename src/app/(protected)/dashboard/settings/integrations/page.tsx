import { IntegrationsSettings } from '@/components/settings/integrations-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Connect third-party services to enhance your workflow.',
};

export default function IntegrationsSettingsPage() {
  return <IntegrationsSettings />;
}
