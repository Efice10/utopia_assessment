import { OrderDetailContent } from '@/components/orders/order-detail-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View and manage order details',
};

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetailContent id={params.id} />;
}
