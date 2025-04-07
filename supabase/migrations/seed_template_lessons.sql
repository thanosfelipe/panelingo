-- Seed template lessons that users can add to their collection
-- These lessons have user_id set to NULL to indicate they are templates

-- First ensure all template lessons are removed to avoid duplicates
DELETE FROM public.lessons WHERE user_id IS NULL;

-- Insert template lessons for theory content type
INSERT INTO public.lessons (
  title, 
  description, 
  content_type, 
  display_order, 
  estimated_minutes, 
  xp_reward,
  user_id
) VALUES 
(
  'Introduction to Basic Greetings', 
  'Learn the essential greetings to start any conversation confidently. This lesson covers formal and informal ways to say hello and goodbye.',
  'theory',
  1,
  10,
  10,
  NULL
),
(
  'Numbers and Counting', 
  'Master the number system and learn to count. This fundamental lesson will help you with shopping, telling time, and more.',
  'theory',
  2,
  15,
  15,
  NULL
),
(
  'Common Phrases for Travelers', 
  'Essential phrases for getting around in a foreign country. Learn how to ask for directions, order food, and handle common travel situations.',
  'theory',
  3,
  20,
  20,
  NULL
),
(
  'Family Vocabulary', 
  'Learn vocabulary related to family members and relationships. Build sentences to describe your family structure.',
  'theory',
  4,
  15,
  15,
  NULL
),
(
  'Colors and Descriptions', 
  'Learn to identify and describe colors in everyday objects. Expand your descriptive vocabulary.',
  'theory',
  5,
  12,
  12,
  NULL
);

-- Insert template lessons for practice content type
INSERT INTO public.lessons (
  title, 
  description, 
  content_type, 
  display_order, 
  estimated_minutes, 
  xp_reward,
  user_id
) VALUES 
(
  'Conversation Practice: At the Restaurant', 
  'Practice ordering food, asking about menu items, and handling payment at restaurants. Includes role-play scenarios.',
  'practice',
  6,
  25,
  25,
  NULL
),
(
  'Daily Routine Vocabulary Practice', 
  'Practice describing your daily activities from morning to night. Build fluency in talking about everyday actions.',
  'practice',
  7,
  20,
  20,
  NULL
),
(
  'Weather Expressions Practice', 
  'Practice discussing weather conditions and forecasts. Learn to understand weather reports and express preferences.',
  'practice',
  8,
  15,
  15,
  NULL
),
(
  'Shopping Dialogue Practice', 
  'Practice conversations for shopping scenarios, including asking about prices, sizes, and making purchases.',
  'practice',
  9,
  25,
  25,
  NULL
),
(
  'Directions and Navigation Practice', 
  'Practice giving and following directions. Learn to navigate in a city and understand spatial instructions.',
  'practice',
  10,
  30,
  30,
  NULL
);

-- Insert template lessons for quiz content type
INSERT INTO public.lessons (
  title, 
  description, 
  content_type, 
  display_order, 
  estimated_minutes, 
  xp_reward,
  user_id
) VALUES 
(
  'Vocabulary Quiz: Beginner Level', 
  'Test your knowledge of basic vocabulary words across various common categories. Strengthen your word recall.',
  'quiz',
  11,
  15,
  15,
  NULL
),
(
  'Grammar Quiz: Present Tense', 
  'Test your understanding of present tense verb forms and sentence structures. Cement your grammatical foundation.',
  'quiz',
  12,
  20,
  20,
  NULL
),
(
  'Listening Comprehension Quiz', 
  'Test your ability to understand spoken language in various contexts. Improve your listening skills.',
  'quiz',
  13,
  25,
  25,
  NULL
),
(
  'Phrase Match Quiz: Travel Edition', 
  'Match phrases with their meanings in this travel-themed quiz. Prepare for your next journey abroad.',
  'quiz',
  14,
  15,
  15,
  NULL
),
(
  'Reading Comprehension Quiz', 
  'Test your ability to understand written passages and answer questions about the content. Build reading fluency.',
  'quiz',
  15,
  20,
  20,
  NULL
); 