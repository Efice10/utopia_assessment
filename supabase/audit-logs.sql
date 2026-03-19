-- ===========================================
-- Audit Logs Table
-- ===========================================
-- Run this in Supabase SQL Editor to create the audit logs table

-- Drop existing table
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create audit_logs table with TEXT types (more compatible with API)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
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
