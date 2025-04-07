-- Create a function to easily update a user's daily progress
CREATE OR REPLACE FUNCTION update_user_daily_progress(
    user_uuid UUID,           -- The user's ID
    new_progress INT,         -- The new progress value
    goal_date DATE DEFAULT CURRENT_DATE  -- Optional date parameter, defaults to today
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_goal INT;
BEGIN
    -- Get the user's daily goal target
    SELECT daily_goal INTO user_goal
    FROM public.profiles
    WHERE id = user_uuid;
    
    -- Check if a daily goal record exists for this date
    IF EXISTS (
        SELECT 1 FROM public.daily_goals 
        WHERE user_id = user_uuid AND goal_date = update_user_daily_progress.goal_date
    ) THEN
        -- Update existing record
        UPDATE public.daily_goals
        SET 
            actual_value = new_progress,
            completed = (new_progress >= target_value),
            updated_at = NOW()
        WHERE 
            user_id = user_uuid 
            AND goal_date = update_user_daily_progress.goal_date;
    ELSE
        -- Create new record
        INSERT INTO public.daily_goals (
            user_id,
            goal_date,
            goal_type,
            target_value,
            actual_value,
            completed
        ) VALUES (
            user_uuid,
            update_user_daily_progress.goal_date,
            'exercises',
            user_goal,
            new_progress,
            (new_progress >= user_goal)
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

-- Example usage:
-- SELECT update_user_daily_progress('user-uuid-here', 3);
-- This would set the user's progress to 3 for today 