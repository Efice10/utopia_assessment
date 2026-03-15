-- Seed data for Sejuk Sejuk Service
-- Run this in your Supabase SQL Editor

-- Insert sample users (technicians)
INSERT INTO users (id, email, name, phone, role, is_active) VALUES
  ('tech-001', 'ali@sejuk.com', 'Ali', '+60 12-345 6789', 'technician', true),
  ('tech-002', 'john@sejuk.com', 'John', '+60 13-456 7890', 'technician', true),
  ('tech-003', 'bala@sejuk.com', 'Bala', '+60 14-567 8901', 'technician', true),
  ('tech-004', 'yusoff@sejuk.com', 'Yusoff', '+60 15-678 9012', 'technician', false)
ON CONFLICT (id) DO NOTHING;

-- Insert admin user
INSERT INTO users (id, email, name, phone, role, is_active) VALUES
  ('admin-001', 'admin@sejuk.com', 'Admin User', '+60 11-234 5678', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- Insert manager user
INSERT INTO users (id, email, name, phone, role, is_active) VALUES
  ('manager-001', 'manager@sejuk.com', 'Manager User', '+60 10-123 4567', 'manager', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample branches
INSERT INTO branches (id, name, address, phone, is_active) VALUES
  ('branch-001', 'Shah Alam', 'No. 1, Jalan Sejuk, Shah Alam, Selangor', '+60 3-1234 5678', true),
  ('branch-002', 'Kuala Lumpur', 'No. 2, Jalan Sejuk, KL', '+60 3-2345 6789', true),
  ('branch-003', 'Petaling Jaya', 'No. 3, Jalan Sejuk, PJ', '+60 3-3456 7890', true),
  ('branch-004', 'Subang Jaya', 'No. 4, Jalan Sejuk, Subang', '+60 3-4567 8901', true),
  ('branch-005', 'Penang', 'No. 5, Jalan Sejuk, Penang', '+60 4-5678 9012', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (
  id,
  order_no,
  customer_name,
  phone,
  address,
  problem_description,
  service_type,
  quoted_price,
  assigned_technician_id,
  status,
  branch_id,
  created_by
) VALUES
  (
    'order-001',
    'ORD-20250101-0001',
    'Ahmad bin Abdullah',
    '+60 12-111 2222',
    'No. 12, Jalan Merdeka, Shah Alam, Selangor',
    'Aircond not cooling, need servicing and gas refill',
    'servicing',
    150.00,
    'tech-001',
    'assigned',
    'branch-001',
    'admin-001'
  ),
  (
    'order-002',
    'ORD-20250102-0002',
    'Siti Aminah',
    '+60 13-222 3333',
    'No. 45, Taman Indah, Kuala Lumpur',
    'New aircond installation for 3 units',
    'installation',
    800.00,
    'tech-002',
    'in_progress',
    'branch-002',
    'admin-001'
  ),
  (
    'order-003',
    'ORD-20250103-0003',
    'Tan Wei Ming',
    '+60 14-333 4444',
    'No. 78, Jalan Bukit, Petaling Jaya',
    'Aircond leaking water',
    'repair',
    200.00,
    'tech-003',
    'new',
    'branch-003',
    'admin-001'
  )
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
