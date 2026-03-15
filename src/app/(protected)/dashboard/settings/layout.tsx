import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Settings',
    default: 'Settings',
  },
  description: 'Manage your account settings and preferences.',
};

export default function SettingsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
