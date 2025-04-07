-- Add daily_goal_completed column to profiles table
ALTER TABLE public.profiles
ADD COLUMN daily_goal_completed INT DEFAULT 0;

-- Update existing profiles to have consistent data
-- For each user, set daily_goal_completed to the actual_value from today's daily_goals record if one exists
UPDATE public.profiles p
SET daily_goal_completed = dg.actual_value
FROM public.daily_goals dg
WHERE p.id = dg.user_id
AND dg.goal_date = CURRENT_DATE;

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
DROP TRIGGER IF EXISTS on_daily_goals_change ON public.daily_goals;
CREATE TRIGGER on_daily_goals_change
AFTER INSERT OR UPDATE ON public.daily_goals
FOR EACH ROW
EXECUTE FUNCTION update_profile_goal_completed(); 