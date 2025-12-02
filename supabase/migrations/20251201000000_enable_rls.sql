-- Enable Row Level Security on kv_store table
ALTER TABLE kv_store_657f9657 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own clients" ON kv_store_657f9657;
DROP POLICY IF EXISTS "Users can access shared settings" ON kv_store_657f9657;
DROP POLICY IF EXISTS "Service role has full access" ON kv_store_657f9657;

-- Policy 1: Users can only access client records they created
-- Applies to keys starting with "client:"
CREATE POLICY "Users can manage their own clients"
ON kv_store_657f9657
FOR ALL
USING (
  -- Allow access if this is a client record AND the user created it
  (key LIKE 'client:%' AND value->>'createdBy' = auth.uid()::text)
);

-- Policy 2: All authenticated users can access shared settings
-- Applies to "app:settings" key
CREATE POLICY "Users can access shared settings"
ON kv_store_657f9657
FOR ALL
USING (
  -- Allow access if this is the settings key and user is authenticated
  key = 'app:settings' AND auth.uid() IS NOT NULL
);

-- Policy 3: Service role bypass (for admin operations)
-- This allows service role to bypass RLS for administrative tasks
CREATE POLICY "Service role has full access"
ON kv_store_657f9657
FOR ALL
USING (
  auth.jwt()->>'role' = 'service_role'
);

-- Add helpful comment
COMMENT ON TABLE kv_store_657f9657 IS 'Key-value store with row-level security. Client records (client:*) are isolated by createdBy user. Settings (app:settings) are shared among all authenticated users.';
