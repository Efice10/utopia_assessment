import { LanguageSettings } from '@/components/settings/language-settings';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Language',
  description: 'Configure your language and regional preferences.',
};

export default function LanguageSettingsPage() {
  return <LanguageSettings />;
}
