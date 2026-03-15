/**
 * Setup Audit Logs Table
 *
 * Run with: npx tsx scripts/setup-audit-logs.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('Could not extract project ref from URL');
  process.exit(1);
}

const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const SQL = `
-- Create audit_action enum
DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create audit_entity enum
DO $$ BEGIN
  CREATE TYPE audit_entity AS ENUM ('user', 'order', 'service_record', 'branch', 'auth', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow all operations on audit_logs" ON audit_logs;
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs
  FOR ALL USING (true) with check (true);

-- Grant permissions
GRANT ALL ON audit_logs TO anon;
GRANT ALL ON audit_logs TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN scHEMA public TO authenticated;
`;

async function setupAuditLogs() {
  console.log('🔧 Setting up audit_logs table...');
  console.log(`Project: ${projectRef}`);

  try {
    const response = await fetch(managementApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        query: SQL,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to execute SQL:', error);
      return;
    }

    const result = await response.json();
    console.log('✅ audit_logs table created successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

setupAuditLogs();
