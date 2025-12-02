import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-657f9657/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== Auth Routes ====================

// Sign up new admin user
app.post("/make-server-657f9657/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// ==================== Client Routes ====================

// Get all clients
app.get("/make-server-657f9657/clients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while fetching clients: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all clients from KV store
    const clients = await kv.getByPrefix('client:');
    
    return c.json({ clients: clients || [] });
  } catch (error) {
    console.log(`Error fetching clients: ${error}`);
    return c.json({ error: "Failed to fetch clients" }, 500);
  }
});

// Add a new client
app.post("/make-server-657f9657/clients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while adding client: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientData = await c.req.json();
    
    // Generate unique client ID
    const clientId = crypto.randomUUID();
    const client = {
      id: clientId,
      ...clientData,
      onboardedDate: new Date().toISOString(),
      setupProgress: 0,
      status: 'new',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    // Store in KV
    await kv.set(`client:${clientId}`, client);

    return c.json({ client });
  } catch (error) {
    console.log(`Error creating client: ${error}`);
    return c.json({ error: "Failed to create client" }, 500);
  }
});

// Update a client
app.put("/make-server-657f9657/clients/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while updating client: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = c.req.param('id');
    const updates = await c.req.json();

    // Get existing client
    const existingClient = await kv.get(`client:${clientId}`);
    if (!existingClient) {
      return c.json({ error: 'Client not found' }, 404);
    }

    // Update client
    const updatedClient = {
      ...existingClient,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`client:${clientId}`, updatedClient);

    return c.json({ client: updatedClient });
  } catch (error) {
    console.log(`Error updating client: ${error}`);
    return c.json({ error: "Failed to update client" }, 500);
  }
});

// Delete a client
app.delete("/make-server-657f9657/clients/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while deleting client: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = c.req.param('id');
    
    await kv.del(`client:${clientId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting client: ${error}`);
    return c.json({ error: "Failed to delete client" }, 500);
  }
});

Deno.serve(app.fetch);