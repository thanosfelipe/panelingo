'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Book, ArrowLeft, Plus, Check, Trash2, Award } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content_type: 'theory' | 'practice' | 'quiz';
  created_at: string;
  topic_id: string | null;
  estimated_minutes: number | null;
  display_order: number | null;
  xp_reward: number | null;
  user_id: string;
  icon: string | null;
};

export default function LessonDetailsPage(props: any) {
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [referrer, setReferrer] = useState<string>('/lessons');
  
  // Extract the ID from the URL using window.location if available
  const [lessonId, setLessonId] = useState<string>('');
  
  useEffect(() => {
    // Safely extract the lesson ID from the URL path
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      setLessonId(id);
      
      // First priority: Check localStorage (most reliable method)
      const storedReferrer = localStorage.getItem('lessonReferrer');
      if (storedReferrer) {
        console.log('Using referrer from localStorage:', storedReferrer);
        setReferrer(storedReferrer);
        localStorage.removeItem('lessonReferrer'); // Clear after use
        return; // Exit early if we have a stored referrer
      }
      
      // Second priority: Check document.referrer
      const previousPage = document.referrer;
      console.log('Document referrer:', previousPage);
      
      if (previousPage) {
        if (previousPage.includes('/dashboard')) {
          console.log('Detected dashboard as referrer');
          setReferrer('/dashboard');
        } else if (previousPage.includes('/lessons')) {
          console.log('Detected lessons as referrer');
          setReferrer('/lessons');
        } else {
          console.log('Unknown referrer, defaulting to lessons page');
          setReferrer('/lessons');
        }
      } else {
        console.log('No referrer detected, defaulting to lessons page');
        setReferrer('/lessons');
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!lessonId) {
      return; // Wait until we have the lessonId
    }

    const fetchLesson = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .eq('user_id', user.id) // Security: ensure user can only view their own lessons
          .single();

        if (error) throw error;
        setLesson(data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setError('Failed to load lesson. It might not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [user, lessonId, router]);

  const handleRemoveLesson = async () => {
    if (!lesson || !user) return;
    if (!confirm('Are you sure you want to remove this lesson from your collection?')) return;

    setRemoving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id)
        .eq('user_id', user.id); // Security: ensure user can only delete their own lessons

      if (error) throw error;
      
      // Redirect to dashboard instead of the original referrer page
      router.push('/dashboard');
    } catch (error) {
      console.error('Error removing lesson:', error);
      setError('Failed to remove this lesson. Please try again.');
      setRemoving(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <Book className="h-5 w-5 text-blue-400" />;
      case 'practice':
        return <Plus className="h-5 w-5 text-green-400" />;
      case 'quiz':
        return <Clock className="h-5 w-5 text-purple-400" />;
      default:
        return <Book className="h-5 w-5 text-blue-400" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'theory':
        return 'Theory';
      case 'practice':
        return 'Practice';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Theory';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleGoBack = () => {
    router.push(referrer);
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

  if (error || !lesson) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 mb-8">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="h-10 w-10 rounded-full flex items-center justify-center p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-200">Lesson Not Found</h1>
            </div>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">{error || "This lesson doesn't exist or you don't have permission to view it."}</p>
                <Button
                  onClick={() => window.history.back()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  Go Back
                </Button>
              </div>
            </Card>
          </div>
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
              Lesson Details
            </h1>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {/* Lesson Header Card */}
          <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-700/70 rounded-full">
                    {lesson.icon ? (
                      <span className="text-2xl">{lesson.icon}</span>
                    ) : (
                      getContentTypeIcon(lesson.content_type)
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    {getContentTypeLabel(lesson.content_type)}
                  </span>
                </div>
                <Button
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30"
                  onClick={handleRemoveLesson}
                  disabled={removing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {removing ? 'Removing...' : 'Remove Lesson'}
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-100 mb-4">{lesson.title}</h2>
              
              {lesson.description && (
                <p className="text-gray-400 mb-6">{lesson.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.estimated_minutes} minutes
                </div>
                {lesson.xp_reward && (
                  <div className="flex items-center text-amber-500">
                    <Award className="h-4 w-4 mr-1" />
                    {lesson.xp_reward} XP
                  </div>
                )}
                <div>
                  Added: {formatDate(lesson.created_at)}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Content section - would contain exercises, quizzes, etc. */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Lesson Content</h3>
              
              <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-8 text-center">
                <p className="text-gray-400 mb-6">Start practicing this lesson to see its content</p>
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={() => router.push(`/lessons/${lesson.id}/study`)}
                >
                  Start Lesson
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 