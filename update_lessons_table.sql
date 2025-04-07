-- First, add the icon column to the lessons table
ALTER TABLE public.lessons 
ADD COLUMN icon TEXT;

-- Update the template lessons with appropriate icons
UPDATE public.lessons
SET icon = CASE 
  WHEN content_type = 'theory' AND title LIKE '%Greetings%' THEN '👋'
  WHEN content_type = 'theory' AND title LIKE '%Numbers%' THEN '🔢'
  WHEN content_type = 'theory' AND title LIKE '%Phrases%' THEN '💬'
  WHEN content_type = 'theory' AND title LIKE '%Family%' THEN '👪'
  WHEN content_type = 'theory' AND title LIKE '%Colors%' THEN '🎨'
  WHEN content_type = 'practice' AND title LIKE '%Restaurant%' THEN '🍽️'
  WHEN content_type = 'practice' AND title LIKE '%Daily Routine%' THEN '⏰'
  WHEN content_type = 'practice' AND title LIKE '%Weather%' THEN '☁️'
  WHEN content_type = 'practice' AND title LIKE '%Shopping%' THEN '🛍️'
  WHEN content_type = 'practice' AND title LIKE '%Directions%' THEN '🧭'
  WHEN content_type = 'quiz' AND title LIKE '%Vocabulary%' THEN '📚'
  WHEN content_type = 'quiz' AND title LIKE '%Grammar%' THEN '📝'
  WHEN content_type = 'quiz' AND title LIKE '%Listening%' THEN '👂'
  WHEN content_type = 'quiz' AND title LIKE '%Phrase%' THEN '🗣️'
  WHEN content_type = 'quiz' AND title LIKE '%Reading%' THEN '📖'
  ELSE NULL 
END
WHERE user_id IS NULL;

-- Add some subject-specific icons for our main subjects
INSERT INTO public.lessons (title, description, content_type, estimated_minutes, xp_reward, icon, user_id, display_order)
VALUES 
('Ancient Greek', 'Learn the fundamentals of Ancient Greek language, including grammar, vocabulary, and translation techniques.', 'theory', 30, 50, '🏺', NULL, 100),
('Modern Greek', 'Master conversational Modern Greek with lessons focused on practical usage, writing, and reading.', 'theory', 25, 40, '🇬🇷', NULL, 101),
('Mathematics', 'Comprehensive mathematics lessons covering algebra, geometry, and statistics with practical examples.', 'practice', 45, 60, '📐', NULL, 102),
('History', 'Explore the rich history of Ancient Greece and the Byzantine Empire through engaging lessons.', 'theory', 35, 45, '📚', NULL, 103);

-- In case you need to copy these lessons for a specific user
-- Replace YOUR_USER_ID with the actual user ID
-- This is optional and can be run separately if needed

-- INSERT INTO public.lessons (
--   title, description, content_type, estimated_minutes, xp_reward, icon, user_id, created_at
-- )
-- SELECT 
--   title, description, content_type, estimated_minutes, xp_reward, icon, 'YOUR_USER_ID', NOW()
-- FROM 
--   public.lessons
-- WHERE 
--   title IN ('Ancient Greek', 'Modern Greek', 'Mathematics', 'History')
--   AND user_id IS NULL; 