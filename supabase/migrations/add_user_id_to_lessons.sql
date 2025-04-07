-- Add user_id column to lessons table for tracking lesson ownership
-- This is necessary for the template-based lesson approach

-- Add the user_id column
ALTER TABLE public.lessons 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set appropriate comment
COMMENT ON COLUMN public.lessons.user_id IS 'The user who owns this lesson. NULL indicates a template lesson.';

-- Initially we'll set user_id to NULL for all existing lessons
-- This makes them all template lessons that any user can see
UPDATE public.lessons SET user_id = NULL;

-- Create a new RLS policy for lessons that works with the user_id column
DROP POLICY IF EXISTS "Users can view any lessons" ON public.lessons;
CREATE POLICY "Users can view template and their own lessons"
    ON public.lessons FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow users to insert lessons, but they must specify their own user_id
CREATE POLICY "Users can insert lessons for themselves"
    ON public.lessons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own lessons
CREATE POLICY "Users can update their own lessons"
    ON public.lessons FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete only their own lessons
CREATE POLICY "Users can delete their own lessons"
    ON public.lessons FOR DELETE
    USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons (user_id); 