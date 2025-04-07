-- Update the handle_new_user function to initialize daily_goal_completed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Create profile record with daily_goal_completed initialized to 0
    INSERT INTO public.profiles (id, daily_goal_completed)
    VALUES (new.id, 0);
    
    -- Create initial daily goal for today
    INSERT INTO public.daily_goals (
        user_id,
        goal_date,
        goal_type,
        target_value,
        actual_value,
        completed
    ) VALUES (
        new.id,
        CURRENT_DATE,
        'exercises',
        5, -- Default daily goal value
        0, -- Start with 0 progress
        false
    );
    
    RETURN new;
END;
$$; 