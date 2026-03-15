// ===========================================
// Audit Log Types
// ===========================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import';

export type AuditEntity = 'user' | 'order' | 'service_record' | 'branch' | 'auth' | 'system';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entity_id: string | null;
  entity_name: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogInsert {
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string | null;
  entity_name?: string | null;
  description: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entity?: AuditEntity;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
