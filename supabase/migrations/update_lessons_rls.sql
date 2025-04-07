-- Drop existing RLS policies for lessons
DROP POLICY IF EXISTS "Users can view any lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can insert their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can update their own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can delete their own lessons" ON public.lessons;

-- Create updated policies for lessons
-- Allow viewing both template lessons (user_id is NULL) and user's own lessons
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