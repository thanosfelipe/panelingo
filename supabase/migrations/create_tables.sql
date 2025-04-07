-- Ensure the table doesn't already exist
DROP TABLE IF EXISTS public.daily_goals;
DROP TABLE IF EXISTS public.user_achievements;
DROP TABLE IF EXISTS public.achievements;
DROP TABLE IF EXISTS public.user_progress;
DROP TABLE IF EXISTS public.exercises;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.profiles;

-- Create a table for user profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    daily_goal INT DEFAULT 3 NOT NULL,
    daily_goal_completed INT DEFAULT 0 NOT NULL,
    streak_count INT DEFAULT 0 NOT NULL,
    last_streak_update DATE,
    PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles can be created by the trigger function."
    ON public.profiles FOR INSERT
    USING (true);

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a table for subjects (language categories)
CREATE TABLE public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for topics within subjects
CREATE TABLE public.topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    display_order INT NOT NULL
);

-- Create index on topics for subject_id to speed up related lookups
CREATE INDEX idx_topics_subject_id ON public.topics (subject_id);

-- Create a table for lessons
CREATE TABLE public.lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT CHECK (content_type IN ('theory', 'practice', 'quiz')) NOT NULL,
    estimated_minutes INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    display_order INT,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
);

-- Create indexes on lessons for user_id and topic_id to speed up queries
CREATE INDEX idx_lessons_user_id ON public.lessons (user_id);
CREATE INDEX idx_lessons_topic_id ON public.lessons (topic_id);
CREATE INDEX idx_lessons_created_at ON public.lessons (created_at);

-- Create a table for exercises within lessons
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type TEXT CHECK (type IN ('multiple_choice', 'fill_blank', 'matching', 'speaking', 'translation')) NOT NULL,
    options JSONB,
    hints TEXT[],
    difficulty_level INT DEFAULT 1 NOT NULL,
    points INT DEFAULT 10 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    display_order INT NOT NULL
);

-- Create index on exercises for lesson_id
CREATE INDEX idx_exercises_lesson_id ON public.exercises (lesson_id);

-- Create a table for user progress
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.lessons ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.topics ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    score INT,
    attempts INT DEFAULT 0 NOT NULL,
    last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, exercise_id)
);

-- Create indexes on user_progress for efficient queries
CREATE INDEX idx_user_progress_user_id ON public.user_progress (user_id);
CREATE INDEX idx_user_progress_lesson_id ON public.user_progress (lesson_id);
CREATE INDEX idx_user_progress_exercise_id ON public.user_progress (exercise_id);
CREATE INDEX idx_user_progress_topic_id ON public.user_progress (topic_id);

-- Create a table for achievements
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    requirement_type TEXT CHECK (requirement_type IN ('streak', 'exercises', 'perfect_score', 'lessons_completed')) NOT NULL,
    requirement_value INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for user achievements
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements ON DELETE CASCADE NOT NULL,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, achievement_id)
);

-- Create index on user_achievements for user_id
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements (user_id);

-- Create a table for daily goals
CREATE TABLE public.daily_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    goal_date DATE DEFAULT CURRENT_DATE NOT NULL,
    target_exercises INT NOT NULL,
    completed_exercises INT DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    UNIQUE (user_id, goal_date)
);

-- Create index on daily_goals for user_id and goal_date
CREATE INDEX idx_daily_goals_user_id ON public.daily_goals (user_id);
CREATE INDEX idx_daily_goals_date ON public.daily_goals (goal_date);

-- Set up RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons
CREATE POLICY "Users can view any lessons"
    ON public.lessons FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own lessons"
    ON public.lessons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
    ON public.lessons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
    ON public.lessons FOR DELETE
    USING (auth.uid() = user_id);

-- Set up RLS for exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises
CREATE POLICY "Exercises are viewable by everyone"
    ON public.exercises FOR SELECT
    USING (true);

-- Set up RLS for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Set up RLS for daily_goals
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_goals
CREATE POLICY "Users can view their own daily goals"
    ON public.daily_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals"
    ON public.daily_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals"
    ON public.daily_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Set up RLS for user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- Set up RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Achievements are viewable by everyone"
    ON public.achievements FOR SELECT
    USING (true);

-- Set up RLS for subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects
CREATE POLICY "Subjects are viewable by everyone"
    ON public.subjects FOR SELECT
    USING (true);

-- Set up RLS for topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policies for topics
CREATE POLICY "Topics are viewable by everyone"
    ON public.topics FOR SELECT
    USING (true); 