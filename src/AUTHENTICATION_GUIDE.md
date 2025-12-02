# Authentication & Manual Client Addition Guide

## Features Implemented

### 1. ✅ Supabase Backend Integration
- Connected to Supabase with authentication and persistent storage
- RESTful API endpoints for client management
- Row-level security through access token verification

### 2. ✅ Admin Authentication
- Sign up flow for creating new admin accounts
- Sign in flow with email/password
- Session persistence across page refreshes
- Secure sign out functionality

### 3. ✅ Manual Client Addition
- "Add Manual Client" button in Admin Dashboard
- Dialog form for entering client details (name, type, assigned to)
- Clients automatically set to "new" status with 0% setup progress
- Real-time dashboard updates after adding clients

## How to Use

### First Time Setup

1. **Switch to Admin View**
   - Click "Admin View" button in the top navigation

2. **Create Admin Account**
   - You'll see a login screen
   - Click "Don't have an account? Sign up"
   - Enter your full name, email, and password
   - Click "Create Account"

3. **Sign In**
   - After signup, enter your email and password
   - Click "Sign In"
   - You'll be redirected to the Admin Dashboard

### Adding Manual Clients

1. **From the Admin Dashboard**
   - Click the "Add Manual Client" button (top right)
   
2. **Fill in Client Details**
   - **Client Name**: Enter the client's full name or business name
   - **Client Type**: Select from Individual, Business, Trust, or Nonprofit
   - **Assigned To**: Enter the team member's name who will handle this client

3. **Submit**
   - Click "Add Client"
   - The client will be created with:
     - Status: "new"
     - Setup Progress: 0%
     - Onboarded Date: Current date

4. **View Your Clients**
   - The new client appears immediately in the dashboard table
   - Use search and filters to find specific clients
   - Click "Setup" to start the client onboarding checklist
   - Click "Billing" to configure billing and fees

## Backend API Endpoints

All endpoints require authentication via Bearer token in the Authorization header.

### POST /make-server-657f9657/signup
Create a new admin user account.
```json
{
  "email": "admin@cpafirm.com",
  "password": "securepassword",
  "name": "John Admin"
}
```

### GET /make-server-657f9657/clients
Retrieve all clients from the system.

### POST /make-server-657f9657/clients
Create a new client.
```json
{
  "name": "John Doe",
  "type": "individual",
  "assignedTo": "Emily Rodriguez"
}
```

### PUT /make-server-657f9657/clients/:id
Update an existing client.

### DELETE /make-server-657f9657/clients/:id
Delete a client from the system.

## Data Storage

- All client data is stored persistently in Supabase's key-value store
- Clients are keyed as `client:{uuid}`
- Data persists across sessions and page refreshes
- Authentication sessions are managed by Supabase Auth

## Security Notes

⚠️ **Important**: Figma Make is designed for prototyping and is not meant for collecting PII (Personally Identifiable Information) or securing highly sensitive data in production environments.

For production use, ensure:
- Use strong passwords for admin accounts
- Enable email verification in Supabase settings
- Configure proper CORS and security headers
- Implement role-based access control
- Add audit logging for sensitive operations

## Troubleshooting

### "Unauthorized" Error
- Make sure you're signed in
- Try signing out and signing back in
- Clear your browser's session storage

### Clients Not Loading
- Check the browser console for error messages
- Verify your internet connection
- Ensure the Supabase backend is running

### Can't Create Account
- Ensure all fields are filled out
- Password must meet minimum requirements
- Email must be valid format
- Check if account already exists with that email

## Next Steps

After setting up authentication and adding clients, you can:
- Navigate to client setup pages to configure onboarding checklists
- Set up billing and fee recommendations
- Integrate with Practice CS, UltraTax CS, Workpapers CS, and Liscio
- Customize the client intake forms for different client types
- Configure email templates for engagement letters and proposals
