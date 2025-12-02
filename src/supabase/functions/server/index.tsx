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

    // Get all clients created by this user from database
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`Error fetching clients: ${error.message}`);
      return c.json({ error: 'Failed to fetch clients' }, 500);
    }

    return c.json({ clients: data || [] });
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

    // Create client in database
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          name: clientData.name,
          type: clientData.type,
          assigned_to: clientData.assignedTo,
          status: 'new',
          setup_progress: 0,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(`Error creating client: ${error.message}`);
      return c.json({ error: 'Failed to create client' }, 500);
    }

    return c.json({ client: data });
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
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        type: updates.type,
        assigned_to: updates.assignedTo,
        status: updates.status,
        setup_progress: updates.setupProgress,
      })
      .eq('id', clientId)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error) {
      console.log(`Error updating client: ${error.message}`);
      return c.json({ error: 'Failed to update client' }, 500);
    }

    if (!data) {
      return c.json({ error: 'Client not found' }, 404);
    }

    return c.json({ client: data });
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
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('created_by', user.id);

    if (error) {
      console.log(`Error deleting client: ${error.message}`);
      return c.json({ error: 'Failed to delete client' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting client: ${error}`);
    return c.json({ error: "Failed to delete client" }, 500);
  }
});

// ==================== Settings Routes ====================

// Get settings
app.get("/make-server-657f9657/settings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while fetching settings: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get settings from database
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'app:settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      console.log(`Error fetching settings: ${error.message}`);
      return c.json({ error: 'Failed to fetch settings' }, 500);
    }

    return c.json({ settings: data?.setting_value || null });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Save settings
app.post("/make-server-657f9657/settings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      console.log(`Authorization error while saving settings: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { settings } = await c.req.json();

    // Save settings to database
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'app:settings',
        setting_value: settings,
        updated_by: user.id,
      }, { onConflict: 'setting_key' });

    if (error) {
      console.log(`Error saving settings: ${error.message}`);
      return c.json({ error: 'Failed to save settings' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving settings: ${error}`);
    return c.json({ error: "Failed to save settings" }, 500);
  }
});

Deno.serve(app.fetch);