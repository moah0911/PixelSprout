-- Supabase SQL setup for Digital Garden
-- This script creates all necessary tables, enums, and RLS policies

-- Create custom types for plant stages and types
CREATE TYPE plant_stage AS ENUM ('SEED', 'SPROUT', 'GROWING', 'MATURE', 'FLOWERING', 'WITHERING', 'DEAD');
CREATE TYPE plant_type AS ENUM ('SUCCULENT', 'FLOWER', 'TREE', 'HERB', 'VINE');

-- Create users table that extends the auth.users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    water_credits INT NOT NULL DEFAULT 20,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create plants table
CREATE TABLE IF NOT EXISTS public.plants (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    name TEXT NOT NULL,
    plant_type TEXT NOT NULL, -- Store as string version of enum for flexibility
    stage INT NOT NULL DEFAULT 0, -- 0 = SEED, 1 = SPROUT, etc.
    health FLOAT NOT NULL DEFAULT 100,
    progress FLOAT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    last_watered TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create condition_types table
CREATE TABLE IF NOT EXISTS public.condition_types (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    default_goal FLOAT,
    user_id UUID REFERENCES public.users(id), -- NULL for system defaults
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create conditions table
CREATE TABLE IF NOT EXISTS public.conditions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    type_name TEXT NOT NULL,
    value FLOAT NOT NULL,
    date_logged TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create view for full plant details
CREATE OR REPLACE VIEW plant_details AS
SELECT 
    p.*,
    u.username,
    u.email
FROM 
    plants p
JOIN 
    users u ON p.user_id = u.id;

-- Create view for full condition details
CREATE OR REPLACE VIEW condition_details AS
SELECT 
    c.*,
    u.username,
    ct.description AS condition_description,
    ct.unit
FROM 
    conditions c
JOIN 
    users u ON c.user_id = u.id
LEFT JOIN
    condition_types ct ON c.type_name = ct.name;

-- Default condition types
INSERT INTO public.condition_types (name, description, unit, default_goal, user_id)
VALUES 
    ('Water Intake', 'Amount of water consumed', 'glasses', 8, NULL),
    ('Sleep', 'Hours of sleep', 'hours', 8, NULL),
    ('Exercise', 'Time spent exercising', 'minutes', 30, NULL),
    ('Meditation', 'Time spent meditating', 'minutes', 15, NULL),
    ('Reading', 'Time spent reading', 'minutes', 30, NULL),
    ('Sunlight', 'Time spent outdoors in natural light', 'minutes', 20, NULL),
    ('Deep Work', 'Time spent in focused, deep work', 'minutes', 120, NULL)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) setup
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condition_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read and update their own data
CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Plants policies - users can only see/edit their own plants
CREATE POLICY plants_select_own ON public.plants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY plants_insert_own ON public.plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY plants_update_own ON public.plants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY plants_delete_own ON public.plants
    FOR DELETE USING (auth.uid() = user_id);

-- Conditions policies - users can only see/edit their own conditions
CREATE POLICY conditions_select_own ON public.conditions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conditions_insert_own ON public.conditions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conditions_update_own ON public.conditions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conditions_delete_own ON public.conditions
    FOR DELETE USING (auth.uid() = user_id);

-- Condition types policies - users can see all types but only edit their own
CREATE POLICY condition_types_select_all ON public.condition_types
    FOR SELECT USING (true);

CREATE POLICY condition_types_insert_own ON public.condition_types
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY condition_types_update_own ON public.condition_types
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY condition_types_delete_own ON public.condition_types
    FOR DELETE USING (auth.uid() = user_id);

-- Database triggers for user management
-- Create trigger function for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Create a new record in the users table
    INSERT INTO public.users (id, email, username, water_credits)
    VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)), 20);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger function for user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion() 
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all user data
    DELETE FROM public.conditions WHERE user_id = old.id;
    DELETE FROM public.plants WHERE user_id = old.id;
    DELETE FROM public.condition_types WHERE user_id = old.id;
    DELETE FROM public.users WHERE id = old.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Create function for water credits automatic replenishment
CREATE OR REPLACE FUNCTION public.add_water_credits()
RETURNS VOID AS $$
BEGIN
    -- Add 2 water credits to all users every hour, up to a maximum of 50
    UPDATE public.users 
    SET water_credits = LEAST(water_credits + 2, 50)
    WHERE water_credits < 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to water plant
CREATE OR REPLACE FUNCTION public.water_plant(p_user_id UUID, p_plant_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_water_credits INTEGER;
    v_plant RECORD;
    v_result JSONB;
BEGIN
    -- Check water credits
    SELECT water_credits INTO v_water_credits
    FROM public.users
    WHERE id = p_user_id;
    
    IF v_water_credits <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Not enough water credits!'
        );
    END IF;
    
    -- Check if plant exists and belongs to user
    SELECT * INTO v_plant
    FROM public.plants
    WHERE id = p_plant_id AND user_id = p_user_id;
    
    IF v_plant.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Plant not found or access denied'
        );
    END IF;
    
    -- Update water credits
    UPDATE public.users
    SET water_credits = water_credits - 1
    WHERE id = p_user_id;
    
    -- Update plant
    UPDATE public.plants
    SET 
        health = LEAST(health + 10, 100),
        progress = LEAST(progress + 5, 100),
        last_watered = now()
    WHERE id = p_plant_id;
    
    -- Create result
    SELECT jsonb_build_object(
        'success', true,
        'message', 'Plant watered successfully!',
        'water_credits', u.water_credits,
        'plant', jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'health', p.health,
            'progress', p.progress,
            'stage', p.stage,
            'type', p.plant_type,
            'last_watered', p.last_watered
        )
    ) INTO v_result
    FROM public.plants p
    JOIN public.users u ON p.user_id = u.id
    WHERE p.id = p_plant_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to apply condition effects
CREATE OR REPLACE FUNCTION public.apply_condition_effect(p_user_id UUID, p_condition_type TEXT, p_value FLOAT)
RETURNS JSONB AS $$
DECLARE
    v_effect_health FLOAT := 0;
    v_effect_progress FLOAT := 0;
    v_goal FLOAT;
    v_result JSONB;
    v_affected_plants INTEGER := 0;
BEGIN
    -- Get the default goal for this condition type
    SELECT default_goal INTO v_goal
    FROM public.condition_types
    WHERE name = p_condition_type
    AND (user_id = p_user_id OR user_id IS NULL)
    ORDER BY user_id NULLS LAST -- Prefer user-defined goals
    LIMIT 1;
    
    -- Calculate the effect based on condition type and value
    IF p_condition_type = 'Water Intake' THEN
        -- Water intake improves health
        v_effect_health := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 5
            ELSE p_value * 0.5
        END;
        v_effect_progress := v_effect_health * 0.5;
    ELSIF p_condition_type = 'Sleep' THEN
        -- Sleep improves health
        v_effect_health := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 7
            ELSE p_value * 0.8
        END;
        v_effect_progress := v_effect_health * 0.3;
    ELSIF p_condition_type = 'Exercise' THEN
        -- Exercise improves progress
        v_effect_progress := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 6
            ELSE p_value * 0.1
        END;
        v_effect_health := v_effect_progress * 0.5;
    ELSIF p_condition_type = 'Meditation' THEN
        -- Meditation improves health
        v_effect_health := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 4
            ELSE p_value * 0.2
        END;
        v_effect_progress := v_effect_health * 0.7;
    ELSIF p_condition_type = 'Reading' THEN
        -- Reading improves progress
        v_effect_progress := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 5
            ELSE p_value * 0.1
        END;
        v_effect_health := v_effect_progress * 0.3;
    ELSIF p_condition_type = 'Sunlight' THEN
        -- Sunlight improves both
        v_effect_health := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 5
            ELSE p_value * 0.2
        END;
        v_effect_progress := v_effect_health;
    ELSIF p_condition_type = 'Deep Work' THEN
        -- Deep work improves progress
        v_effect_progress := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 8
            ELSE p_value * 0.05
        END;
        v_effect_health := v_effect_progress * 0.2;
    ELSE
        -- Generic effect for custom conditions
        v_effect_health := CASE
            WHEN v_goal IS NOT NULL THEN (p_value / v_goal) * 3
            ELSE p_value * 0.1
        END;
        v_effect_progress := v_effect_health;
    END IF;
    
    -- Apply the effect to all plants of the user
    WITH updated_plants AS (
        UPDATE public.plants
        SET 
            health = LEAST(health + v_effect_health, 100),
            progress = progress + v_effect_progress,
            -- If progress reaches 100, advance stage and reset progress
            stage = CASE 
                WHEN progress + v_effect_progress >= 100 AND stage < 6 
                THEN stage + 1 
                ELSE stage 
            END,
            progress = CASE 
                WHEN progress + v_effect_progress >= 100 AND stage < 6 
                THEN 0 
                ELSE LEAST(progress + v_effect_progress, 100) 
            END
        WHERE user_id = p_user_id
        RETURNING *
    )
    SELECT COUNT(*) INTO v_affected_plants FROM updated_plants;
    
    -- Create result
    v_result := jsonb_build_object(
        'success', true,
        'message', format('Applied %s to %s plants!', p_condition_type, v_affected_plants),
        'effect_health', v_effect_health,
        'effect_progress', v_effect_progress,
        'affected_plants', v_affected_plants
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stored procedure for daily update of plants
CREATE OR REPLACE PROCEDURE public.update_plants_daily()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reduce health for plants that haven't been watered in 24 hours
    UPDATE public.plants
    SET health = GREATEST(health - 5, 0)
    WHERE now() - last_watered > INTERVAL '24 hours';
    
    -- If health drops to 0, change stage to WITHERING or DEAD
    UPDATE public.plants
    SET stage = CASE 
        WHEN stage = 5 THEN 6 -- WITHERING -> DEAD
        WHEN stage < 5 THEN 5 -- Any other stage -> WITHERING
        ELSE stage
    END
    WHERE health = 0;
    
    -- Increase progress slightly for all plants with good health
    UPDATE public.plants
    SET progress = LEAST(progress + 2, 100)
    WHERE health > 80;
    
    -- Progress plants that are ready to advance to the next stage
    UPDATE public.plants
    SET 
        stage = CASE 
            WHEN progress >= 100 AND stage < 6 
            THEN stage + 1 
            ELSE stage 
        END,
        progress = CASE 
            WHEN progress >= 100 AND stage < 6 
            THEN 0 
            ELSE progress 
        END
    WHERE progress >= 100 AND stage < 6;
END;
$$;

-- Create extension for cron jobs (requires superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add cron jobs for automatic updates (requires superuser)
-- SELECT cron.schedule('water-credits-hourly', '0 * * * *', 'SELECT public.add_water_credits()');
-- SELECT cron.schedule('plants-daily-update', '0 0 * * *', 'CALL public.update_plants_daily()');

-- Add necessary permissions for the service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO service_role;