-- Migration: Add notification_logs table
-- Description: Creates the notification_logs table for tracking WhatsApp and other notifications
-- Date: 2025-01

-- ============================================
-- Create notification_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('customer', 'technician', 'manager')),
  recipient_name VARCHAR(255),
  message TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notification_logs_order ON notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_type ON notification_logs(recipient_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at DESC);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read notification logs
CREATE POLICY "Allow read access for authenticated users" ON notification_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert notification logs
CREATE POLICY "Allow insert for authenticated users" ON notification_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update notification logs
CREATE POLICY "Allow update for authenticated users" ON notification_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Grant permissions
-- ============================================

GRANT SELECT, INSERT, UPDATE ON notification_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE notification_logs IS 'Stores logs of all notifications sent through the system';
COMMENT ON COLUMN notification_logs.order_id IS 'Reference to the related order';
COMMENT ON COLUMN notification_logs.recipient_phone IS 'Phone number of the notification recipient';
COMMENT ON COLUMN notification_logs.recipient_type IS 'Type of recipient: customer, technician, or manager';
COMMENT ON COLUMN notification_logs.recipient_name IS 'Name of the recipient for display purposes';
COMMENT ON COLUMN notification_logs.message IS 'The full message content sent';
COMMENT ON COLUMN notification_logs.channel IS 'Communication channel used: whatsapp, sms, or email';
COMMENT ON COLUMN notification_logs.status IS 'Current status of the notification: pending, sent, or failed';
COMMENT ON COLUMN notification_logs.error_message IS 'Error message if the notification failed';
COMMENT ON COLUMN notification_logs.sent_at IS 'Timestamp when the notification was successfully sent';
COMMENT ON COLUMN notification_logs.created_by IS 'User who initiated the notification';
