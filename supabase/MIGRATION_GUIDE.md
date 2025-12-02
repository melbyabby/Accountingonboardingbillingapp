# Database Migration Guide

This guide will help you migrate from the KV store to a proper relational database with Row Level Security (RLS).

## Overview

The new database schema includes:
- **clients** - Client information with comprehensive fields
- **onboarding_responses** - Stores questionnaire responses
- **documents** - Metadata for uploaded files
- **billing** - Invoice and payment tracking
- **notes** - Comments and notes about clients

All tables have **Row Level Security (RLS)** enabled with policies that ensure:
- Users can only access clients they created or are assigned to
- Related data (responses, documents, billing, notes) inherits the same access control
- Proper authorization is enforced at the database level

## Migration Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `tcmmddpcihkohnytxmeh`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the entire contents of `supabase/migrations/20251201000000_create_schema_with_rls.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute the migration

4. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see: clients, onboarding_responses, documents, billing, notes

5. **Check RLS Policies**
   - Click on any table (e.g., "clients")
   - Click on the "RLS" tab
   - You should see multiple policies listed

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to Your Project**
   ```bash
   supabase link --project-ref tcmmddpcihkohnytxmeh
   ```

4. **Run the Migration**
   ```bash
   supabase db push
   ```

## Data Migration (If you have existing data in KV store)

If you have existing client data in the `kv_store_657f9657` table, you'll need to migrate it:

```sql
-- Extract and insert clients from KV store
INSERT INTO public.clients (id, name, type, status, assigned_to, created_by, setup_progress, onboarded_date)
SELECT
  (value->>'id')::uuid,
  value->>'name',
  value->>'type',
  value->>'status',
  COALESCE((value->>'assignedTo')::uuid, (value->>'createdBy')::uuid),
  (value->>'createdBy')::uuid,
  COALESCE((value->>'setupProgress')::integer, 0),
  COALESCE((value->>'onboardedDate')::timestamptz, NOW())
FROM kv_store_657f9657
WHERE key LIKE 'client:%';
```

## Edge Function Deployment

The Edge Function has been updated to use the new tables. To deploy it:

1. **Using Supabase Dashboard**
   - Go to "Edge Functions" in your Supabase dashboard
   - Find the `make-server-657f9657` function
   - Replace the code with the updated version from `src/supabase/functions/server/index.tsx`
   - Click "Deploy"

2. **Using Supabase CLI**
   ```bash
   # Deploy the updated function
   supabase functions deploy make-server-657f9657 --project-ref tcmmddpcihkohnytxmeh
   ```

## Testing RLS Policies

After migration, test that RLS is working correctly:

1. **Test 1: Authenticated Access**
   - Log in to your app
   - Create a new client
   - Verify you can see the client in the dashboard
   - Try to access the client via API

2. **Test 2: Unauthorized Access**
   - Try to access the database directly without authentication
   - Should be denied by RLS policies

3. **Test 3: Cross-User Access**
   - Create a second user account
   - Verify they cannot see the first user's clients
   - Assign a client to the second user
   - Verify they can now see that client

## RLS Policy Details

### Clients Table Policies

1. **SELECT**: Authenticated users can read all clients (for admin dashboard)
2. **INSERT**: Users can create clients (will be assigned as creator)
3. **UPDATE**: Users can update clients they created or are assigned to
4. **DELETE**: Users can only delete clients they created

### Related Tables (onboarding_responses, documents, billing, notes)

All related tables inherit access control from the clients table:
- Users can only access data for clients they can access
- Queries automatically filter based on RLS policies

## Security Benefits

With RLS enabled, you get:

1. **Database-Level Security**: Access control enforced at the database, not just the application
2. **Defense in Depth**: Even if your application has a bug, RLS provides an additional security layer
3. **Automatic Filtering**: Queries are automatically filtered to only show authorized data
4. **Audit Trail**: User IDs are tracked for all operations
5. **Multi-tenancy**: Easy to support multiple users/organizations with data isolation

## Troubleshooting

### "Permission denied" errors
- Check that RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'clients';`
- Verify user is authenticated
- Check that the user's ID matches the policy conditions

### Tables not visible in Supabase Dashboard
- Make sure the migration ran successfully
- Check for errors in the SQL Editor
- Verify you're connected to the correct project

### Edge Function errors after migration
- Redeploy the Edge Function with updated code
- Check Edge Function logs for specific errors
- Verify table names and column names match the schema

## Rollback (If needed)

If you need to rollback the migration:

```sql
-- WARNING: This will delete all data in these tables
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.billing CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.onboarding_responses CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Next Steps

After successful migration:

1. Monitor application logs for any errors
2. Test all features thoroughly
3. Consider adding additional indexes for performance
4. Set up database backups
5. Document your RLS policies for your team

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS guide: https://supabase.com/docs/guides/auth/row-level-security
- Check Edge Functions logs in Supabase Dashboard
