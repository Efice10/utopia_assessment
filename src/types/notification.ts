/**
 * Notification Types
 *
 * Re-exports database types and adds additional notification-specific types.
 */

import type {
  NotificationChannel,
  NotificationStatus,
  RecipientType,
  NotificationLog,
  NotificationLogInsert,
} from './database';

// Re-export database types
export type {
  NotificationChannel,
  NotificationStatus,
  RecipientType,
  NotificationLog,
  NotificationLogInsert,
};

// Trigger events for notifications (not stored in database, only for application logic)
export type NotificationTriggerEvent =
  | 'order_created'
  | 'order_assigned'
  | 'order_started'
  | 'job_completed'
  | 'order_reviewed'
  | 'payment_received';

// Notification template (for application use, not database)
export interface NotificationTemplate {
  id: string;
  name: string;
  trigger_event: NotificationTriggerEvent;
  template_body: string;
  variables: string[];
  is_active: boolean;
}

// Template variables that can be used in messages
export interface TemplateVariables {
  order_no?: string;
  customer_name?: string;
  technician_name?: string;
  service_type?: string;
  address?: string;
  phone?: string;
  quoted_price?: string;
  final_amount?: string;
  completion_time?: string;
  problem_description?: string;
}

// Notification request
export interface SendNotificationRequest {
  orderId: string;
  event: NotificationTriggerEvent;
  recipientType: RecipientType;
  customMessage?: string;
  phone?: string;
}

// Notification response
export interface SendNotificationResponse {
  success: boolean;
  logId?: string;
  whatsappUrl?: string;
  error?: string;
}

// Notification history filters
export interface NotificationLogFilters {
  orderId?: string;
  status?: NotificationStatus;
  recipientType?: RecipientType;
  dateFrom?: string;
  dateTo?: string;
}
