# Supabase Integration Setup Instructions

This document outlines how to set up Supabase for the Digital Garden application.

## 1. Create a Supabase Project

1. Sign up or log in at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Name your project (e.g., "Digital Garden")
4. Choose a strong database password
5. Select the region closest to your users
6. Wait for your database to be provisioned

## 2. Configure Environment Variables

Add the following environment variables to your project:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

You can find these values in the Supabase dashboard under Project Settings > API.

## 3. Database Setup

Run the SQL commands in `supabase_setup.sql` in the Supabase SQL Editor. This script:

1. Sets up tables for users, plants, conditions, and condition types
2. Creates necessary enums
3. Establishes Row Level Security (RLS) policies
4. Creates triggers for new user registration

## 4. Authentication Setup

1. In the Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (for redirects)
3. Set minimum password length (recommended: 8)
4. Enable email confirmations if desired

## 5. Integration

The application uses:

- `supabase_auth.py` - Wrapper for Supabase authentication
- `routes_auth.py` - Flask routes for authentication
- `static/js/auth_supabase.js` - Frontend JavaScript for authentication
- `templates/login_supabase.html` - Login template
- `templates/register_supabase.html` - Registration template

## 6. Security Considerations

- The anon key is used for client-side operations with RLS restrictions
- Row Level Security policies ensure users can only access their own data
- Database triggers handle new user creation and default plant creation

## 7. Testing

1. Test registration functionality
2. Test login functionality
3. Verify water credits system works correctly
4. Ensure RLS policies prevent unauthorized access

## 8. Troubleshooting

- Check environment variables are set correctly
- Verify SQL setup was successful
- Review RLS policies if access issues occur
- Check Supabase auth settings if login problems occur