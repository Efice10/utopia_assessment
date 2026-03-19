/**
 * Client-side Audit Logger
 *
 * Use this to log audit events from client-side code.
 * Calls the /api/audit-logs endpoint.
 */

import type { AuditAction, AuditEntity } from '@/types/audit';

interface AuditLogParams {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  description: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

/**
 * Log an audit event from client-side
 */
export async function logAuditClient(params: AuditLogParams): Promise<void> {
  try {
    const response = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId,
        entity_name: params.entityName,
        description: params.description,
        old_values: params.oldValues,
        new_values: params.newValues,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Audit Client] Failed to log audit event:', {
        status: response.status,
        error: errorData,
        params,
      });
    } else {
        console.log('[Audit Client] Successfully logged:', params.action, params.entity, params.entityName);
    }
  } catch (error) {
    console.error('[Audit Client] Exception while logging:', error);
  }
}

// Convenience functions for common actions
export const auditLogClient = {
  login: (userName: string, _userEmail: string) =>
    logAuditClient({
      action: 'login',
      entity: 'auth',
      entityId: undefined,
      entityName: userName,
      description: `User "${userName}" logged in`,
    }),

  logout: (userName: string, _userEmail: string) =>
    logAuditClient({
      action: 'logout',
      entity: 'auth',
      entityId: undefined,
      entityName: userName,
      description: `User "${userName}" logged out`,
    }),

  createOrder: (orderId: string, orderNo: string, customerName: string) =>
    logAuditClient({
      action: 'create',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Created order "${orderNo}" for customer "${customerName}"`,
    }),

  updateOrder: (orderId: string, orderNo: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) =>
    logAuditClient({
      action: 'update',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Updated order "${orderNo}"`,
      oldValues,
      newValues,
    }),

  deleteOrder: (orderId: string, orderNo: string) =>
    logAuditClient({
      action: 'delete',
      entity: 'order',
      entityId: orderId,
      entityName: orderNo,
      description: `Deleted order "${orderNo}"`,
    }),

  createUser: (newUserId: string, newUserName: string, newUserEmail: string) =>
    logAuditClient({
      action: 'create',
      entity: 'user',
      entityId: newUserId,
      entityName: newUserName,
      description: `Created user "${newUserName}" (${newUserEmail})`,
    }),

  updateUser: (updatedUserId: string, updatedUserName: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) =>
    logAuditClient({
      action: 'update',
      entity: 'user',
      entityId: updatedUserId,
      entityName: updatedUserName,
      description: `Updated user "${updatedUserName}"`,
      oldValues,
      newValues,
    }),

  deleteUser: (deletedUserId: string, deletedUserName: string) =>
    logAuditClient({
      action: 'delete',
      entity: 'user',
      entityId: deletedUserId,
      entityName: deletedUserName,
      description: `Deleted user "${deletedUserName}"`,
    }),

  createBranch: (branchId: string, branchName: string) =>
    logAuditClient({
      action: 'create',
      entity: 'branch',
      entityId: branchId,
      entityName: branchName,
      description: `Created branch "${branchName}"`,
    }),

  updateBranch: (branchId: string, branchName: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) =>
    logAuditClient({
      action: 'update',
      entity: 'branch',
      entityId: branchId,
      entityName: branchName,
      description: `Updated branch "${branchName}"`,
      oldValues,
      newValues,
    }),

  deleteBranch: (branchId: string, branchName: string) =>
    logAuditClient({
      action: 'delete',
      entity: 'branch',
      entityId: branchId,
      entityName: branchName,
      description: `Deleted branch "${branchName}"`,
    }),
};
