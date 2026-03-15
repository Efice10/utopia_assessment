-- ===========================================
-- Migration: Add Notification Logs Table
-- ===========================================
-- Run this in Supabase SQL Editor if you already
-- have an existing database without notification_logs
-- ===========================================

-- Create notification enums
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'sms', 'email');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE recipient_type AS ENUM ('customer', 'technician', 'manager');

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(50) NOT NULL,
  recipient_type recipient_type NOT NULL,
  recipient_name VARCHAR(255),
  message TEXT NOT NULL,
  channel notification_channel DEFAULT 'whatsapp',
  status notification_status DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_order ON notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on notification_logs" ON notification_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON notification_logs TO anon;
GRANT ALL ON notification_logs TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
