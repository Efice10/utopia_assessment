import { AppearanceSettings } from '@/components/settings/appearance-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appearance',
  description: 'Customize how the application looks and feels.',
};

export default function AppearanceSettingsPage() {
  return <AppearanceSettings />;
}
