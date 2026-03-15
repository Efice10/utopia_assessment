/**
 * Notification Hooks
 *
 * React Query hooks for notification operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  sendOrderNotification,
  updateNotificationStatus,
  getNotificationHistory,
} from '@/lib/notifications/service';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  NotificationLog,
  NotificationLogFilters,
  NotificationTriggerEvent,
  RecipientType,
  SendNotificationResponse,
} from '@/types/notification';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  logs: () => [...notificationKeys.all, 'logs'] as const,
  logList: (filters?: NotificationLogFilters) => [...notificationKeys.logs(), filters] as const,
  orderLogs: (orderId: string) => [...notificationKeys.logs(), 'order', orderId] as const,
};

/**
 * Get notification history for an order
 */
export function useNotificationHistory(orderId: string) {
  return useQuery({
    queryKey: notificationKeys.orderLogs(orderId),
    queryFn: () => getNotificationHistory(orderId),
    enabled: !!orderId,
  });
}

/**
 * Get all notification logs with optional filters
 */
export function useNotificationLogs(filters?: NotificationLogFilters) {
  return useQuery({
    queryKey: notificationKeys.logList(filters),
    queryFn: async (): Promise<NotificationLog[]> => {
      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.recipientType) {
        query = query.eq('recipient_type', filters.recipientType);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as NotificationLog[]) || [];
    },
  });
}

/**
 * Send notification mutation
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      event,
      recipientType,
      customMessage,
    }: {
      orderId: string;
      event: NotificationTriggerEvent;
      recipientType: RecipientType;
      customMessage?: string;
    }): Promise<SendNotificationResponse> => {
      const supabase = getSupabaseBrowserClient();
      return sendOrderNotification(orderId, event, recipientType, supabase, customMessage);
    },
    onSuccess: (_, variables) => {
      // Invalidate notification history for this order
      queryClient.invalidateQueries({
        queryKey: notificationKeys.orderLogs(variables.orderId),
      });
    },
  });
}

/**
 * Mark notification as sent
 */
export function useMarkNotificationSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const supabase = getSupabaseBrowserClient();
      await updateNotificationStatus(logId, 'sent', undefined, supabase);
      return logId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs() });
    },
  });
}

/**
 * Mark notification as failed
 */
export function useMarkNotificationFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, errorMessage }: { logId: string; errorMessage?: string }) => {
      const supabase = getSupabaseBrowserClient();
      await updateNotificationStatus(logId, 'failed', errorMessage, supabase);
      return logId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs() });
    },
  });
}

/**
 * Quick notification helper hooks
 */
export function useNotifyTechnician() {
  const sendNotification = useSendNotification();

  return {
    ...sendNotification,
    mutateAsync: (orderId: string) =>
      sendNotification.mutateAsync({
        orderId,
        event: 'order_assigned',
        recipientType: 'technician',
      }),
  };
}

export function useNotifyCustomer() {
  const sendNotification = useSendNotification();

  return {
    ...sendNotification,
    mutateAsync: (orderId: string) =>
      sendNotification.mutateAsync({
        orderId,
        event: 'job_completed',
        recipientType: 'customer',
      }),
  };
}

export function useNotifyManager() {
  const sendNotification = useSendNotification();

  return {
    ...sendNotification,
    mutateAsync: (orderId: string) =>
      sendNotification.mutateAsync({
        orderId,
        event: 'job_completed',
        recipientType: 'manager',
      }),
  };
}
