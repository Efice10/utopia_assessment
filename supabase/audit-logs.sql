-- ===========================================
-- Audit Logs Table
-- ===========================================
-- Run this in Supabase SQL Editor to create the audit logs table

-- Create audit_action enum
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'view',
  'export',
  'import'
);

-- Create audit_entity enum
CREATE TYPE audit_entity AS ENUM (
  'user',
  'order',
  'service_record',
  'branch',
  'auth',
  'system'
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  action audit_action NOT NULL,
  entity audit_entity NOT NULL,
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON audit_logs TO anon;
GRANT ALL ON audit_logs TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===========================================
-- Done! Audit logs table is ready.
-- ===========================================
