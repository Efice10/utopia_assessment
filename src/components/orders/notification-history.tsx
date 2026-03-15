'use client';

import { useState } from 'react';

import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useNotificationHistory,
  useSendNotification,
  useMarkNotificationSent,
} from '@/hooks/use-notifications';
import type { NotificationLog, NotificationTriggerEvent, RecipientType } from '@/types/notification';

interface NotificationHistoryProps {
  orderId: string;
  customerPhone?: string;
  technicianId?: string;
}

const eventLabels: Record<NotificationTriggerEvent, string> = {
  order_created: 'Order Created',
  order_assigned: 'Technician Assigned',
  order_started: 'Job Started',
  job_completed: 'Job Completed',
  order_reviewed: 'Order Reviewed',
  payment_received: 'Payment Received',
};

const recipientLabels: Record<RecipientType, string> = {
  customer: 'Customer',
  technician: 'Technician',
  manager: 'Manager',
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  sent: { icon: CheckCircle, color: 'text-green-500', label: 'Sent' },
  failed: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
};

function formatTime(date: string): string {
  return new Date(date).toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationHistory({
  orderId,
  customerPhone,
  technicianId,
}: NotificationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sendingType, setSendingType] = useState<RecipientType | null>(null);

  const { data: logs, isLoading } = useNotificationHistory(orderId);
  const sendNotification = useSendNotification();
  const markSent = useMarkNotificationSent();

  const handleSendNotification = async (
    event: NotificationTriggerEvent,
    recipientType: RecipientType
  ) => {
    setSendingType(recipientType);
    try {
      const result = await sendNotification.mutateAsync({
        orderId,
        event,
        recipientType,
      });

      if (result.success && result.whatsappUrl && result.logId) {
        // Open WhatsApp
        window.open(result.whatsappUrl, '_blank');
        // Mark as sent after a short delay (user initiated the send)
        setTimeout(() => {
          markSent.mutate(result.logId!);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setSendingType(null);
    }
  };

  return (
    <div className='bg-card rounded-xl border'>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors'
      >
        <div className='flex items-center gap-2'>
          <MessageSquare className='w-5 h-5 text-muted-foreground' />
          <span className='font-medium'>Notifications</span>
          {logs && logs.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {logs.length}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className='w-5 h-5 text-muted-foreground' />
        ) : (
          <ChevronDown className='w-5 h-5 text-muted-foreground' />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='border-t p-4 space-y-4'>
          {/* Quick Send Buttons */}
          <div>
            <p className='text-sm text-muted-foreground mb-2'>Send Notification</p>
            <div className='flex flex-wrap gap-2'>
              {customerPhone && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleSendNotification('job_completed', 'customer')}
                  disabled={sendingType === 'customer'}
                >
                  {sendingType === 'customer' ? (
                    <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  ) : (
                    <Send className='w-4 h-4 mr-1' />
                  )}
                  Customer
                </Button>
              )}
              {technicianId && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleSendNotification('order_assigned', 'technician')}
                  disabled={sendingType === 'technician'}
                >
                  {sendingType === 'technician' ? (
                    <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  ) : (
                    <Send className='w-4 h-4 mr-1' />
                  )}
                  Technician
                </Button>
              )}
            </div>
          </div>

          {/* History List */}
          <div>
            <p className='text-sm text-muted-foreground mb-2'>History</p>
            {isLoading ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
              </div>
            ) : logs && logs.length > 0 ? (
              <div className='space-y-2'>
                {logs.map((log) => {
                  const config = statusConfig[log.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={log.id}
                      className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm'
                    >
                      <StatusIcon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='font-medium'>
                            {recipientLabels[log.recipient_type]}
                          </span>
                          <Badge variant='outline' className='text-xs'>
                            {config.label}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground mt-1 truncate'>
                          {log.recipient_phone}
                        </p>
                        <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                          {log.message.substring(0, 100)}...
                        </p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {formatTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No notifications sent yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
