-- First, add the icon column to the lessons table
ALTER TABLE public.lessons 
ADD COLUMN icon TEXT;

-- Update the existing Greek lessons with appropriate icons
UPDATE public.lessons
SET icon = CASE 
  WHEN title = 'Νεοελληνική Γλώσσα και Λογοτεχνία Γενικής Παιδείας' THEN '📚'
  WHEN title = 'Αρχαία Ελληνικά Ομάδας Προσανατολισμού' THEN '🏺'
  WHEN title = 'Ιστορία Ομάδας Προσανατολισμού' THEN '📜'
  WHEN title = 'Λατινικά Ομάδας Προσανατολισμού' THEN '🏛️'
  WHEN title = 'Φυσική Ομάδας Προσανατολισμού' THEN '⚛️'
  WHEN title = 'Χημεία Ομάδας Προσανατολισμού' THEN '🧪'
  WHEN title = 'Μαθηματικά Ομάδας Προσανατολισμού' THEN '📐'
  WHEN title = 'Φυσική Ομάδας Προσανατολισμού (Επιστήμης Υγείας και Ζωής)' THEN '🔬'
  WHEN title = 'Χημεία Ομάδας Προσανατολισμού(Επιστήμης Υγείας και Ζωής)' THEN '💊'
  WHEN title = 'Βιολογία Ομάδας Προσανατολισμού' THEN '🧬'
  WHEN title = 'Μαθηματικά Ομάδας Προσανατολισμού(ΟΙΚΟΝΟΜΙΑΣ ΚΑΙ ΠΛΗΡΟΦΟΡΙΚΗΣ)' THEN '💻'
  WHEN title = 'Πληροφορική Ομάδας Προσανατολισμού' THEN '🖥️'
  WHEN title = 'Οικονομία Ομάδας Προσανατολισμού' THEN '💰'
  WHEN title = 'Common Phrases for Travelers' THEN '✈️'
  WHEN title = 'Weather Expressions Practice' THEN '☁️'
  ELSE NULL
END
WHERE icon IS NULL;

-- If you need to directly add these lessons to a specific user
-- Replace YOUR_USER_ID with the actual user ID
-- This optional command will copy all lessons to the user's collection

-- INSERT INTO public.lessons (
--   title, description, content_type, estimated_minutes, xp_reward, icon, user_id, created_at
-- )
-- SELECT 
--   title, description, content_type, estimated_minutes, xp_reward, icon, 'YOUR_USER_ID', NOW()
-- FROM 
--   public.lessons
-- WHERE 
--   user_id IS NULL 
-- LIMIT 4; 