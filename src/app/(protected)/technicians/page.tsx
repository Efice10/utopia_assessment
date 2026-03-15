import { TechniciansContent } from '@/components/technicians/technicians-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technicians',
  description: 'View and manage technician teams',
};

export default function TechniciansPage() {
  return <TechniciansContent />;
}
