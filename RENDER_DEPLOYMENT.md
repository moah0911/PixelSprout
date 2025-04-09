# Deploying PixelSprout to Render

This guide provides step-by-step instructions for deploying the PixelSprout application to Render.

## Prerequisites

1. A [Render account](https://render.com/)
2. Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render account
2. Click on the "New +" button and select "Blueprint" from the dropdown menu
3. Connect your Git repository that contains the PixelSprout code
4. Render will detect the `render.yaml` file automatically

### 2. Deploy the Blueprint

1. Give your Blueprint a name (e.g., "PixelSprout")
2. Choose the branch you want to deploy (e.g., "main" or "master")
3. Click "Apply Blueprint"
4. Render will automatically create:
   - A web service for the application
   - A PostgreSQL database
   - All necessary environment variables

### 3. Manual Setup (Alternative to Blueprint)

If you prefer to set up manually instead of using the Blueprint:

1. Create a PostgreSQL database:
   - Go to the Render dashboard
   - Click "New +" and select "PostgreSQL"
   - Fill in the database details (name, user)
   - Click "Create Database"
   - Save the internal connection string

2. Create a web service:
   - Click "New +" and select "Web Service"
   - Connect your repository
   - Give your service a name
   - Set the build command: `pip install -r requirements.txt`
   - Set the start command: `gunicorn --bind 0.0.0.0:$PORT main:app`
   - Add environment variables:
     - `DATABASE_URL`: [Your PostgreSQL connection string]
     - `SESSION_SECRET`: [Generate a random string]
   - Click "Create Web Service"

## Troubleshooting

If you encounter any issues:

### Database Connection Problems

- Make sure your `DATABASE_URL` environment variable is properly set
- Check that you've configured the PostgreSQL database correctly
- If needed, manually verify the connection string format

### Application Errors

- Check the Render logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure your code is properly pushed to the repository

## Additional Configuration

### Setting Up Supabase (Optional)

If you're using Supabase for authentication:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add these environment variables to your Render web service:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase service role key

### Custom Domain (Optional)

1. Go to your web service in the Render dashboard
2. Click on "Settings"
3. Scroll to "Custom Domain"
4. Follow the instructions to add and verify your domain

## Maintenance

- Render automatically deploys when you push changes to your repository
- You can monitor your application performance in the Render dashboard
- Database backups are automatically created by Render

## Support

If you need help, you can:
- Check the [Render documentation](https://render.com/docs)
- Contact the application creator at stormshots0911@gmail.com