-- This script adds the main subject lessons to a specific user's collection
-- Replace YOUR_USER_ID with the actual user ID from the auth.users table

-- Copy the main subject lessons to the user's collection
INSERT INTO public.lessons (
  title, description, content_type, estimated_minutes, xp_reward, icon, user_id, created_at
)
SELECT 
  title, description, content_type, estimated_minutes, xp_reward, icon, 'YOUR_USER_ID', NOW()
FROM 
  public.lessons
WHERE 
  title IN ('Ancient Greek', 'Modern Greek', 'Mathematics', 'History')
  AND user_id IS NULL;

-- You can verify the lessons were added with this query:
-- SELECT * FROM public.lessons WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 10; 