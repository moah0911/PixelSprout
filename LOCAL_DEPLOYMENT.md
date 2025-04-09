# Running PixelSprout Locally

This guide provides detailed instructions for setting up and running the PixelSprout application on your local machine.

## Prerequisites

- Python 3.11+ installed on your system
- PostgreSQL database (optional, can use SQLite for development)
- pip (Python package manager)

## Setup Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd pixelsprout
```

### 2. Create a Virtual Environment

```bash
# On macOS/Linux
python -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory with the following contents:

```
# For development, you can use SQLite (no DATABASE_URL needed)
# For PostgreSQL, uncomment and fill in:
# DATABASE_URL=postgresql://username:password@localhost:5432/pixelsprout

# Secret key for Flask sessions
SESSION_SECRET=your_secret_key_here

# Supabase configuration (if using Supabase for auth)
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key
```

To load these variables, you can use the following Python code at the beginning of your app:

```python
# Add this to the top of app.py if needed
from dotenv import load_dotenv
load_dotenv()
```

### 5. Set Up the Database

If using PostgreSQL, create a database first:

```bash
# Using psql command line
psql -U postgres
CREATE DATABASE pixelsprout;
CREATE USER pixelsprout_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pixelsprout TO pixelsprout_user;
```

Initialize the database tables:

```bash
python setup_database.py
```

### 6. Run the Application

```bash
# Development mode
python main.py

# Or with gunicorn (production-like)
gunicorn --bind 0.0.0.0:5000 main:app
```

Visit `http://localhost:5000` in your web browser to access the application.

## Development Workflow

### Making Database Changes

1. Modify the models in `models.py`
2. Run the database setup script:
   ```bash
   python setup_database.py
   ```

### Running Tests

*Note: Add test instructions here when tests are implemented*

### Environment Setup Tips

#### Using SQLite (for development)

With our current setup, if you don't set a `DATABASE_URL`, the application will automatically use SQLite, creating a file called `pixelsprout.db` in the root directory.

#### Using PostgreSQL (recommended for production-like environment)

Make sure your PostgreSQL server is running and set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL=postgresql://pixelsprout_user:your_password@localhost:5432/pixelsprout
```

## Troubleshooting

### Common Issues

**ImportError: No module named 'flask'**
- Make sure your virtual environment is activated
- Run `pip install -r requirements.txt` again

**"SQLALCHEMY_DATABASE_URI" must be set**
- Check that your `.env` file is properly configured
- If using PostgreSQL, verify that the connection string is correct

**SQLAlchemy connection error**
- Ensure your PostgreSQL server is running
- Verify that the database credentials are correct
- Check that the database exists

**Cannot initialize Supabase**
- Verify your Supabase URL and key are correct
- Check if your Supabase project is active

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Supabase Documentation](https://supabase.io/docs/)

## Support

If you need help, contact the application creator at stormshots0911@gmail.com