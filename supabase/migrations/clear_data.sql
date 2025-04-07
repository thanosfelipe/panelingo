-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;

-- Clear all data from tables
TRUNCATE TABLE 
  public.profiles,
  public.user_progress,
  public.daily_goals,
  public.user_achievements,
  public.achievements,
  public.exercises,
  public.lessons,
  public.topics,
  public.subjects
CASCADE;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Note: To clear authenticated users, you'll need to do this through the Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Select all users
-- 3. Click "Delete selected users" 