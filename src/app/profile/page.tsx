'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  User, Mail, Key, Save, ArrowLeft, Upload, 
  Award, Book, Clock, Calendar 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { calculateUserLevel } from '@/lib/userStats';

type UserProfile = {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  daily_streak: number;
  xp_points: number;
  created_at: string;
  lessons_completed: number;
  total_lessons: number;
  total_minutes: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Get count of completed lessons
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Mock data for demonstration - would be replaced with actual DB queries
        const totalMinutesSpent = Math.floor(Math.random() * 500) + 100;

        setProfile({
          id: data.id,
          username: data.username,
          email: user.email || '',
          avatar_url: data.avatar_url,
          daily_streak: data.daily_streak || 0,
          xp_points: data.xp_points || 0,
          created_at: data.created_at,
          lessons_completed: lessonsCount || 0,
          total_lessons: 20, // Mock total available lessons
          total_minutes: totalMinutesSpent,
        });

        setUsername(data.username || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  // Calculate user level based on XP points
  const userLevel = profile ? calculateUserLevel(profile.xp_points) : { level: 1, progressPercent: 0, currentXp: 0, requiredXp: 20 };

  const handleUpdateUsername = async () => {
    if (!user || !username.trim()) return;

    setUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          username,
        });
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="h-10 w-10 rounded-full flex items-center justify-center p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              My Profile
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Details */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden col-span-1">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-gray-100 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.username || 'User'} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 flex items-center justify-center border-gray-700 bg-gray-800"
                      title="Upload profile picture"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    
                    {/* Level Badge */}
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg border-2 border-gray-800">
                      {userLevel.level}
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-100 mt-2">
                    {profile?.username || 'User'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {profile?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member since {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                  </p>
                  
                  {/* Level Progress Bar */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-amber-400 font-medium">Level {userLevel.level}</span>
                      <span className="text-xs text-gray-400">{userLevel.progressPercent}%</span>
                    </div>
                    <Progress 
                      value={userLevel.progressPercent} 
                      className="h-2 bg-gray-700/70"
                      indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{userLevel.currentXp} XP</span>
                      <span className="text-xs text-gray-500">{userLevel.requiredXp} XP needed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Username</label>
                    <div className="flex">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-gray-100"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 mt-2"
                    onClick={handleUpdateUsername}
                    disabled={updating || username === profile?.username}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-700/50"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Column - Stats */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden col-span-1 lg:col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Learning Stats
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-700/30 rounded-lg p-4 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/10 rounded-full text-2xl flex items-center justify-center">
                      <span role="img" aria-label="Star">⭐</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">XP Points</p>
                      <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {profile?.xp_points.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-2xl flex items-center justify-center">
                      <span role="img" aria-label="Fire">🔥</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Daily Streak</p>
                      <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {profile?.daily_streak} days
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 flex items-center space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-full text-2xl flex items-center justify-center">
                      <span role="img" aria-label="Books">📚</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Lessons Completed</p>
                      <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {profile?.lessons_completed} / {profile?.total_lessons}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-2xl flex items-center justify-center">
                      <span role="img" aria-label="Clock">⏱️</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Learning Time</p>
                      <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {profile?.total_minutes} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  Progress
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-400">Lessons Completed</p>
                      <p className="text-sm text-gray-400">
                        {profile && profile.lessons_completed !== undefined && profile.total_lessons ? 
                          Math.round((profile.lessons_completed / profile.total_lessons) * 100) : 0}%
                      </p>
                    </div>
                    <Progress 
                      value={profile && profile.lessons_completed !== undefined && profile.total_lessons ? 
                        (profile.lessons_completed / profile.total_lessons) * 100 : 0} 
                      className="h-2 bg-gray-700/70"
                      indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 