# Row Level Security (RLS) Setup Guide

This guide explains how to enable and test Row Level Security for your application.

## What Was Changed

### 1. Database Migration (`supabase/migrations/20251201000000_enable_rls.sql`)

Added RLS policies to the `kv_store_657f9657` table:

- **Client Isolation**: Users can only access client records they created (where `value->>'createdBy' = auth.uid()`)
- **Shared Settings**: All authenticated users can access the `app:settings` key
- **Service Role Bypass**: Admin operations using service role key still have full access

### 2. KV Store Updates (`src/supabase/functions/server/kv_store.tsx`)

Modified all functions to accept an optional `accessToken` parameter:

- When `accessToken` is provided → Uses user's token (respects RLS)
- When `accessToken` is omitted → Uses service role key (bypasses RLS)

### 3. Edge Function Updates (`src/supabase/functions/server/index.tsx`)

Updated all client and settings endpoints to pass the user's access token to kv_store functions, enabling RLS enforcement.

## How to Apply the Changes

### Step 1: Apply the Database Migration

You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
# If you have Supabase CLI installed
npx supabase db push

# Or if you prefer to run it directly
npx supabase migration up
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/tcmmddpcihkohnytxmeh
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251201000000_enable_rls.sql`
4. Paste into the SQL Editor and click **Run**

### Step 2: Deploy the Updated Edge Functions

```bash
# Deploy the server function with updated code
npx supabase functions deploy server
```

### Step 3: Verify RLS is Working

Run the test script:

```bash
# Set your environment variables
export SUPABASE_URL="https://tcmmddpcihkohnytxmeh.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SERVER_URL="https://tcmmddpcihkohnytxmeh.supabase.co/functions/v1/make-server-657f9657"

# Run the tests
deno run --allow-net --allow-env test-rls.ts
```

The test will verify:
- ✅ Users can create clients
- ✅ Users can only see their own clients
- ✅ Users CANNOT see, update, or delete other users' clients
- ✅ All users can access shared settings

## Security Benefits

### Before RLS
- Security enforced only at application level
- If someone bypassed the Edge Function, they could access any data
- Direct database access = full access to all data

### After RLS
- **Defense in depth**: Security enforced at both application AND database level
- Even if Edge Function is bypassed, database blocks unauthorized access
- Direct database queries are automatically filtered by RLS policies
- Each user's JWT is used to determine what data they can access

## Understanding the RLS Policies

### Policy 1: Client Isolation
```sql
CREATE POLICY "Users can manage their own clients"
ON kv_store_657f9657
FOR ALL
USING (
  key LIKE 'client:%' AND value->>'createdBy' = auth.uid()::text
);
```

This ensures users can only access client records where they are the creator.

### Policy 2: Shared Settings
```sql
CREATE POLICY "Users can access shared settings"
ON kv_store_657f9657
FOR ALL
USING (
  key = 'app:settings' AND auth.uid() IS NOT NULL
);
```

This allows all authenticated users to read/write settings.

### Policy 3: Service Role Bypass
```sql
CREATE POLICY "Service role has full access"
ON kv_store_657f9657
FOR ALL
USING (
  auth.jwt()->>'role' = 'service_role'
);
```

This allows admin operations to continue working.

## Troubleshooting

### RLS Tests Failing?

1. **Check migration was applied**:
   ```bash
   # In Supabase SQL Editor, run:
   SELECT * FROM pg_policies WHERE tablename = 'kv_store_657f9657';
   ```
   You should see 3 policies.

2. **Verify RLS is enabled**:
   ```bash
   # In Supabase SQL Editor, run:
   SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'kv_store_657f9657';
   ```
   `relrowsecurity` should be `true`.

3. **Check Edge Function was deployed**:
   ```bash
   npx supabase functions list
   ```

### Users Can See Each Other's Data?

This means RLS is not active. Make sure:
1. The migration was applied successfully
2. The Edge Functions were redeployed with the updated code
3. Your environment has `SUPABASE_ANON_KEY` set (not just service role key)

### 403 or 404 Errors When Accessing Own Data?

Check that:
1. The client records have `createdBy` field set to the user's UUID
2. The user is properly authenticated
3. The access token is being passed correctly to kv_store functions

## Next Steps

### Consider Creating Proper Tables

For production, consider moving from a key-value store to proper tables:

```sql
-- Clients table with RLS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own clients"
ON clients FOR ALL
USING (created_by = auth.uid());
```

This provides:
- Better query performance
- Type safety
- Easier indexing
- More straightforward RLS policies
