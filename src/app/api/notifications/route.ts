import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import {
  sendOrderNotification,
} from '@/lib/notifications/service';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NotificationTriggerEvent, RecipientType } from '@/types/notification';

/**
 * GET /api/notifications
 * Get notification logs with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {searchParams} = request.nextUrl;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const recipientType = searchParams.get('recipientType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (orderId) query = query.eq('order_id', orderId);
    if (status) query = query.eq('status', status);
    if (recipientType) query = query.eq('recipient_type', recipientType);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Notification GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Send a notification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, event, recipientType, customMessage } = body as {
      orderId: string;
      event: NotificationTriggerEvent;
      recipientType: RecipientType;
      customMessage?: string;
    };

    if (!orderId || !event || !recipientType) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, event, recipientType' },
        { status: 400 }
      );
    }

    const result = await sendOrderNotification(
      orderId,
      event,
      recipientType,
      supabase,
      customMessage
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Notification POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
