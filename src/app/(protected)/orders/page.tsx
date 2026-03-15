import { OrdersContent } from '@/components/orders/orders-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Manage service orders',
};

export default function OrdersPage() {
  return <OrdersContent />;
}
