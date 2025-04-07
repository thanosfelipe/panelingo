# Template Lessons Setup Guide

This guide explains how to set up the template lessons feature in your Supabase database.

## 1. Add the user_id column to lessons table

First, open the Supabase dashboard SQL editor and run this query:

```sql
-- Add user_id column to lessons table for tracking lesson ownership
ALTER TABLE public.lessons
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set appropriate comment
COMMENT ON COLUMN public.lessons.user_id IS 'The user who owns this lesson. NULL indicates a template lesson.';

-- Initially set user_id to NULL for all existing lessons
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
```

## 2. Add template lessons

After adding the user_id column, populate your database with template lessons:

```sql
-- Seed template lessons that users can add to their collection
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
```

## 3. Verify the setup

1. Go to the Supabase Table Editor and select the `lessons` table
2. You should see 15 template lessons with `user_id` set to NULL
3. Check that the RLS policies are properly configured by going to Authentication > Policies

## 4. Test with the app

1. Go to your application and navigate to the lessons page
2. You should see available template lessons that users can add to their collection
3. When a user adds a lesson, it should create a copy with their user_id
4. Verify that users can only delete lessons from their own collection

This setup creates a template-based lesson system where admins can control the available content, and users can build their personal collection from these templates.

## Template Lessons with Multiple Field Assignments

Some lessons need to appear in multiple fields. To achieve this, we need to create separate rows in the database for each field assignment:

```sql
-- First, ensure existing 'Νεοελληνική Γλώσσα' and 'Μαθηματικά' entries are removed to avoid duplicates
DELETE FROM public.lessons
WHERE title IN ('Νεοελληνική Γλώσσα', 'Μαθηματικά');

-- Create 'Νεοελληνική Γλώσσα' for all four fields
INSERT INTO public.lessons (title, description, content_type, display_order, estimated_minutes, xp_reward, user_id, field_id)
VALUES
('Νεοελληνική Γλώσσα', 'Εισαγωγή στην Νεοελληνική Γλώσσα για τις πανελλήνιες εξετάσεις', 'theory', 1, 30, 50, NULL, 1),
('Νεοελληνική Γλώσσα', 'Εισαγωγή στην Νεοελληνική Γλώσσα για τις πανελλήνιες εξετάσεις', 'theory', 1, 30, 50, NULL, 2),
('Νεοελληνική Γλώσσα', 'Εισαγωγή στην Νεοελληνική Γλώσσα για τις πανελλήνιες εξετάσεις', 'theory', 1, 30, 50, NULL, 3),
('Νεοελληνική Γλώσσα', 'Εισαγωγή στην Νεοελληνική Γλώσσα για τις πανελλήνιες εξετάσεις', 'theory', 1, 30, 50, NULL, 4);

-- Create 'Μαθηματικά' for fields 2 and 4
INSERT INTO public.lessons (title, description, content_type, display_order, estimated_minutes, xp_reward, user_id, field_id)
VALUES
('Μαθηματικά', 'Εισαγωγή στα Μαθηματικά για τις πανελλήνιες εξετάσεις', 'theory', 2, 45, 75, NULL, 2),
('Μαθηματικά', 'Εισαγωγή στα Μαθηματικά για τις πανελλήνιες εξετάσεις', 'theory', 2, 45, 75, NULL, 4);
```

When a user adds one of these lessons to their collection, they'll only add the specific field version they selected.

### Index for Field-Based Querying

To optimize queries that filter by field_id, ensure there's an index on the field_id column:

```sql
CREATE INDEX idx_lessons_field_id ON public.lessons (field_id);
```

### Testing Field-Based Lesson Assignment

1. Check that "Νεοελληνική Γλώσσα" appears in all four field sections
2. Verify that "Μαθηματικά" only appears in fields 2 and 4
3. Test that when a user adds one of these lessons, only the specific field version is added to their collection
