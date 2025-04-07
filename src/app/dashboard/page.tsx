'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Book, Clock, Award, Plus } from 'lucide-react';

type UserStats = {
  username: string | null;
  daily_streak: number;
  xp_points: number;
  daily_goal: number;
  daily_progress: number;
  topics_mastered: number;
  total_topics: number;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content_type: 'theory' | 'practice' | 'quiz';
  icon: string | null;
  estimated_minutes: number | null;
  xp_reward: number | null;
  created_at: string;
  progress: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    username: null,
    daily_streak: 0,
    xp_points: 0,
    daily_goal: 5,
    daily_progress: 0,
    topics_mastered: 0,
    total_topics: 48 // Temporary hardcoded total - would come from a count of topics
  });
  const [userLessons, setUserLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState<number>(5);
  const goalInputRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Fetch user data and stats
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, daily_streak, xp_points, daily_goal, daily_goal_completed')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile?.username) {
          // Redirect to onboarding if no username is set
          router.push('/onboarding');
          return;
        }

        // Get count of "mastered" topics (this is simplified - define your own criteria)
        const { count: masteredTopics } = await supabase
          .from('user_progress')
          .select('lesson_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        // Fetch user's 4 latest lessons
        const { data: latestLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        if (lessonsError) throw lessonsError;

        setUserStats({
          username: profile.username,
          daily_streak: profile.daily_streak,
          xp_points: profile.xp_points,
          daily_goal: profile.daily_goal,
          daily_progress: profile.daily_goal_completed || 0,
          topics_mastered: masteredTopics || 0,
          total_topics: 48 // Would normally come from count of all topics
        });

        // Transform the lessons data to include a random progress value
        // In a real app, you would fetch the actual progress from user_progress table
        const lessonsWithProgress = latestLessons?.map(lesson => ({
          ...lesson,
          progress: Math.floor(Math.random() * 100) // Temporary random progress
        })) || [];

        setUserLessons(lessonsWithProgress);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  useEffect(() => {
    if (isEditingGoal && goalInputRef.current) {
      goalInputRef.current.focus();
    }
  }, [isEditingGoal]);

  const handleEditGoal = () => {
    setNewGoalValue(userStats.daily_goal);
    setIsEditingGoal(true);
  };

  const handleSaveGoal = async () => {
    if (newGoalValue < 1) {
      // Prevent setting goal to less than 1
      setNewGoalValue(1);
      return;
    }

    if (!user) return;

    setUpdating(true);
    try {
      // Update the user's daily goal in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ daily_goal: newGoalValue })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUserStats(prev => ({
        ...prev,
        daily_goal: newGoalValue
      }));
      
      // Exit edit mode
      setIsEditingGoal(false);
    } catch (error) {
      console.error('Error updating daily goal:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveGoal();
    } else if (e.key === 'Escape') {
      setIsEditingGoal(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <Book className="h-5 w-5 text-blue-400" />;
      case 'practice':
        return <Clock className="h-5 w-5 text-green-400" />;
      case 'quiz':
        return <Award className="h-5 w-5 text-purple-400" />;
      default:
        return <Book className="h-5 w-5 text-blue-400" />;
    }
  };

  if (!user || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  // Calculate the percentage for the progress bar
  const goalPercentage = userStats.daily_goal > 0 
    ? Math.min(100, (userStats.daily_progress / userStats.daily_goal) * 100) 
    : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Welcome, {userStats.username}
              </h1>
              <p className="mt-2 text-gray-400">
                Ready to continue your learning journey?
              </p>
            </div>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 py-2 px-4"
              onClick={() => router.push('/lessons')}
            >
              My Lessons
            </Button>
          </div>

          {/* Streak and Progress Section */}
          <div className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-500/10 rounded-full">
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">Daily Streak</h3>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      {userStats.daily_streak} Days
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <span className="text-3xl">⭐️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">XP Points</h3>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      {userStats.xp_points.toLocaleString()} XP
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-500/10 rounded-full">
                    <span className="text-3xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">Topics Mastered</h3>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      {userStats.topics_mastered} / {userStats.total_topics}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal Section */}
          <div className="mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-lg relative overflow-hidden group">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-100">Daily Goal</h2>
                </div>
                
                {isEditingGoal ? (
                  <div 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      className="h-7 w-7 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 flex items-center justify-center text-white"
                      onClick={() => setNewGoalValue(prev => Math.max(1, prev - 1))}
                    >
                      <span className="text-xs">-</span>
                    </button>
                    
                    <Input
                      ref={goalInputRef}
                      type="number"
                      min="1"
                      value={newGoalValue}
                      onChange={(e) => setNewGoalValue(parseInt(e.target.value) || 1)}
                      onKeyDown={handleKeyDown}
                      className="w-14 h-8 text-center bg-gray-700/70 border-gray-600 text-indigo-300 text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    
                    <button
                      className="h-7 w-7 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 flex items-center justify-center text-white"
                      onClick={() => setNewGoalValue(prev => prev + 1)}
                    >
                      <span className="text-xs">+</span>
                    </button>
                    
                    <Button 
                      onClick={handleSaveGoal}
                      disabled={updating}
                      size="sm"
                      className="h-8 ml-2 bg-indigo-500 hover:bg-indigo-600 text-xs font-medium"
                    >
                      {updating ? (
                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1" />
                      ) : (
                        <span className="mr-1">✓</span>
                      )}
                      Save
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={handleEditGoal}
                  >
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {userStats.daily_progress}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-lg font-medium text-gray-300">
                        {userStats.daily_goal}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">exercises</span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGoal();
                        }}
                        className="ml-2 h-6 w-6 rounded-full bg-gray-700/70 hover:bg-indigo-500/30 flex items-center justify-center transition-colors"
                      >
                        <span className="text-xs text-indigo-300">✎</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <Progress 
                  value={goalPercentage} 
                  className="h-3 bg-gray-700/70 rounded-full overflow-hidden"
                  indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                />
                
                {goalPercentage > 0 && goalPercentage < 100 && (
                  <div 
                    className="absolute top-0 left-0 h-full w-1 bg-white/20 rounded-full"
                    style={{ 
                      left: `calc(${goalPercentage}% - 2px)`,
                      opacity: goalPercentage > 95 ? 0 : 1
                    }}
                  />
                )}
                
                <div className="mt-2 flex justify-between">
                  <p className="text-xs text-gray-500">Daily Progress</p>
                  {goalPercentage === 100 && (
                    <p className="text-xs font-medium text-indigo-400">Goal Completed!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Latest Lessons Heading */}
          <div className="mb-6 mt-12 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Latest Lessons
            </h2>
            
            {/* Add Lessons Button - Only show if there are 4 or more lessons */}
            {userLessons.length >= 4 && (
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md"
                size="sm"
                onClick={() => {
                  // Set a flag in localStorage to indicate we want to open the add lessons view
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('openAddLessons', 'true');
                  }
                  router.push('/lessons');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lessons
              </Button>
            )}
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {userLessons.length === 0 ? (
              <div className="col-span-full rounded-lg border border-gray-700 bg-gray-800/30 p-8 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">No lessons yet</h3>
                <p className="text-gray-400 mb-6">Add some lessons to get started</p>
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={() => {
                    // Set a flag in localStorage to indicate we want to open the add lessons view
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('openAddLessons', 'true');
                    }
                    router.push('/lessons');
                  }}
                >
                  Browse Lessons
                </Button>
              </div>
            ) : (
              <>
                {userLessons.map((lesson) => (
                  <Card 
                    key={lesson.id}
                    className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors group"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gray-700/70 rounded-full">
                            {lesson.icon ? (
                              <span className="text-3xl">{lesson.icon}</span>
                            ) : (
                              getContentTypeIcon(lesson.content_type)
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-400 uppercase">
                            {lesson.content_type}
                          </span>
                        </div>
                        <Progress 
                          value={lesson.progress} 
                          className="w-16 h-2 bg-gray-700" 
                          indicatorClassName="bg-gradient-to-r from-indigo-400 to-purple-400" 
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-1">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        {lesson.estimated_minutes && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {lesson.estimated_minutes} min
                          </div>
                        )}
                        {lesson.xp_reward && (
                          <div className="flex items-center text-xs text-amber-500">
                            <Award className="h-4 w-4 mr-1" />
                            {lesson.xp_reward} XP
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        onClick={() => {
                          // Store referrer before navigation
                          try {
                            localStorage.setItem('lessonReferrer', '/dashboard');
                            console.log('Set referrer to /dashboard');
                          } catch (error) {
                            console.error('Failed to set localStorage referrer:', error);
                          }
                          router.push(`/lessons/${lesson.id}`);
                        }}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Add Lesson Card - Only show if there are lessons but fewer than 4 */}
                {userLessons.length > 0 && userLessons.length < 4 && (
                  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 border-dashed hover:border-indigo-500/50 transition-colors group">
                    <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                      <div className="p-4 mb-4 rounded-full bg-gray-700/30 border border-gray-700 border-dashed">
                        <Plus className="h-8 w-8 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-6">
                        Add More Lessons
                      </h3>
                      <Button 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        onClick={() => {
                          // Set a flag in localStorage to indicate we want to open the add lessons view
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('openAddLessons', 'true');
                          }
                          router.push('/lessons');
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 