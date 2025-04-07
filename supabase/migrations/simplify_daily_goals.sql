-- Simplify the daily_goals table structure
-- This migration removes unnecessary columns while preserving core functionality

-- First, disable RLS temporarily to allow modifications
ALTER TABLE public.daily_goals DISABLE ROW LEVEL SECURITY;

-- Create a backup of the current table structure before modifying
CREATE TABLE public.daily_goals_backup AS SELECT * FROM public.daily_goals;

-- Drop the existing trigger that syncs daily_goals to profiles
DROP TRIGGER IF EXISTS on_daily_goals_change ON public.daily_goals;

-- Drop the existing table
DROP TABLE public.daily_goals;

-- Recreate the table with minimal columns
CREATE TABLE public.daily_goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_date date NOT NULL,
    actual_value int DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, goal_date)
);

-- Re-enable row level security
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own goals
CREATE POLICY "Users can view their own daily goals"
    ON public.daily_goals FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to update their own goals
CREATE POLICY "Users can update their own daily goals"
    ON public.daily_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own goals
CREATE POLICY "Users can insert their own daily goals"
    ON public.daily_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Restore the data from backup, keeping only necessary columns
INSERT INTO public.daily_goals (id, user_id, goal_date, actual_value, created_at, updated_at)
SELECT id, user_id, goal_date, actual_value, created_at, updated_at
FROM public.daily_goals_backup;

-- Create a function to update daily_goal_completed when daily_goals is updated
CREATE OR REPLACE FUNCTION update_profile_goal_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profiles table when daily_goals is modified
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.profiles
        SET daily_goal_completed = NEW.actual_value
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER on_daily_goals_change
AFTER INSERT OR UPDATE ON public.daily_goals
FOR EACH ROW
EXECUTE FUNCTION update_profile_goal_completed();

-- Update the update_user_daily_progress function to work with simplified table
CREATE OR REPLACE FUNCTION update_user_daily_progress(
    user_uuid UUID,
    new_progress INT,
    goal_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if a daily goal record exists for this date
    IF EXISTS (
        SELECT 1 FROM public.daily_goals 
        WHERE user_id = user_uuid AND goal_date = update_user_daily_progress.goal_date
    ) THEN
        -- Update existing record
        UPDATE public.daily_goals
        SET 
            actual_value = new_progress,
            updated_at = NOW()
        WHERE 
            user_id = user_uuid 
            AND goal_date = update_user_daily_progress.goal_date;
    ELSE
        -- Create new record
        INSERT INTO public.daily_goals (
            user_id,
            goal_date,
            actual_value
        ) VALUES (
            user_uuid,
            update_user_daily_progress.goal_date,
            new_progress
        );
    END IF;
    
    -- Update profiles table (this will be redundant due to the trigger, but ensures consistency)
    UPDATE public.profiles
    SET daily_goal_completed = new_progress
    WHERE id = user_uuid;
    
    -- Raise notice for feedback when used in SQL console
    RAISE NOTICE 'Updated daily progress for user % to % on %', 
        user_uuid, new_progress, update_user_daily_progress.goal_date;
END;
$$;

-- Update the handle_new_user function to work with simplified table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Create profile record with daily_goal_completed initialized to 0
    INSERT INTO public.profiles (id, daily_goal_completed)
    VALUES (new.id, 0);
    
    -- Create initial daily goal for today with simplified structure
    INSERT INTO public.daily_goals (
        user_id,
        goal_date,
        actual_value
    ) VALUES (
        new.id,
        CURRENT_DATE,
        0 -- Start with 0 progress
    );
    
    RETURN new;
END;
$$;

-- Drop the backup table
DROP TABLE public.daily_goals_backup;

-- Done! The daily_goals table now has only essential columns. 