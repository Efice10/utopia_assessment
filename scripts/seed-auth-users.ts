/**
 * Seed Auth Users Script
 *
 * This script creates Supabase Auth users and links them to the users table.
 *
 * Run with: npx tsx scripts/seed-auth-users.ts
 *
 * Prerequisites:
 * - Set SUPABASE_SERVICE_ROLE_KEY in your .env.local file
 * - The users table should already have the user records
 */

import { config } from 'dotenv';

import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const USERS_TO_CREATE = [
  { email: 'admin@sejuk.com', name: 'Admin User', role: 'admin' },
  { email: 'manager@sejuk.com', name: 'Manager User', role: 'manager' },
  { email: 'ali@sejuk.com', name: 'Ali', role: 'technician' },
  { email: 'john@sejuk.com', name: 'John', role: 'technician' },
  { email: 'bala@sejuk.com', name: 'Bala', role: 'technician' },
  { email: 'yusoff@sejuk.com', name: 'Yusoff', role: 'technician' },
];

const PASSWORD = 'password';

async function seedUsers() {
  console.log('🌱 Starting auth users seed...\n');

  for (const user of USERS_TO_CREATE) {
    console.log(`Creating: ${user.email}`);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: user.name,
        role: user.role,
      },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  ⚠️  User already exists, skipping...`);

        // Get existing user to get their ID
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const existing = existingUser.users.find(u => u.email === user.email);

        if (existing) {
          // Update users table with correct ID
          await supabase
            .from('users')
            .update({ id: existing.id })
            .eq('email', user.email);
          console.log(`  ✓ Updated users table ID`);
        }
        continue;
      }
      console.error(`  ❌ Error: ${authError.message}`);
      continue;
    }

    if (authData.user) {
      console.log(`  ✓ Auth user created with ID: ${authData.user.id}`);

      // 2. Update users table to link with auth user ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ id: authData.user.id })
        .eq('email', user.email);

      if (updateError) {
        console.error(`  ❌ Error updating users table: ${updateError.message}`);
      } else {
        console.log(`  ✓ Users table updated`);
      }
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Email: admin@sejuk.com, ali@sejuk.com, etc.');
  console.log('   Password: password');
}

seedUsers().catch(console.error);
