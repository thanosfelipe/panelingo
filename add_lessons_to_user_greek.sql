-- This script adds Greek lessons to a specific user's collection
-- Replace YOUR_USER_ID with the actual user ID from the auth.users table

-- Option 1: Add specific lessons (choose the ones you want to display)
INSERT INTO public.lessons (
  title, description, content_type, estimated_minutes, xp_reward, icon, user_id, created_at
)
SELECT 
  title, description, content_type, estimated_minutes, xp_reward, icon, 'YOUR_USER_ID', NOW()
FROM 
  public.lessons
WHERE 
  title IN (
    'Νεοελληνική Γλώσσα και Λογοτεχνία Γενικής Παιδείας',
    'Αρχαία Ελληνικά Ομάδας Προσανατολισμού',
    'Ιστορία Ομάδας Προσανατολισμού',
    'Μαθηματικά Ομάδας Προσανατολισμού'
  )
  AND user_id IS NULL;

-- Option 2: Add all available lessons (uncomment to use)
-- INSERT INTO public.lessons (
--   title, description, content_type, estimated_minutes, xp_reward, icon, user_id, created_at
-- )
-- SELECT 
--   title, description, content_type, estimated_minutes, xp_reward, icon, 'YOUR_USER_ID', NOW()
-- FROM 
--   public.lessons
-- WHERE user_id IS NULL;

-- You can verify the lessons were added with this query:
-- SELECT * FROM public.lessons WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 10; 