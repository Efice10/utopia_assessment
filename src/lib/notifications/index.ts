/**
 * Notifications Library
 *
 * Export all notification-related functionality.
 */

// Types
export type {
  NotificationChannel,
  NotificationStatus,
  RecipientType,
  NotificationTriggerEvent,
  NotificationLog,
  NotificationLogInsert,
  NotificationTemplate,
  TemplateVariables,
  SendNotificationRequest,
  SendNotificationResponse,
  NotificationLogFilters,
} from '@/types/notification';

// Templates
export {
  defaultTemplates,
  technicianTemplates,
  managerTemplates,
  getTemplate,
  renderTemplate,
} from './templates';

// WhatsApp
export {
  generateWhatsAppUrl,
  generateBusinessApiUrl,
  isWhatsAppAvailable,
  openWhatsApp,
} from './whatsapp';

// Service
export {
  sendOrderNotification,
  updateNotificationStatus,
  getNotificationHistory,
  notificationHelpers,
} from './service';
