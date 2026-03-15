/**
 * Notification Message Templates
 */

import type { NotificationTemplate, NotificationTriggerEvent } from '@/types/notification';

// Default templates for each trigger event
export const defaultTemplates: Record<NotificationTriggerEvent, NotificationTemplate> = {
  order_created: {
    id: 'tpl_order_created',
    name: 'Order Created',
    trigger_event: 'order_created',
    template_body: `Hi {{customer_name}},

Thank you for choosing Sejuk Sejuk Service!

Your service request has been received:
Order: {{order_no}}
Service: {{service_type}}
Address: {{address}}

We will assign a technician shortly.

Sejuk Sejuk Service`,
    variables: ['customer_name', 'order_no', 'service_type', 'address'],
    is_active: true,
  },

  order_assigned: {
    id: 'tpl_order_assigned',
    name: 'Technician Assigned',
    trigger_event: 'order_assigned',
    template_body: `Hi {{customer_name}},

Great news! A technician has been assigned to your order.

Order: {{order_no}}
Technician: {{technician_name}}
Service: {{service_type}}

They will contact you shortly to schedule the visit.

Sejuk Sejuk Service`,
    variables: ['customer_name', 'order_no', 'technician_name', 'service_type'],
    is_active: true,
  },

  order_started: {
    id: 'tpl_order_started',
    name: 'Job Started',
    trigger_event: 'order_started',
    template_body: `Hi {{customer_name}},

Your technician {{technician_name}} is on the way!

Order: {{order_no}}
Service: {{service_type}}

Please ensure someone is available at the location.

Sejuk Sejuk Service`,
    variables: ['customer_name', 'technician_name', 'order_no', 'service_type'],
    is_active: true,
  },

  job_completed: {
    id: 'tpl_job_completed',
    name: 'Job Completed',
    trigger_event: 'job_completed',
    template_body: `Hi {{customer_name}},

Your service request has been completed!

Order: {{order_no}}
Service: {{service_type}}
Amount: RM {{final_amount}}

Thank you for choosing Sejuk Sejuk Service!

We'd love to hear your feedback. Please reply with your rating (1-5 stars).

Sejuk Sejuk Service`,
    variables: ['customer_name', 'order_no', 'service_type', 'final_amount'],
    is_active: true,
  },

  order_reviewed: {
    id: 'tpl_order_reviewed',
    name: 'Order Reviewed',
    trigger_event: 'order_reviewed',
    template_body: `Hi {{customer_name}},

Your order {{order_no}} has been reviewed and approved.

Thank you for your business!

Sejuk Sejuk Service`,
    variables: ['customer_name', 'order_no'],
    is_active: true,
  },

  payment_received: {
    id: 'tpl_payment_received',
    name: 'Payment Received',
    trigger_event: 'payment_received',
    template_body: `Hi {{customer_name}},

Payment received!

Order: {{order_no}}
Amount: RM {{final_amount}}

Thank you for your payment!

Sejuk Sejuk Service`,
    variables: ['customer_name', 'order_no', 'final_amount'],
    is_active: true,
  },
};

// Technician notification templates
export const technicianTemplates: Record<NotificationTriggerEvent, NotificationTemplate> = {
  order_created: {
    id: 'tpl_tech_order_created',
    name: 'New Order (Technician)',
    trigger_event: 'order_created',
    template_body: `Hello {{technician_name}},

A new order is available:

Order: {{order_no}}
Customer: {{customer_name}}
Phone: {{phone}}
Address: {{address}}
Service: {{service_type}}
Problem: {{problem_description}}
Quoted Price: RM {{quoted_price}}

Please check your app for details.

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no', 'customer_name', 'phone', 'address', 'service_type', 'problem_description', 'quoted_price'],
    is_active: true,
  },

  order_assigned: {
    id: 'tpl_tech_order_assigned',
    name: 'Order Assigned (Technician)',
    trigger_event: 'order_assigned',
    template_body: `Hello {{technician_name}},

You have been assigned a new job!

Order: {{order_no}}
Customer: {{customer_name}}
Phone: {{phone}}
Address: {{address}}
Service: {{service_type}}
Problem: {{problem_description}}
Quoted Price: RM {{quoted_price}}

Please contact the customer to schedule.

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no', 'customer_name', 'phone', 'address', 'service_type', 'problem_description', 'quoted_price'],
    is_active: true,
  },

  order_started: {
    id: 'tpl_tech_order_started',
    name: 'Job Started (Technician)',
    trigger_event: 'order_started',
    template_body: `Hello {{technician_name}},

Job started for order {{order_no}}.

Remember to:
- Take photos before and after
- Document all work done
- Collect payment upon completion

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no'],
    is_active: true,
  },

  job_completed: {
    id: 'tpl_tech_job_completed',
    name: 'Job Completed (Technician)',
    trigger_event: 'job_completed',
    template_body: `Hello {{technician_name}},

Job {{order_no}} has been marked as complete.

Final Amount: RM {{final_amount}}

Thank you for your hard work!

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no', 'final_amount'],
    is_active: true,
  },

  order_reviewed: {
    id: 'tpl_tech_order_reviewed',
    name: 'Order Reviewed (Technician)',
    trigger_event: 'order_reviewed',
    template_body: `Hello {{technician_name}},

Your job {{order_no}} has been reviewed and approved.

Great job!

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no'],
    is_active: true,
  },

  payment_received: {
    id: 'tpl_tech_payment_received',
    name: 'Payment Received (Technician)',
    trigger_event: 'payment_received',
    template_body: `Hello {{technician_name}},

Payment of RM {{final_amount}} has been recorded for order {{order_no}}.

Sejuk Sejuk Service`,
    variables: ['technician_name', 'order_no', 'final_amount'],
    is_active: true,
  },
};

// Manager notification templates
export const managerTemplates: Partial<Record<NotificationTriggerEvent, NotificationTemplate>> = {
  job_completed: {
    id: 'tpl_manager_job_completed',
    name: 'Job Completed (Manager)',
    trigger_event: 'job_completed',
    template_body: `Hello Manager,

A job has been completed and is ready for review.

Order: {{order_no}}
Customer: {{customer_name}}
Technician: {{technician_name}}
Service: {{service_type}}
Final Amount: RM {{final_amount}}

Please review at your earliest convenience.

Sejuk Sejuk Service`,
    variables: ['order_no', 'customer_name', 'technician_name', 'service_type', 'final_amount'],
    is_active: true,
  },
};

/**
 * Get template for a specific event and recipient type
 */
export function getTemplate(
  event: NotificationTriggerEvent,
  recipientType: 'customer' | 'technician' | 'manager'
): NotificationTemplate | null {
  switch (recipientType) {
    case 'technician':
      return technicianTemplates[event] || null;
    case 'manager':
      return managerTemplates[event] || null;
    case 'customer':
    default:
      return defaultTemplates[event] || null;
  }
}

/**
 * Replace template variables with actual values
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string | number | undefined>
): string {
  let rendered = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, String(value ?? ''));
  });

  return rendered;
}
