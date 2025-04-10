# PixelSprout: Digital Garden Web Application

PixelSprout is a dynamic digital garden web application that transforms your habits and care patterns into an interactive, visually engaging plant growth experience.

## Features

- Create and nurture virtual plants that grow based on your real-world habits
- Log various conditions such as focus time, water intake, and more
- Watch your plants evolve through different growth stages
- Enjoy special animations and effects for your plants
- Connect with friends and view their gardens (social features)
- Earn water credits to care for your garden
- Garden Score gamification system to track progress

## Stack

- **Backend**: Flask
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase
- **Frontend**: JavaScript, CSS, HTML
- **Visualization**: SVG animations with interactive elements
- **Styling**: Bootstrap with custom animations

## Deployment Instructions

### Prerequisites

- Python 3.11+
- Supabase account (for both authentication and database)

### Local Development Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd pixelsprout
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Supabase configuration
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_KEY=your_supabase_key
   
   # Flask secret key (optional - will be auto-generated if not provided)
   export SESSION_SECRET=your_secret_key
   ```
   
   Note: The SESSION_SECRET key will be automatically generated and stored in the `instance/secret_key` file if not provided as an environment variable. This ensures security without manual configuration.

5. Initialize the Supabase database:
   ```bash
   # Run the SQL commands in supabase_setup.sql in the Supabase SQL Editor
   # or use the Supabase CLI if you have it installed:
   # supabase db push
   ```

6. Run the application:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port main:app
   ```

7. Visit `http://localhost:5000` in your browser

### Production Deployment

For production deployment, the application is configured to work with cloud platforms like Render, Heroku, or AWS:

1. Make sure your Supabase configuration is properly set up in environment variables
2. For Render deployment, the included `render.yaml` file provides configuration
3. The SESSION_SECRET will be automatically generated if not provided as an environment variable
   - For production, it's recommended to set SESSION_SECRET manually to ensure it remains consistent across application restarts and deployments
   - If not set, a new secret key will be generated and stored in the `instance/secret_key` file

#### Database Migration

If you need to modify the database schema:

1. Update the SQL commands in `supabase_setup.sql`
2. Run the updated SQL commands in the Supabase SQL Editor
3. If using the Supabase CLI:
   ```bash
   supabase db push
   ```

#### Supabase Setup Instructions

For detailed instructions on setting up Supabase for this application:

1. See the `supabase_setup_instructions.md` file
2. Follow the SQL setup in `supabase_setup.sql`
3. Configure Row Level Security (RLS) policies as described in the setup file
4. Set up Supabase Storage buckets by running:
   ```bash
   python setup_supabase_storage.py
   ```
5. Configure Storage permissions in the Supabase dashboard:
   - Go to Storage > Policies
   - For each bucket (pixelsprout-uploads, profile-pictures, plant-images):
     - Add a policy to allow authenticated users to upload files
     - Add a policy to allow public read access to all files

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please contact the creator at stormshots0911@gmail.com