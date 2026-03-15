import { TechnicianDetailContent } from '@/components/technicians/technician-detail-content';

import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Technician Details',
  description: 'View and manage technician details',
};

export default function TechnicianDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TechnicianDetailContent id={params.id} />;
}
