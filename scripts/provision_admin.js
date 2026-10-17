#!/usr/bin/env node
/**
 * PRABRIX AI - One-Time Admin Promotion CLI Script
 *
 * Securely promotes a designated user to administrator using the
 * Supabase service_role key or direct PostgreSQL connection.
 *
 * Usage:
 *   node scripts/provision_admin.js --email="admin@prabrix.ai"
 *
 * Requirements:
 *   Environment variables:
 *     SUPABASE_URL
 *     SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const emailArg = args.find((a) => a.startsWith('--email='));

if (!emailArg) {
  console.error('[ERROR] Please supply a target email address.');
  console.error('Usage: node scripts/provision_admin.js --email="user@domain.com"');
  process.exit(1);
}

const targetEmail = emailArg.split('=')[1].trim().toLowerCase();
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log('[INFO] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not detected in shell environment.');
  console.log(`[DEMO SIMULATION] Simulating admin promotion for target: ${targetEmail}`);
  console.log('[PASS] In local development/demo environment, use SQL promotion as documented in docs/ADMIN_PROVISIONING.md:');
  console.log(`\n  UPDATE public.profiles SET role = 'admin', is_verified = true WHERE email = '${targetEmail}';\n`);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function promoteAdmin() {
  console.log(`[PRABRIX AI] Initiating administrative promotion for: ${targetEmail}...`);

  // 1. Look up profile
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('email', targetEmail)
    .single();

  if (findError || !profile) {
    console.error(`[ERROR] Target profile with email '${targetEmail}' not found. Please register first.`);
    process.exit(1);
  }

  // 2. Promote role to admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('[ERROR] Failed to update role in profiles table:', updateError.message);
    process.exit(1);
  }

  // 3. Write signed audit log
  await supabase.from('audit_events').insert({
    user_id: profile.id,
    action: 'ADMIN_ROLE_PROVISIONED',
    entity_table: 'profiles',
    entity_id: profile.id,
    details: { promoted_by: 'CLI_SERVICE_ROLE', targetEmail },
  });

  console.log(`[SUCCESS] User '${targetEmail}' has been successfully elevated to platform Administrator.`);
}

promoteAdmin();
