import { TechnicianEditContent } from '@/components/technicians/technician-edit-content';

import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Edit Technician',
  description: 'Edit technician details',
};

export default function TechnicianEditPage({
  params,
}: {
  params: { id: string };
}) {
  return <TechnicianEditContent id={params.id} />;
}
