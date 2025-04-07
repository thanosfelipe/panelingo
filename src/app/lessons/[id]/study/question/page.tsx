'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  Question,
  loadMultipleChoiceQuestions,
  loadTrueFalseQuestions
} from '@/lib/csvParser';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lessonId, setLessonId] = useState<string>('');
  const [score, setScore] = useState(0);
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');

  useEffect(() => {
    // Safely extract the lesson ID from the URL path
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 3]; // The ID is third-to-last in the path /lessons/[id]/study/question
      setLessonId(id);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Load the selected chapter from localStorage
    const selectedChapter = localStorage.getItem('selectedChapter');
    if (!selectedChapter) {
      // If no chapter is selected, go back to the chapter selection page
      console.error('No chapter selected. Redirecting to study page.');
      router.push(`/lessons/${lessonId}/study`);
      return;
    }

    // Get the subject from localStorage
    const storedSubject = localStorage.getItem('selectedSubject');

    if (!storedSubject) {
      console.warn('No subject stored in localStorage. This is unexpected.');
    }

    // Get the question type from localStorage
    const storedQuestionType = localStorage.getItem('selectedQuestionType') as 'multiple_choice' | 'true_false';
    if (!storedQuestionType) {
      console.warn('No question type stored in localStorage. Defaulting to multiple choice.');
    } else {
      setQuestionType(storedQuestionType);
    }

    // Use the stored subject or default to AOTH if none found
    const subject = storedSubject || 'AOTH';
    console.log('Selected subject for questions:', subject, 'for chapter:', selectedChapter, 'question type:', questionType);

    // Load questions for the selected chapter and question type
    const loadQuestions = async () => {
      setLoading(true);
      try {
        let loadedQuestions: Question[] = [];

        if (storedQuestionType === 'true_false') {
          console.log(`📚 Loading ${subject} true/false questions for ${selectedChapter}...`);
          loadedQuestions = await loadTrueFalseQuestions(subject, selectedChapter);
        } else {
          console.log(`📚 Loading ${subject} multiple choice questions for ${selectedChapter}...`);
          loadedQuestions = await loadMultipleChoiceQuestions(subject, selectedChapter);
        }

        if (loadedQuestions.length === 0) {
          console.error(`No questions found for ${subject} chapter ${selectedChapter}.`);
          throw new Error(`No ${storedQuestionType} questions found for this chapter (${subject} - ${selectedChapter}).`);
        }

        console.log(`✅ Successfully loaded ${loadedQuestions.length} questions for ${subject} - ${selectedChapter}`);

        // Shuffle the questions for a random order
        const shuffledQuestions = [...loadedQuestions].sort(() => Math.random() - 0.5);

        setQuestions(shuffledQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError(`Failed to load questions for ${subject} - ${selectedChapter}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [user, lessonId, router, questionType]);

  const handleSelectAnswer = (answer: string) => {
    if (showFeedback) return; // Prevent selecting answers during feedback

    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];

    let isAnswerCorrect = false;

    if (currentQuestion.type === 'multiple_choice') {
      const mcQuestion = currentQuestion as MultipleChoiceQuestion;
      // Convert the letter answer to index (a = answer_1, b = answer_2, etc.)
      let correctAnswerIndex = '';
      switch (mcQuestion.correct_answer) {
        case 'α': correctAnswerIndex = 'answer_1'; break;
        case 'β': correctAnswerIndex = 'answer_2'; break;
        case 'γ': correctAnswerIndex = 'answer_3'; break;
        case 'δ': correctAnswerIndex = 'answer_4'; break;
        default: correctAnswerIndex = 'answer_1';
      }

      // Check if the selected answer is correct
      isAnswerCorrect = selectedAnswer === correctAnswerIndex;
    } else if (currentQuestion.type === 'true_false') {
      const tfQuestion = currentQuestion as TrueFalseQuestion;

      // Check if the selected answer is correct
      isAnswerCorrect = selectedAnswer === tfQuestion.answer;
    }

    // Update the score if the answer is correct
    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    // Reset state for the next question
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);

    // Move to the next question or finish if there are no more questions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Here we would normally show a summary, but for now we'll just go back to the lesson page
      alert(`Quiz completed! Your score: ${score}/${questions.length}`);
      router.push(`/lessons/${lessonId}`);
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

  if (error || questions.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-200">Questions Not Found</h1>
            </div>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">{error || "No questions found for this chapter."}</p>
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

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Safety check for malformed questions
  if (!currentQuestion || !currentQuestion.question) {
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
              <h1 className="text-2xl font-bold text-gray-200">Malformed Question Data</h1>
            </div>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 p-6">
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">
                  The current question appears to be malformed or missing data. Please try a different question or chapter.
                </p>
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
          {/* Header with back and progress */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="h-10 w-10 rounded-full flex items-center justify-center p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {currentQuestion.type === 'multiple_choice' ? 'Πολλαπλής Επιλογής' : 'Σωστό / Λάθος'}
              </h1>
            </div>
            <div className="text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-100 mb-2">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.type === 'multiple_choice' ? (
                  // Multiple Choice Options
                  [
                    { key: 'answer_1', label: 'α', text: (currentQuestion as MultipleChoiceQuestion).answer_1 },
                    { key: 'answer_2', label: 'β', text: (currentQuestion as MultipleChoiceQuestion).answer_2 },
                    { key: 'answer_3', label: 'γ', text: (currentQuestion as MultipleChoiceQuestion).answer_3 },
                    { key: 'answer_4', label: 'δ', text: (currentQuestion as MultipleChoiceQuestion).answer_4 }
                  ].map((option) => {
                    // Determine the background color based on the feedback state
                    let bgColorClass = 'bg-gray-700/30';

                    if (showFeedback) {
                      // Convert the letter answer to index
                      let correctAnswerIndex = '';
                      switch ((currentQuestion as MultipleChoiceQuestion).correct_answer) {
                        case 'α': correctAnswerIndex = 'answer_1'; break;
                        case 'β': correctAnswerIndex = 'answer_2'; break;
                        case 'γ': correctAnswerIndex = 'answer_3'; break;
                        case 'δ': correctAnswerIndex = 'answer_4'; break;
                        default: correctAnswerIndex = 'answer_1';
                      }

                      if (option.key === correctAnswerIndex) {
                        // Correct answer is always green
                        bgColorClass = 'bg-green-500/20 border-green-500/30';
                      } else if (option.key === selectedAnswer) {
                        // Selected but incorrect answer is red
                        bgColorClass = 'bg-red-500/20 border-red-500/30';
                      }
                    } else if (option.key === selectedAnswer) {
                      // Selected answer before feedback is highlighted
                      bgColorClass = 'bg-indigo-500/20 border-indigo-500/30';
                    }

                    return (
                      <div
                        key={option.key}
                        className={cn(
                          "p-4 rounded-lg border border-gray-700 cursor-pointer transition-colors",
                          bgColorClass,
                          { "pointer-events-none": showFeedback } // Disable pointer events during feedback
                        )}
                        onClick={() => handleSelectAnswer(option.key)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <span className="text-gray-300 font-medium">{option.label}</span>
                          </div>
                          <div className="text-gray-300">{option.text}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // True/False Options
                  [
                    { key: 'σωστό', label: '✓', text: 'Σωστό' },
                    { key: 'λάθος', label: '✗', text: 'Λάθος' },
                  ].map((option) => {
                    // Determine the background color based on the feedback state
                    let bgColorClass = 'bg-gray-700/30';

                    if (showFeedback) {
                      const correctAnswer = (currentQuestion as TrueFalseQuestion).answer;

                      if (option.key === correctAnswer) {
                        // Correct answer is always green
                        bgColorClass = 'bg-green-500/20 border-green-500/30';
                      } else if (option.key === selectedAnswer) {
                        // Selected but incorrect answer is red
                        bgColorClass = 'bg-red-500/20 border-red-500/30';
                      }
                    } else if (option.key === selectedAnswer) {
                      // Selected answer before feedback is highlighted
                      bgColorClass = 'bg-indigo-500/20 border-indigo-500/30';
                    }

                    return (
                      <div
                        key={option.key}
                        className={cn(
                          "p-4 rounded-lg border border-gray-700 cursor-pointer transition-colors",
                          bgColorClass,
                          { "pointer-events-none": showFeedback } // Disable pointer events during feedback
                        )}
                        onClick={() => handleSelectAnswer(option.key)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <span className="text-gray-300 font-medium">{option.label}</span>
                          </div>
                          <div className="text-gray-300">{option.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {!showFeedback ? (
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                disabled={!selectedAnswer}
                onClick={handleCheckAnswer}
              >
                Check Answer
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="text-green-500 h-5 w-5" />
                    <span className="text-green-500">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500 h-5 w-5" />
                    <span className="text-red-500">Incorrect</span>
                  </>
                )}
              </div>
            )}

            {showFeedback && (
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Finish Quiz'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 