# PRABRIX AI - Secure Administrator Provisioning Guide
**Document Version:** 1.0.0 (Phase 2B)  

---

## 1. Zero Hardcoded Admin Credentials Policy
PRABRIX AI does not contain default, hardcoded, or backdoor administrative accounts, passwords, or bypass tokens. Administrative privileges are strictly role-based and governed by the server-side `public.is_admin()` database function.

---

## 2. Secure Methods for Provisioning the Initial Admin

### Method 1: SQL Promotion via Supabase Dashboard (Recommended)
This is the safest method for promoting the platform owner or initial administrator:

1. **Register Normally:**  
   Navigate to the registration screen (`/register`) and create a standard user account with your official email address (e.g. `admin@prabrix.ai`) and verify your phone number.
2. **Execute Database Elevation Script:**  
   In the Supabase SQL Editor (or direct `psql` connection with administrative DB privileges), run the following parameterized script:

   ```sql
   -- Replace with the exact registered admin email address
   DO $$
   DECLARE
       target_email TEXT := 'admin@prabrix.ai';
       target_user_id UUID;
   BEGIN
       -- Find target user ID
       SELECT id INTO target_user_id
       FROM auth.users
       WHERE email = target_email;

       IF target_user_id IS NULL THEN
           RAISE EXCEPTION 'User with email % not found. Register the user first.', target_email;
       END IF;

       -- Promote role in public.profiles
       UPDATE public.profiles
       SET 
           role = 'admin',
           is_verified = true,
           updated_at = timezone('utc'::text, now())
       WHERE id = target_user_id;

       -- Record promotion in audit_events
       INSERT INTO public.audit_events (
           user_id,
           action,
           entity_table,
           entity_id,
           details
       ) VALUES (
           target_user_id,
           'ADMIN_ROLE_PROVISIONED',
           'profiles',
           target_user_id,
           jsonb_build_object('promoted_email', target_email, 'method', 'DIRECT_DB_PROVISIONING')
       );

       RAISE NOTICE 'User % successfully promoted to administrator.', target_email;
   END $$;
   ```

---

### Method 2: One-Time CLI Script via Service Role Key
For automated staging or CI/CD deployments where direct dashboard access is inconvenient, run the secure one-time CLI script located at `scripts/provision_admin.js`:

```powershell
# Set your environment variables in your secure terminal session (DO NOT commit these)
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJh...[Your Private Service Role Key]"

node scripts/provision_admin.js --email="admin@prabrix.ai"
```

The script connects directly using the Supabase Service Role Key (which bypasses RLS and triggers `public.is_admin()` evaluation) to promote the designated user and write a signed audit log entry.

---

## 3. Defense Against Privilege Escalation
- **RLS Guard:** The Row Level Security policy `profiles_update_own_or_admin` prevents regular authenticated users from modifying fields outside their own row.
- **Trigger Guard:** The database trigger `trg_protect_profile_privileges` intercepts any `UPDATE` on `public.profiles`. If the current session user does not satisfy `public.is_admin()`, attempting to change `role` or `is_verified` raises an immediate SQL exception:
  `Unauthorized: Only administrators can modify user roles.`
- **Backend Guard:** All administrative API routes on the Express backend (`/api/admin/*`) require the `requireAdmin` middleware, which decodes the Supabase JWT, retrieves the fresh profile from PostgreSQL, and confirms `role === 'admin'`.
