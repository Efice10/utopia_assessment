-- ===========================================
-- Branch-Based Access Control Migration
-- ===========================================
-- Migration: 003
-- Description: Implements branch-based access control with RLS policies
-- Date: 2025-01
-- ===========================================

-- ===========================================
-- 1. Add is_hq column to branches table
-- ===========================================

ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_hq BOOLEAN DEFAULT FALSE;

-- Mark Shah Alam as HQ (adjust as needed)
-- UPDATE branches SET is_hq = TRUE WHERE name ILIKE '%Shah Alam%';

-- Ensure at least one branch is HQ (fallback)
UPDATE branches SET is_hq = TRUE
WHERE id = (SELECT id FROM branches ORDER BY id LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM branches WHERE is_hq = TRUE);

-- ===========================================
-- 2. Create user_branches junction table (many-to-many)
-- ===========================================

CREATE TABLE IF NOT EXISTS user_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_user_branches_user ON user_branches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_branches_branch ON user_branches(branch_id);
CREATE INDEX IF NOT EXISTS idx_user_branches_primary ON user_branches(user_id, is_primary);

-- ===========================================
-- 3. Migrate existing user-branch relationships
-- ===========================================

-- Copy existing branch_id from users to user_branches
INSERT INTO user_branches (user_id, branch_id, is_primary)
SELECT id, branch_id, TRUE
FROM users
WHERE branch_id IS NOT NULL
ON CONFLICT (user_id, branch_id) DO NOTHING;

-- Assign all admins to HQ branch (so they can access all branches)
INSERT INTO user_branches (user_id, branch_id, is_primary)
SELECT u.id, b.id, TRUE
FROM users u
CROSS JOIN (SELECT id FROM branches WHERE is_hq = TRUE LIMIT 1) b
WHERE u.role = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM user_branches ub WHERE ub.user_id = u.id
)
ON CONFLICT (user_id, branch_id) DO NOTHING;

-- ===========================================
-- 4. Helper Functions (SECURITY DEFINER to avoid recursion)
-- ===========================================

-- Get current user role from auth.users metadata (avoids RLS recursion)
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- First try to get role from auth.users metadata (fastest)
  SELECT raw_app_meta_data->>'role', email INTO user_role, user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- If we found the role, return it
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;

  -- If no role in metadata but we have email, look up in public.users by email
  -- This handles the case where auth.users.id != public.users.id
  IF user_email IS NOT NULL THEN
    SELECT role INTO user_role
    FROM public.users
    WHERE email = user_email;

    IF user_role IS NOT NULL THEN
      RETURN user_role;
    END IF;
  END IF;

  -- Default role
  RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all branch IDs the current user can access
CREATE OR REPLACE FUNCTION get_my_branches()
RETURNS UUID[] AS $$
DECLARE
  my_branches UUID[];
  is_hq_user BOOLEAN;
BEGIN
  -- Admins can access all branches
  IF get_current_user_role() = 'admin' THEN
    SELECT array_agg(id) INTO my_branches FROM branches;
    RETURN my_branches;
  END IF;

  -- Check if user is assigned to HQ
  SELECT EXISTS (
    SELECT 1 FROM user_branches ub
    JOIN branches b ON b.id = ub.branch_id AND b.is_hq = TRUE
    WHERE ub.user_id = auth.uid()
  ) INTO is_hq_user;

  -- If HQ user, return all branch IDs
  IF is_hq_user THEN
    SELECT array_agg(id) INTO my_branches FROM branches;
    RETURN my_branches;
  END IF;

  -- Otherwise, return only assigned branches
  SELECT array_agg(branch_id) INTO my_branches
  FROM user_branches
  WHERE user_id = auth.uid();

  RETURN my_branches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is assigned to HQ branch
CREATE OR REPLACE FUNCTION is_user_hq()
RETURNS BOOLEAN AS $$
DECLARE
  is_hq BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_branches ub
    JOIN branches b ON b.id = ub.branch_id AND b.is_hq = TRUE
    WHERE ub.user_id = auth.uid()
  ) INTO is_hq;

  RETURN is_hq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's primary branch
CREATE OR REPLACE FUNCTION get_primary_branch()
RETURNS UUID AS $$
DECLARE
  primary_branch UUID;
BEGIN
  SELECT branch_id INTO primary_branch
  FROM user_branches
  WHERE user_id = auth.uid() AND is_primary = TRUE
  LIMIT 1;

  RETURN primary_branch;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ===========================================
-- 5. Auto-assign branches to admins
-- ===========================================

-- Create trigger function to auto-assign new branches to all admins
CREATE OR REPLACE FUNCTION auto_assign_branch_to_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new branch is created, assign it to all admin users
  INSERT INTO user_branches (user_id, branch_id)
  SELECT u.id, NEW.id
  FROM public.users u
  WHERE u.role = 'admin'
  ON CONFLICT (user_id, branch_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on branches table
DROP TRIGGER IF EXISTS auto_assign_branch_trigger ON branches;
CREATE TRIGGER auto_assign_branch_trigger
  AFTER INSERT ON branches
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_branch_to_admins();

-- ===========================================
-- 6. Row Level Security Policies
-- ===========================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view accessible branch orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
DROP POLICY IF EXISTS "Technicians can view branch orders" ON orders;
DROP POLICY IF EXISTS "Technicians can update branch orders" ON orders;
DROP POLICY IF EXISTS "Users can view accessible branch users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view accessible branches" ON branches;
DROP POLICY IF EXISTS "Admins can insert branches" ON branches;
DROP POLICY IF EXISTS "Admins can update branches" ON branches;
DROP POLICY IF EXISTS "Admins can delete branches" ON branches;
DROP POLICY IF EXISTS "Users can view own branch assignments" ON user_branches;
DROP POLICY IF EXISTS "Admins can manage branch assignments" ON user_branches;
DROP POLICY IF EXISTS "Users can view accessible branch service records" ON service_records;
DROP POLICY IF EXISTS "Admins can manage service records" ON service_records;
DROP POLICY IF EXISTS "Users can view accessible branch notifications" ON notification_logs;

-- Orders policies
CREATE POLICY "Users can view accessible branch orders" ON orders
  FOR SELECT USING (
    branch_id = ANY(get_my_branches())
    OR branch_id IS NULL
  );

CREATE POLICY "Admins can insert orders" ON orders
  FOR INSERT WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE USING (get_current_user_role() = 'admin');

-- Users policies
CREATE POLICY "Users can view accessible branch users" ON users
  FOR SELECT USING (
    -- Can see own record by ID
    id = auth.uid()
    -- Can see own record by email (handles ID mismatch between auth.users and public.users)
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- Admins can see all
    OR get_current_user_role() = 'admin'
    -- Branch-based access
    OR branch_id = ANY(get_my_branches())
    OR branch_id IS NULL
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (get_current_user_role() = 'admin' OR id = auth.uid());

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (get_current_user_role() = 'admin');

-- Branches policies
CREATE POLICY "Users can view accessible branches" ON branches
  FOR SELECT USING (id = ANY(get_my_branches()));

CREATE POLICY "Admins can insert branches" ON branches
  FOR INSERT WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update branches" ON branches
  FOR UPDATE USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete branches" ON branches
  FOR DELETE USING (get_current_user_role() = 'admin');

-- User_branches policies
CREATE POLICY "Users can view own branch assignments" ON user_branches
  FOR SELECT USING (
    user_id = auth.uid()
    OR get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can manage branch assignments" ON user_branches
  FOR ALL USING (get_current_user_role() = 'admin');

-- Service records policies
CREATE POLICY "Users can view accessible branch service records" ON service_records
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE branch_id = ANY(get_my_branches()))
  );

CREATE POLICY "Admins can manage service records" ON service_records
  FOR ALL USING (get_current_user_role() IN ('admin', 'technician'));

-- Notification logs policies
CREATE POLICY "Users can view accessible branch notifications" ON notification_logs
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE branch_id = ANY(get_my_branches()))
    OR order_id IS NULL
  );

-- ===========================================
-- 7. Add branch_id index for orders (if not exists)
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);

-- ===========================================
-- 8. Grant permissions
-- ===========================================

GRANT SELECT ON user_branches TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_branches TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_hq TO authenticated;
GRANT EXECUTE ON FUNCTION get_primary_branch TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role TO authenticated;

-- ===========================================
-- 9. Backfill - assign all existing branches to all admins
-- ===========================================

INSERT INTO user_branches (user_id, branch_id)
SELECT u.id, b.id
FROM public.users u
CROSS JOIN branches b
WHERE u.role = 'admin'
ON CONFLICT (user_id, branch_id) DO NOTHING;
