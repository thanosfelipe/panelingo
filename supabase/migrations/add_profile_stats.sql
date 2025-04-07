-- Add additional profile statistics fields
ALTER TABLE public.profiles
ADD COLUMN xp_points INT DEFAULT 0 NOT NULL,
ADD COLUMN daily_streak INT DEFAULT 0 NOT NULL;

-- Update the profiles table structure if fields already exist but need modifications
DO $$
BEGIN
    -- Check if the column already exists with a different type/constraint
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'daily_streak'
    ) THEN
        -- Rename the existing column to avoid conflicts
        ALTER TABLE public.profiles 
        RENAME COLUMN daily_streak TO old_daily_streak;
        
        -- Add new column with proper constraints
        ALTER TABLE public.profiles
        ADD COLUMN daily_streak INT DEFAULT 0 NOT NULL;
        
        -- Copy data from old column to new
        UPDATE public.profiles 
        SET daily_streak = old_daily_streak;
        
        -- Drop old column
        ALTER TABLE public.profiles
        DROP COLUMN old_daily_streak;
    END IF;
    
    -- Do the same check for xp_points
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'xp_points'
    ) THEN
        ALTER TABLE public.profiles 
        RENAME COLUMN xp_points TO old_xp_points;
        
        ALTER TABLE public.profiles
        ADD COLUMN xp_points INT DEFAULT 0 NOT NULL;
        
        UPDATE public.profiles 
        SET xp_points = old_xp_points;
        
        ALTER TABLE public.profiles
        DROP COLUMN old_xp_points;
    END IF;
END
$$; 