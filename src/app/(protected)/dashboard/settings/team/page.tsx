import { TeamSettings } from '@/components/settings/team-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Manage your team members and their roles.',
};

export default function TeamSettingsPage() {
  return <TeamSettings />;
}
