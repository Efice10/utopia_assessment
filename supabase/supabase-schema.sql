-- ===========================================
-- Sejuk Sejuk Service - Database Schema
-- ===========================================
-- Run this in Supabase SQL Editor to set up the database
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Enums
-- ===========================================

CREATE TYPE user_role AS ENUM ('admin', 'technician', 'manager');
CREATE TYPE order_status AS ENUM ('new', 'assigned', 'in_progress', 'job_done', 'reviewed', 'closed');
CREATE TYPE service_type AS ENUM ('installation', 'servicing', 'repair', 'gas_refill', 'inspection', 'others');
CREATE TYPE payment_method AS ENUM ('cash', 'online_transfer', 'card');

-- ===========================================
-- Branches Table
-- ===========================================

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Users Table
-- ===========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role user_role DEFAULT 'technician',
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- Orders Table
-- ===========================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  service_type service_type NOT NULL,
  quoted_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  status order_status DEFAULT 'new',
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ===========================================
-- Service Records Table
-- ===========================================

CREATE TABLE IF NOT EXISTS service_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  work_done TEXT NOT NULL,
  extra_charges DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  files TEXT[] DEFAULT '{}',
  remarks TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_amount DECIMAL(10, 2),
  payment_method payment_method,
  receipt_url TEXT
);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_technician ON orders(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_records_technician ON service_records(technician_id);

-- ===========================================
-- Auto-generate Order Number Function
-- ===========================================

CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR(50) AS $$
DECLARE
  today_date VARCHAR(8);
  sequence_num INTEGER;
  new_order_no VARCHAR(50);
BEGIN
  today_date := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(RIGHT(order_no, 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_no LIKE 'ORD-' || today_date || '-%';

  new_order_no := 'ORD-' || today_date || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_order_no;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order number
CREATE OR REPLACE FUNCTION set_order_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_no IS NULL OR NEW.order_no = '' THEN
    NEW.order_no := generate_order_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_no
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_no();

-- ===========================================
-- Updated_at Trigger Function
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trigger_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- Row Level Security (RLS) Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

-- For development: Allow all operations (you can restrict later)
-- In production, you would create more specific policies

CREATE POLICY "Allow all operations on branches" ON branches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on service_records" ON service_records
  FOR ALL USING (true) WITH CHECK (true);

-- ===========================================
-- Seed Data - Branches
-- ===========================================

INSERT INTO branches (name, address, phone) VALUES
  ('HQ - Shah Alam', 'No. 1, Jalan Sejuk, Shah Alam, Selangor', '03-1234567'),
  ('Branch - Petaling Jaya', 'No. 5, Jalan Dingin, PJ, Selangor', '03-2345678'),
  ('Branch - Kuala Lumpur', 'No. 10, Jalan Selesa, KL', '03-3456789');

-- ===========================================
-- Seed Data - Technicians
-- ===========================================

INSERT INTO users (email, name, phone, role, branch_id) VALUES
  ('ali@sejuk.com', 'Ali', '012-3456789', 'technician', (SELECT id FROM branches WHERE name LIKE '%Shah Alam%' LIMIT 1)),
  ('john@sejuk.com', 'John', '012-4567890', 'technician', (SELECT id FROM branches WHERE name LIKE '%Petaling Jaya%' LIMIT 1)),
  ('bala@sejuk.com', 'Bala', '012-5678901', 'technician', (SELECT id FROM branches WHERE name LIKE '%Kuala Lumpur%' LIMIT 1)),
  ('yusoff@sejuk.com', 'Yusoff', '012-6789012', 'technician', (SELECT id FROM branches WHERE name LIKE '%Shah Alam%' LIMIT 1));

-- ===========================================
-- Seed Data - Admin/Manager Users
-- ===========================================

INSERT INTO users (email, name, phone, role, branch_id) VALUES
  ('admin@sejuk.com', 'Admin User', '03-1234567', 'admin', (SELECT id FROM branches LIMIT 1)),
  ('manager@sejuk.com', 'Manager User', '03-1234568', 'manager', (SELECT id FROM branches LIMIT 1));

-- ===========================================
-- Seed Data - Sample Orders
-- ===========================================

INSERT INTO orders (customer_name, phone, address, problem_description, service_type, quoted_price, assigned_technician_id, status, created_by) VALUES
  ('Ahmad bin Abu', '019-1234567', 'No. 12, Jalan Sejuk, Shah Alam', 'Aircond not cooling properly', 'repair', 150.00, (SELECT id FROM users WHERE name = 'Ali'), 'assigned', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Siti Aminah', '019-2345678', 'No. 45, Taman Damai, PJ', 'Annual servicing required', 'servicing', 80.00, (SELECT id FROM users WHERE name = 'John'), 'new', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Tan Wei Ming', '019-3456789', 'No. 88, Condo Selesa, KL', 'Install 2 new units', 'installation', 500.00, (SELECT id FROM users WHERE name = 'Bala'), 'in_progress', (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- ===========================================
-- Grant permissions for anon key
-- ===========================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===========================================
-- Done! Your database is ready.
-- ===========================================
