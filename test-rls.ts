#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * RLS Test Script
 *
 * This script tests that Row Level Security is working correctly.
 * It creates two test users, tests client isolation, and verifies settings access.
 *
 * Usage:
 *   SUPABASE_URL=your-url SUPABASE_ANON_KEY=your-key deno run --allow-net --allow-env test-rls.ts
 */

const SERVER_URL = Deno.env.get('SERVER_URL') || 'http://localhost:8000/make-server-657f9657';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  Deno.exit(1);
}

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestUser {
  email: string;
  password: string;
  accessToken?: string;
  userId?: string;
}

const testUsers: [TestUser, TestUser] = [
  { email: `test-user-1-${Date.now()}@example.com`, password: 'TestPassword123!' },
  { email: `test-user-2-${Date.now()}@example.com`, password: 'TestPassword123!' },
];

let testClientId: string | null = null;

console.log('🧪 Starting RLS Tests\n');

// Helper function to make authenticated requests
async function apiRequest(endpoint: string, options: RequestInit, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();
  return { response, data };
}

// Test 1: Create two test users
console.log('📝 Test 1: Creating two test users...');
try {
  for (const [index, user] of testUsers.entries()) {
    const { response, data } = await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        name: `Test User ${index + 1}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user ${index + 1}: ${JSON.stringify(data)}`);
    }

    user.userId = data.user.id;

    // Sign in to get access token
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error || !authData.session) {
      throw new Error(`Failed to sign in user ${index + 1}: ${error?.message}`);
    }

    user.accessToken = authData.session.access_token;
    console.log(`   ✅ Created and signed in user ${index + 1}: ${user.email}`);
  }
  console.log('✅ Test 1 passed\n');
} catch (error) {
  console.error('❌ Test 1 failed:', error.message);
  Deno.exit(1);
}

// Test 2: User 1 creates a client
console.log('📝 Test 2: User 1 creates a client...');
try {
  const { response, data } = await apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify({
      businessName: 'RLS Test Client',
      contactName: 'John Doe',
      email: 'john@example.com',
    }),
  }, testUsers[0].accessToken);

  if (!response.ok) {
    throw new Error(`Failed to create client: ${JSON.stringify(data)}`);
  }

  testClientId = data.client.id;
  console.log(`   ✅ Client created with ID: ${testClientId}`);
  console.log(`   ✅ Client createdBy: ${data.client.createdBy}`);
  console.log('✅ Test 2 passed\n');
} catch (error) {
  console.error('❌ Test 2 failed:', error.message);
  Deno.exit(1);
}

// Test 3: User 1 can read their own client
console.log('📝 Test 3: User 1 can read their own client...');
try {
  const { response, data } = await apiRequest('/clients', {
    method: 'GET',
  }, testUsers[0].accessToken);

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${JSON.stringify(data)}`);
  }

  const foundClient = data.clients.find((c: any) => c.id === testClientId);
  if (!foundClient) {
    throw new Error('User 1 cannot see their own client!');
  }

  console.log(`   ✅ User 1 can see their client`);
  console.log(`   ✅ Found ${data.clients.length} client(s)`);
  console.log('✅ Test 3 passed\n');
} catch (error) {
  console.error('❌ Test 3 failed:', error.message);
  Deno.exit(1);
}

// Test 4: User 2 CANNOT read User 1's client (RLS enforcement)
console.log('📝 Test 4: User 2 CANNOT read User 1\'s client (RLS enforcement)...');
try {
  const { response, data } = await apiRequest('/clients', {
    method: 'GET',
  }, testUsers[1].accessToken);

  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${JSON.stringify(data)}`);
  }

  const foundClient = data.clients.find((c: any) => c.id === testClientId);
  if (foundClient) {
    throw new Error('⚠️  SECURITY ISSUE: User 2 can see User 1\'s client! RLS is NOT working!');
  }

  console.log(`   ✅ User 2 cannot see User 1's client`);
  console.log(`   ✅ User 2 sees ${data.clients.length} client(s) (should be 0)`);
  console.log('✅ Test 4 passed - RLS is working!\n');
} catch (error) {
  console.error('❌ Test 4 failed:', error.message);
  Deno.exit(1);
}

// Test 5: User 2 CANNOT update User 1's client
console.log('📝 Test 5: User 2 CANNOT update User 1\'s client...');
try {
  const { response, data } = await apiRequest(`/clients/${testClientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      businessName: 'Hacked by User 2',
    }),
  }, testUsers[1].accessToken);

  if (response.ok) {
    throw new Error('⚠️  SECURITY ISSUE: User 2 can update User 1\'s client! RLS is NOT working!');
  }

  if (response.status !== 404) {
    console.log(`   ⚠️  Expected 404, got ${response.status}`);
  }

  console.log(`   ✅ User 2 cannot update User 1's client (got ${response.status})`);
  console.log('✅ Test 5 passed - RLS is working!\n');
} catch (error) {
  console.error('❌ Test 5 failed:', error.message);
  Deno.exit(1);
}

// Test 6: User 2 CANNOT delete User 1's client
console.log('📝 Test 6: User 2 CANNOT delete User 1\'s client...');
try {
  const { response, data } = await apiRequest(`/clients/${testClientId}`, {
    method: 'DELETE',
  }, testUsers[1].accessToken);

  if (response.ok) {
    throw new Error('⚠️  SECURITY ISSUE: User 2 can delete User 1\'s client! RLS is NOT working!');
  }

  console.log(`   ✅ User 2 cannot delete User 1's client (got ${response.status})`);
  console.log('✅ Test 6 passed - RLS is working!\n');
} catch (error) {
  console.error('❌ Test 6 failed:', error.message);
  Deno.exit(1);
}

// Test 7: Both users can access shared settings
console.log('📝 Test 7: Both users can access shared settings...');
try {
  // User 1 saves settings
  const { response: saveResponse, data: saveData } = await apiRequest('/settings', {
    method: 'POST',
    body: JSON.stringify({
      settings: {
        companyName: 'Test Company',
        theme: 'dark',
      },
    }),
  }, testUsers[0].accessToken);

  if (!saveResponse.ok) {
    throw new Error(`User 1 failed to save settings: ${JSON.stringify(saveData)}`);
  }

  console.log(`   ✅ User 1 saved settings`);

  // User 2 reads settings
  const { response: getResponse, data: getData } = await apiRequest('/settings', {
    method: 'GET',
  }, testUsers[1].accessToken);

  if (!getResponse.ok) {
    throw new Error(`User 2 failed to read settings: ${JSON.stringify(getData)}`);
  }

  if (!getData.settings || getData.settings.companyName !== 'Test Company') {
    throw new Error('User 2 cannot see the settings saved by User 1');
  }

  console.log(`   ✅ User 2 can read settings saved by User 1`);
  console.log('✅ Test 7 passed - Shared settings work!\n');
} catch (error) {
  console.error('❌ Test 7 failed:', error.message);
  Deno.exit(1);
}

// Cleanup
console.log('🧹 Cleaning up test data...');
try {
  // Delete the test client as User 1
  if (testClientId) {
    await apiRequest(`/clients/${testClientId}`, {
      method: 'DELETE',
    }, testUsers[0].accessToken);
    console.log('   ✅ Deleted test client');
  }

  // Delete test users (requires admin/service role)
  // Note: This would need to be done via Supabase admin API
  console.log('   ℹ️  Test users will auto-cleanup or can be removed manually from Supabase dashboard');
  console.log('✅ Cleanup complete\n');
} catch (error) {
  console.warn('⚠️  Cleanup warning:', error.message);
}

console.log('🎉 All RLS tests passed successfully!\n');
console.log('Summary:');
console.log('  ✅ User isolation working - users can only see their own clients');
console.log('  ✅ Shared settings working - all users can access common settings');
console.log('  ✅ Row Level Security is properly configured and enforced\n');
