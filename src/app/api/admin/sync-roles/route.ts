import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all users from auth.users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Get all users from public.users
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('id, role, email');

  if (publicError) {
    return NextResponse.json({ error: publicError.message }, { status: 500 });
  }

  const results = [];

  for (const publicUser of publicUsers) {
    // Find matching auth user by email
    const authUser = authUsers.find(u => u.email === publicUser.email);

    if (!authUser) {
      results.push({
        email: publicUser.email,
        status: 'no_auth_user',
        publicId: publicUser.id
      });
      continue;
    }

    // Sync role to auth metadata (don't change IDs, just sync the role)
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { app_metadata: { role: publicUser.role } }
    );

    if (metaError) {
      results.push({
        email: publicUser.email,
        status: 'metadata_failed',
        error: metaError.message
      });
    } else {
      results.push({
        email: publicUser.email,
        status: 'success',
        role: publicUser.role,
        authId: authUser.id,
        publicId: publicUser.id,
        idsMatch: authUser.id === publicUser.id
      });
    }
  }

  return NextResponse.json({ results });
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
  const { data: publicUsers } = await supabase.from('users').select('id, email, role');

  const comparison = publicUsers?.map(pu => {
    const authUser = authUsers.find(au => au.email === pu.email);
    return {
      email: pu.email,
      role: pu.role,
      publicId: pu.id,
      authId: authUser?.id || 'NOT_FOUND',
      idsMatch: pu.id === authUser?.id,
      authRole: authUser?.app_metadata?.role || null
    };
  });

  return NextResponse.json({ comparison });
}
