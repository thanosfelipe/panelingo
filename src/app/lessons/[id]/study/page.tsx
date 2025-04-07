'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { getAvailableChapters, getChapterDisplayName } from '@/lib/csvParser';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';

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
  field_id: number | null;
};

export default function LessonStudyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [showQuestionTypeSelection, setShowQuestionTypeSelection] = useState<boolean>(false);

  useEffect(() => {
    // Safely extract the lesson ID from the URL path
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 2]; // The ID is second-to-last in the path /lessons/[id]/study
      setLessonId(id);
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
          .eq('user_id', user.id)
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

  const handleChapterSelect = (chapter: string) => {
    // Get the current subject
    const currentSubject = getSubject();

    // Store the chapter and subject in localStorage
    localStorage.setItem('selectedChapter', chapter);
    localStorage.setItem('selectedSubject', currentSubject);

    console.log('Selected chapter:', chapter, 'for subject:', currentSubject);

    // Show question type selection instead of immediately navigating
    setSelectedChapter(chapter);
    setShowQuestionTypeSelection(true);
  };

  const handleQuestionTypeSelect = (questionType: 'multiple_choice' | 'true_false') => {
    // Store the question type in localStorage
    localStorage.setItem('selectedQuestionType', questionType);

    console.log('Selected question type:', questionType);

    // Navigate to the question page
    router.push(`/lessons/${lessonId}/study/question`);
  };

  // Get subject based on lesson title
  const getSubject = (): string => {
    if (!lesson) return '';

    console.log('Attempting to determine subject from lesson title:', lesson.title);

    // Log the full title to debug
    console.log('Full lesson title:', lesson.title);

    // Directly check the title for the specific Greek wording
    if (lesson.title.includes('Οικονομία Ομάδας Προσανατολισμού') ||
      lesson.title === 'Οικονομία Ομάδας Προσανατολισμού') {
      console.log('📊 Detected AOTH subject with exact match');
      return 'AOTH';
    }

    if (lesson.title.includes('Μαθηματικά Ομάδας Προσανατολισμού') ||
      lesson.title === 'Μαθηματικά Ομάδας Προσανατολισμού') {
      console.log('🧮 Detected MATH subject with exact match');
      return 'MATH';
    }

    // More aggressive matching for partial text (if the title isn't exactly what we expect)
    if (lesson.title.toLowerCase().includes('οικονομία') ||
      lesson.title.toLowerCase().includes('οικονομικ')) {
      console.log('📊 Detected AOTH subject (partial match)');
      return 'AOTH';
    }

    if (lesson.title.toLowerCase().includes('μαθηματικ')) {
      console.log('🧮 Detected MATH subject (partial match)');
      return 'MATH';
    }

    // If we get here, log that we couldn't determine and default to AOTH
    console.log('⚠️ Could not determine subject from title, defaulting to AOTH');
    return 'AOTH';
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

  // Get available chapters for this subject
  const subject = getSubject();
  const chapters = getAvailableChapters(subject);

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
              {lesson.title} - {showQuestionTypeSelection ? 'Επιλογή Τύπου Ερωτήσεων' : 'Επιλογή Κεφαλαίου'}
            </h1>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {!showQuestionTypeSelection ? (
            /* Chapter Selection */
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-6">Επιλέξτε ένα κεφάλαιο</h3>

                <div className="space-y-4">
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <Card
                        key={chapter}
                        className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                        onClick={() => handleChapterSelect(chapter)}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-700/70 rounded-full">
                              <BookOpen className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-100">
                                {getChapterDisplayName(chapter)}
                              </h4>
                              <p className="text-sm text-gray-400">
                                Multiple Choice Questions
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-6">
                        No chapters found for this lesson. (Subject: {subject || 'Unknown'})
                      </p>
                      <Button
                        onClick={() => window.history.back()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                      >
                        Go Back
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            /* Question Type Selection */
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  {getChapterDisplayName(selectedChapter || '')}
                </h3>
                <p className="text-gray-400 mb-6">Επιλέξτε τον τύπο ερωτήσεων</p>

                <div className="space-y-4">
                  <Card
                    className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                    onClick={() => handleQuestionTypeSelect('multiple_choice')}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-700/70 rounded-full">
                          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-100">
                            Πολλαπλής Επιλογής
                          </h4>
                          <p className="text-sm text-gray-400">
                            Τέσσερις επιλογές με μία σωστή απάντηση
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>

                  <Card
                    className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                    onClick={() => handleQuestionTypeSelect('true_false')}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-700/70 rounded-full">
                          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-100">
                            Σωστό / Λάθος
                          </h4>
                          <p className="text-sm text-gray-400">
                            Ερωτήσεις με επιλογή Σωστό ή Λάθος
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>

                  <Button
                    variant="outline"
                    onClick={() => setShowQuestionTypeSelection(false)}
                    className="w-full mt-4"
                  >
                    Επιστροφή στην επιλογή κεφαλαίου
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 