/**
 * Database Types for Supabase
 *
 * To generate types from your Supabase database, run:
 * npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
 *
 * For now, we define types manually based on the PRD requirements.
 */

// ===========================================
// Enums
// ===========================================

export type UserRole = 'admin' | 'technician' | 'manager';

export type OrderStatus = 'new' | 'assigned' | 'in_progress' | 'job_done' | 'reviewed' | 'closed';

export type ServiceType = 'installation' | 'servicing' | 'repair' | 'gas_refill' | 'inspection' | 'others';

export type PaymentMethod = 'cash' | 'online_transfer' | 'card';

// ===========================================
// Database Tables
// ===========================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      service_records: {
        Row: ServiceRecord;
        Insert: ServiceRecordInsert;
        Update: ServiceRecordUpdate;
      };
      branches: {
        Row: Branch;
        Insert: BranchInsert;
        Update: BranchUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      service_type: ServiceType;
      payment_method: PaymentMethod;
    };
  };
}

// ===========================================
// User Types
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  branch_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id?: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: UserRole;
  branch_id?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  phone?: string | null;
  role?: UserRole;
  branch_id?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
}

// ===========================================
// Order Types
// ===========================================

export interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  phone: string;
  address: string;
  problem_description: string;
  service_type: ServiceType;
  quoted_price: number;
  assigned_technician_id: string | null;
  admin_notes: string | null;
  status: OrderStatus;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OrderInsert {
  id?: string;
  order_no?: string;
  customer_name: string;
  phone: string;
  address: string;
  problem_description: string;
  service_type: ServiceType;
  quoted_price: number;
  assigned_technician_id?: string | null;
  admin_notes?: string | null;
  status?: OrderStatus;
  branch_id?: string | null;
  created_by: string;
}

export interface OrderUpdate {
  customer_name?: string;
  phone?: string;
  address?: string;
  problem_description?: string;
  service_type?: ServiceType;
  quoted_price?: number;
  assigned_technician_id?: string | null;
  admin_notes?: string | null;
  status?: OrderStatus;
  branch_id?: string | null;
}

// ===========================================
// Service Record Types
// ===========================================

export interface ServiceRecord {
  id: string;
  order_id: string;
  technician_id: string;
  work_done: string;
  extra_charges: number;
  final_amount: number;
  files: string[];
  remarks: string | null;
  completed_at: string;
  created_at: string;
  payment_amount: number | null;
  payment_method: PaymentMethod | null;
  receipt_url: string | null;
}

export interface ServiceRecordInsert {
  id?: string;
  order_id: string;
  technician_id: string;
  work_done: string;
  extra_charges?: number;
  final_amount: number;
  files?: string[];
  remarks?: string | null;
  completed_at?: string;
  payment_amount?: number | null;
  payment_method?: PaymentMethod | null;
  receipt_url?: string | null;
}

export interface ServiceRecordUpdate {
  work_done?: string;
  extra_charges?: number;
  final_amount?: number;
  files?: string[];
  remarks?: string | null;
  payment_amount?: number | null;
  payment_method?: PaymentMethod | null;
  receipt_url?: string | null;
}

// ===========================================
// Branch Types
// ===========================================

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchInsert {
  id?: string;
  name: string;
  address: string;
  phone?: string | null;
  is_active?: boolean;
}

export interface BranchUpdate {
  name?: string;
  address?: string;
  phone?: string | null;
  is_active?: boolean;
}

// ===========================================
// Convenience Types
// ===========================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Order with related data
export interface OrderWithRelations extends Order {
  technician?: User | null;
  branch?: Branch | null;
  service_record?: ServiceRecord | null;
}

// Service record with related data
export interface ServiceRecordWithRelations extends ServiceRecord {
  order: Order;
  technician: User;
}
