/**
 * Notification Service
 *
 * Orchestrates notification sending, logging, and retrieval.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { OrderWithRelations } from '@/types/database';
import type {
  NotificationTriggerEvent,
  RecipientType,
  NotificationLog,
  NotificationLogInsert,
  TemplateVariables,
  SendNotificationResponse,
} from '@/types/notification';

import { getTemplate, renderTemplate } from './templates';
import { generateWhatsAppUrl } from './whatsapp';


/**
 * Send notification for an order event
 */
export async function sendOrderNotification(
  orderId: string,
  event: NotificationTriggerEvent,
  recipientType: RecipientType,
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  customMessage?: string
): Promise<SendNotificationResponse> {
  try {
    // Fetch order details with relations
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        technician:users!assigned_technician_id(*),
        branch:branches(*),
        service_record:service_records(*)
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    const orderWithRelations = order as OrderWithRelations;

    // Get template for this event and recipient type
    const template = getTemplate(event, recipientType);
    if (!template && !customMessage) {
      return { success: false, error: 'No template found for this event' };
    }

    // Build template variables
    const variables = buildTemplateVariables(orderWithRelations, recipientType);

    // Render message
    const message = customMessage || (template ? renderTemplate(template.template_body, variables) : '');

    // Determine recipient phone
    const { phone, recipientName } = getRecipientInfo(orderWithRelations, recipientType);

    if (!phone) {
      return { success: false, error: 'No phone number available for recipient' };
    }

    // Generate WhatsApp URL
    const whatsappUrl = generateWhatsAppUrl(phone, message);

    // Log the notification
    const logEntry: NotificationLogInsert = {
      order_id: orderId,
      recipient_phone: phone,
      recipient_type: recipientType,
      recipient_name: recipientName,
      message,
      channel: 'whatsapp',
      status: 'pending',
      created_by: orderWithRelations.created_by,
    };

    const { data: log, error: logError } = await supabase
      .from('notification_logs')
      .insert(logEntry as unknown as Record<string, unknown>)
      .select()
      .single();

    if (logError) {
      console.error('Failed to log notification:', logError);
      // Continue even if logging fails
    }

    return {
      success: true,
      logId: log?.id,
      whatsappUrl,
    };
  } catch (error) {
    console.error('Notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update notification log status after send attempt
 */
export async function updateNotificationStatus(
  logId: string,
  status: 'sent' | 'failed',
  errorMessage?: string,
  supabase?: ReturnType<typeof getSupabaseBrowserClient>
): Promise<void> {
  const client = supabase || getSupabaseBrowserClient();

  await client
    .from('notification_logs')
    .update({
      status,
      error_message: errorMessage || null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .eq('id', logId);
}

/**
 * Get notification history for an order
 */
export async function getNotificationHistory(
  orderId: string,
  supabase?: ReturnType<typeof getSupabaseBrowserClient>
): Promise<NotificationLog[]> {
  const client = supabase || getSupabaseBrowserClient();

  const { data, error } = await client
    .from('notification_logs')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch notification history:', error);
    return [];
  }

  return (data as NotificationLog[]) || [];
}

/**
 * Build template variables from order data
 */
function buildTemplateVariables(
  order: OrderWithRelations,
  recipientType: RecipientType
): TemplateVariables {
  return {
    order_no: order.order_no,
    customer_name: order.customer_name,
    technician_name: order.technician?.name || 'Technician',
    service_type: order.service_type?.replace('_', ' ') || 'Service',
    address: order.address,
    phone: order.phone,
    quoted_price: order.quoted_price?.toFixed(2),
    final_amount: order.service_record?.final_amount?.toFixed(2) || order.quoted_price?.toFixed(2),
    completion_time: order.service_record?.completed_at
      ? new Date(order.service_record.completed_at).toLocaleString('en-MY')
      : '',
    problem_description: order.problem_description,
  };
}

/**
 * Get recipient phone number and name based on type
 */
function getRecipientInfo(
  order: OrderWithRelations,
  recipientType: RecipientType
): { phone: string | undefined; recipientName: string | undefined } {
  switch (recipientType) {
    case 'customer':
      return {
        phone: order.phone,
        recipientName: order.customer_name,
      };
    case 'technician':
      return {
        phone: order.technician?.phone || undefined,
        recipientName: order.technician?.name,
      };
    case 'manager':
      // For manager, we'd need to fetch from settings or use a default
      // For now, return undefined - this would be configured in settings
      return {
        phone: undefined,
        recipientName: 'Manager',
      };
    default:
      return { phone: undefined, recipientName: undefined };
  }
}

/**
 * Quick notification helpers for common events
 */
export const notificationHelpers = {
  /**
   * Notify technician when assigned to order
   */
  async notifyTechnicianAssigned(
    orderId: string,
    supabase: ReturnType<typeof getSupabaseBrowserClient>
  ): Promise<SendNotificationResponse> {
    return sendOrderNotification(orderId, 'order_assigned', 'technician', supabase);
  },

  /**
   * Notify customer when job is completed
   */
  async notifyCustomerJobDone(
    orderId: string,
    supabase: ReturnType<typeof getSupabaseBrowserClient>
  ): Promise<SendNotificationResponse> {
    return sendOrderNotification(orderId, 'job_completed', 'customer', supabase);
  },

  /**
   * Notify manager when job is done
   */
  async notifyManagerJobDone(
    orderId: string,
    managerPhone: string,
    supabase: ReturnType<typeof getSupabaseBrowserClient>
  ): Promise<SendNotificationResponse> {
    // For manager notifications, we'd need the manager's phone
    // This would typically come from settings or the managers table
    return sendOrderNotification(orderId, 'job_completed', 'manager', supabase);
  },
};
