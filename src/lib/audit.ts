/**
 * Audit Logger Utility
 *
 * Use this to log audit events from server-side code (API routes, server actions)
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuditLogInsert, AuditAction, AuditEntity } from '@/types/audit';

interface AuditLogParams {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  description: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * Log an audit event
 * Call this from server-side code
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user if not provided
    let {userId} = params;
    let {userName} = params;
    let {userEmail} = params;

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email;
        userName = user.user_metadata?.name;
      }
    }

    const logEntry: AuditLogInsert = {
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId,
      entity_name: params.entityName,
      description: params.description,
      old_values: params.oldValues,
      new_values: params.newValues,
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert(logEntry);

    if (error) {
      console.error('[Audit] Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('[Audit] Exception while logging:', error);
  }
}

// Convenience functions for common actions
export const auditLog = {
  login: (userId: string, userName: string, userEmail: string) =>
    logAudit({
      action: 'login',
      entity: 'auth',
      entityId: userId,
      entityName: userName,
      description: `User "${userName}" logged in`,
      userId,
      userName,
      userEmail,
    }),

  logout: (userId: string, userName: string, userEmail: string) =>
    logAudit({
      action: 'logout',
      entity: 'auth',
      entityId: userId,
      entityName: userName,
      description: `User "${userName}" logged out`,
      userId,
      userName,
      userEmail,
    }),

  createOrder: (orderId: string, orderNo: string, customerName: string, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'create',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Created order "${orderNo}" for customer "${customerName}"`,
      userId,
      userName,
      userEmail,
    }),

  updateOrder: (orderId: string, orderNo: string, oldValues: Record<string, unknown>, newValues: Record<string, unknown>, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'update',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Updated order "${orderNo}"`,
      oldValues,
      newValues,
      userId,
      userName,
      userEmail,
    }),

  deleteOrder: (orderId: string, orderNo: string, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'delete',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Deleted order "${orderNo}"`,
      userId,
      userName,
      userEmail,
    }),

  createUser: (newUserId: string, newUserName: string, newUserEmail: string, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'create',
      entity: 'user',
      entityId: newUserId,
      entityName: newUserName,
      description: `Created user "${newUserName}" (${newUserEmail})`,
      userId,
      userName,
      userEmail,
    }),

  updateUser: (updatedUserId: string, updatedUserName: string, oldValues: Record<string, unknown>, newValues: Record<string, unknown>, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'update',
      entity: 'user',
      entityId: updatedUserId,
      entityName: updatedUserName,
      description: `Updated user "${updatedUserName}"`,
      oldValues,
      newValues,
      userId,
      userName,
      userEmail,
    }),

  deleteUser: (deletedUserId: string, deletedUserName: string, userId?: string, userName?: string, userEmail?: string) =>
    logAudit({
      action: 'delete',
      entity: 'user',
      entityId: deletedUserId,
      entityName: deletedUserName,
      description: `Deleted user "${deletedUserName}"`,
      userId,
      userName,
      userEmail,
    }),
};
