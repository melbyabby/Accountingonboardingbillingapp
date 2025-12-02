import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    // Get all clients from database
    // RLS policies will automatically filter to only show clients the user can access
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`Error fetching clients: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Transform data to match frontend expectations
    const transformedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      type: client.type,
      status: client.status,
      assignedTo: client.assigned_to,
      setupProgress: client.setup_progress,
      onboardedDate: client.onboarded_date,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    }));

    return c.json({ clients: transformedClients });
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

    // Insert client into database
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        type: clientData.type,
        assigned_to: clientData.assignedTo || user.id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.log(`Error creating client: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Transform data to match frontend expectations
    const transformedClient = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      type: client.type,
      status: client.status,
      assignedTo: client.assigned_to,
      setupProgress: client.setup_progress,
      onboardedDate: client.onboarded_date,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    };

    return c.json({ client: transformedClient });
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

    // Update client in database
    // RLS policies will ensure user can only update clients they have access to
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        type: updates.type,
        status: updates.status,
        assigned_to: updates.assignedTo,
        setup_progress: updates.setupProgress,
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.log(`Error updating client: ${error.message}`);
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Client not found or access denied' }, 404);
      }
      return c.json({ error: error.message }, 500);
    }

    // Transform data to match frontend expectations
    const transformedClient = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      type: client.type,
      status: client.status,
      assignedTo: client.assigned_to,
      setupProgress: client.setup_progress,
      onboardedDate: client.onboarded_date,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    };

    return c.json({ client: transformedClient });
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

    // Delete client from database
    // RLS policies will ensure user can only delete clients they created
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.log(`Error deleting client: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting client: ${error}`);
    return c.json({ error: "Failed to delete client" }, 500);
  }
});

// ==================== Onboarding Routes ====================

// Get onboarding responses for a client
app.get("/make-server-657f9657/clients/:id/onboarding", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = c.req.param('id');

    const { data: responses, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.log(`Error fetching onboarding responses: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ responses });
  } catch (error) {
    console.log(`Error fetching onboarding responses: ${error}`);
    return c.json({ error: "Failed to fetch onboarding responses" }, 500);
  }
});

// Save onboarding response
app.post("/make-server-657f9657/clients/:id/onboarding", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clientId = c.req.param('id');
    const { questionKey, answer } = await c.req.json();

    const { data, error } = await supabase
      .from('onboarding_responses')
      .upsert({
        client_id: clientId,
        question_key: questionKey,
        answer: answer,
      })
      .select()
      .single();

    if (error) {
      console.log(`Error saving onboarding response: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ response: data });
  } catch (error) {
    console.log(`Error saving onboarding response: ${error}`);
    return c.json({ error: "Failed to save onboarding response" }, 500);
  }
});

Deno.serve(app.fetch);
