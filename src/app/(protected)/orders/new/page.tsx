import { OrderForm } from '@/components/orders/order-form';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Order',
  description: 'Create a new service order',
};

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground">
          Fill in the form below to create a new service order.
        </p>
      </div>
      <OrderForm />
    </div>
  );
}
