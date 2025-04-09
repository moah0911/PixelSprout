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

- **Backend**: Flask, SQLAlchemy, PostgreSQL
- **Authentication**: Supabase
- **Frontend**: JavaScript, CSS, HTML
- **Visualization**: SVG animations with interactive elements
- **Styling**: Bootstrap with custom animations

## Deployment Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Supabase account for authentication (optional)

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
   # Database connection
   export DATABASE_URL=postgresql://username:password@localhost:5432/pixelsprout
   
   # Supabase configuration (if using Supabase)
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_KEY=your_supabase_key
   
   # Flask secret key
   export FLASK_SECRET_KEY=your_secret_key
   ```

5. Initialize the database:
   ```bash
   python setup_database.py
   ```

6. Run the application:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port main:app
   ```

7. Visit `http://localhost:5000` in your browser

### Production Deployment

For production deployment, the application is configured to work with cloud platforms like Render, Heroku, or AWS:

1. Ensure your database connection string is properly set as an environment variable
2. Make sure your Supabase configuration is properly set up in environment variables
3. For Render deployment, the included `render.yaml` file provides configuration

#### Database Migration

If you need to modify the database schema:

1. Make changes to the models in `models.py`
2. Run the database migration scripts:
   ```bash
   python setup_database.py
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please contact the creator at stormshots0911@gmail.com