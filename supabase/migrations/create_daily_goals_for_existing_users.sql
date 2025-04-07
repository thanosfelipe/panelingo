-- This script creates daily goal records for existing users who don't already have one for today
-- Run this script to ensure all existing users have the proper initialization

-- Create a daily goal for today for all users who don't already have one
INSERT INTO public.daily_goals (
    user_id,
    goal_date,
    goal_type,
    target_value,
    actual_value,
    completed
)
SELECT 
    p.id,             -- User ID from profiles
    CURRENT_DATE,     -- Today's date
    'exercises',      -- Default goal type
    p.daily_goal,     -- Use the user's goal setting from their profile
    0,                -- Start with 0 progress
    false             -- Not completed
FROM 
    public.profiles p
WHERE 
    NOT EXISTS (
        -- Skip users who already have a daily goal for today
        SELECT 1 
        FROM public.daily_goals dg 
        WHERE dg.user_id = p.id AND dg.goal_date = CURRENT_DATE
    );

-- Output the number of daily goals created
DO $$
DECLARE
    count_created INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_created FROM daily_goals WHERE goal_date = CURRENT_DATE AND created_at > NOW() - INTERVAL '1 minute';
    RAISE NOTICE 'Created % daily goal records for existing users', count_created;
END $$; 