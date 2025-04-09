-- This file contains the SQL needed to set up the Supabase database for the digital garden application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
-- Note: This table will link to the Supabase auth.users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    water_credits INTEGER DEFAULT 20 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Plant Types Enum
CREATE TYPE plant_type AS ENUM ('succulent', 'flower', 'tree', 'herb', 'vine');

-- Create Plant Stage Enum
CREATE TYPE plant_stage AS ENUM ('seed', 'sprout', 'growing', 'mature', 'flowering', 'withering', 'dead');

-- Create Plants Table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plant_type plant_type NOT NULL,
    stage INTEGER DEFAULT 0 NOT NULL,
    health FLOAT DEFAULT 100 NOT NULL,
    progress FLOAT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_watered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Condition Types Table
CREATE TABLE IF NOT EXISTS condition_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    default_goal FLOAT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Conditions Table
CREATE TABLE IF NOT EXISTS conditions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type_name TEXT NOT NULL,
    value FLOAT NOT NULL,
    date_logged TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS) policies
-- This ensures users can only access their own data

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Plants table RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY plants_select_own ON plants
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY plants_insert_own ON plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY plants_update_own ON plants
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY plants_delete_own ON plants
    FOR DELETE USING (auth.uid() = user_id);

-- Condition Types table RLS
ALTER TABLE condition_types ENABLE ROW LEVEL SECURITY;

-- Allow selecting shared condition types (where user_id is null) or own condition types
CREATE POLICY condition_types_select ON condition_types
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
    
CREATE POLICY condition_types_insert_own ON condition_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY condition_types_update_own ON condition_types
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY condition_types_delete_own ON condition_types
    FOR DELETE USING (auth.uid() = user_id);

-- Conditions table RLS
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY conditions_select_own ON conditions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY conditions_insert_own ON conditions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY conditions_update_own ON conditions
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY conditions_delete_own ON conditions
    FOR DELETE USING (auth.uid() = user_id);

-- Create default condition types
INSERT INTO condition_types (name, description, unit, default_goal, user_id)
VALUES 
('water_intake', 'Amount of water consumed during the day', 'glasses', 8, NULL),
('exercise', 'Time spent exercising', 'minutes', 30, NULL),
('sleep', 'Hours of sleep', 'hours', 8, NULL),
('meditation', 'Time spent meditating', 'minutes', 15, NULL),
('sunlight', 'Time spent outdoors in sunlight', 'minutes', 30, NULL),
('focus_time', 'Time spent focused on tasks', 'minutes', 120, NULL),
('social_interaction', 'Time spent socializing', 'minutes', 60, NULL)
ON CONFLICT (name) DO NOTHING;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to create default plants for new users
CREATE OR REPLACE FUNCTION public.create_default_plant() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.plants (user_id, name, plant_type)
  VALUES (new.id, 'My First Plant', 'succulent');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for creating default plant for new users
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_plant();