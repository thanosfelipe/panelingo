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
  Check, Plus, Trash2, ArrowLeft, Clock, Book, 
  Search, Filter, Award, ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  user_id: string | null;
  icon: string | null;
  field_id: number | null;
};

type UserLesson = Lesson & {
  user_id: string;
};

// Define field names
const FIELD_NAMES = {
  1: "Theoretical Direction",
  2: "Science Direction",
  3: "Health Sciences Direction",
  4: "Economics & Computer Science Direction"
};

export default function LessonsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userLessons, setUserLessons] = useState<UserLesson[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingLoading, setAddingLoading] = useState(false);
  const [isSelectingLesson, setIsSelectingLesson] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch lessons that the user has already added
        const { data: userLessonsData, error: userLessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userLessonsError) throw userLessonsError;
        
        // Fetch available lesson templates that don't have a user_id (they're templates)
        const { data: availableLessonsData, error: availableLessonsError } = await supabase
          .from('lessons')
          .select('*')
          .is('user_id', null)
          .order('display_order', { ascending: true });

        if (availableLessonsError) throw availableLessonsError;

        setUserLessons(userLessonsData || []);
        setAvailableLessons(availableLessonsData || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Check if we should show the lesson selection view
    if (typeof window !== 'undefined') {
      const openAddLessons = localStorage.getItem('openAddLessons');
      if (openAddLessons === 'true') {
        setIsSelectingLesson(true);
        localStorage.removeItem('openAddLessons'); // Clean up after using
      }
    }
  }, [user, router]);

  const handleAddLesson = async (lessonTemplate: Lesson) => {
    if (!user) return;
    
    setAddingLoading(true);
    setError(null);

    try {
      // Create a new lesson for the user based on the template
      const { data, error } = await supabase
        .from('lessons')
        .insert([
          {
            title: lessonTemplate.title,
            description: lessonTemplate.description,
            content_type: lessonTemplate.content_type,
            estimated_minutes: lessonTemplate.estimated_minutes,
            topic_id: lessonTemplate.topic_id,
            icon: lessonTemplate.icon,
            xp_reward: lessonTemplate.xp_reward,
            user_id: user.id,
            display_order: userLessons.length + 1,
            field_id: lessonTemplate.field_id,
          },
        ])
        .select();

      if (error) throw error;

      // Add the new lesson to state
      if (data && data.length > 0) {
        setUserLessons([data[0], ...userLessons]);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      setError('Failed to add lesson. Please try again.');
    } finally {
      setAddingLoading(false);
    }
  };

  const handleRemoveLesson = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lesson from your collection?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Security: ensure user can only delete their own lessons

      if (error) throw error;

      // Remove the deleted lesson from state
      setUserLessons(userLessons.filter(lesson => lesson.id !== id));
    } catch (error) {
      console.error('Error removing lesson:', error);
      setError('Failed to remove lesson. Please try again.');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <Book className="h-4 w-4 text-blue-400" />;
      case 'practice':
        return <Plus className="h-4 w-4 text-green-400" />;
      case 'quiz':
        return <Clock className="h-4 w-4 text-purple-400" />;
      default:
        return <Book className="h-4 w-4 text-blue-400" />;
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

  // Filter available lessons based on search query, content type, and field
  const filteredLessons = availableLessons.filter(lesson => {
    const matchesSearch = searchQuery === '' || 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.description && lesson.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedContentType === null || 
      lesson.content_type === selectedContentType;
    
    const matchesField = selectedField === null || 
      lesson.field_id === selectedField;
    
    return matchesSearch && matchesType && matchesField;
  });

  // Group filtered lessons by field_id
  const groupByField = (lessons: Lesson[]) => {
    const groups: Record<number, Lesson[]> = {};
    
    // Initialize groups for all fields (1-4)
    for (let i = 1; i <= 4; i++) {
      groups[i] = [];
    }
    
    // Group lessons by field_id
    lessons.forEach(lesson => {
      if (lesson.field_id) {
        groups[lesson.field_id].push(lesson);
      } else {
        // If no field_id, add to field 1 as default
        groups[1].push(lesson);
      }
    });
    
    return groups;
  };

  // Group lessons by field_id if no field is selected, otherwise just return filtered lessons
  const lessonsByField = selectedField === null ? groupByField(filteredLessons) : { [selectedField]: filteredLessons };

  // Check if a lesson is already in user's collection
  const isLessonAdded = (lessonId: string) => {
    const template = availableLessons.find(lesson => lesson.id === lessonId);
    
    if (!template) return false;
    
    return userLessons.some(userLesson => 
      userLesson.title === template.title && 
      userLesson.field_id === template.field_id
    );
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="h-10 w-10 rounded-full flex items-center justify-center p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {isSelectingLesson ? 'Choose Lessons' : 'My Lessons'}
              </h1>
            </div>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 py-2 px-4"
              onClick={() => setIsSelectingLesson(!isSelectingLesson)}
            >
              {isSelectingLesson ? 'View My Lessons' : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Lessons
                </>
              )}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Select Lesson Templates View */}
          {isSelectingLesson ? (
            <div className="space-y-6">
              {/* Search and filters */}
              <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for lessons..."
                    className="bg-gray-800 border-gray-700 text-gray-100 pl-10"
                  />
                </div>
                
                <div className="flex gap-2 md:hidden">
                  {/* Mobile Content Type Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1 justify-between border-gray-700 text-gray-300"
                      >
                        <div className="flex items-center">
                          {selectedContentType === null ? (
                            <span>All Types</span>
                          ) : (
                            <>
                              {getContentTypeIcon(selectedContentType)}
                              <span className="ml-2">{getContentTypeLabel(selectedContentType)}</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-100">
                      <DropdownMenuItem onClick={() => setSelectedContentType(null)}>
                        <span className={selectedContentType === null ? "text-indigo-400 font-medium" : ""}>All Types</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedContentType("theory")}>
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-blue-400" />
                          <span className={selectedContentType === "theory" ? "text-blue-400 font-medium" : ""}>Theory</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedContentType("practice")}>
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-green-400" />
                          <span className={selectedContentType === "practice" ? "text-green-400 font-medium" : ""}>Practice</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedContentType("quiz")}>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-400" />
                          <span className={selectedContentType === "quiz" ? "text-purple-400 font-medium" : ""}>Quiz</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Field Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1 justify-between border-gray-700 text-gray-300"
                      >
                        <span>{selectedField === null ? "All Fields" : FIELD_NAMES[selectedField as keyof typeof FIELD_NAMES]}</span>
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 bg-gray-800 border-gray-700 text-gray-100">
                      <DropdownMenuItem onClick={() => setSelectedField(null)}>
                        <span className={selectedField === null ? "text-indigo-400 font-medium" : ""}>All Fields</span>
                      </DropdownMenuItem>
                      {Object.entries(FIELD_NAMES).map(([id, name]) => (
                        <DropdownMenuItem key={id} onClick={() => setSelectedField(Number(id))}>
                          <span className={selectedField === Number(id) ? "text-indigo-400 font-medium" : ""}>{name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Desktop Type Filter Buttons - Hidden on Mobile */}
                <div className="hidden md:flex space-x-2 overflow-x-auto py-1 md:py-0">
                  <Button
                    variant={selectedContentType === null ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedContentType === null 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedContentType(null)}
                  >
                    All Types
                  </Button>
                  <Button
                    variant={selectedContentType === "theory" ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedContentType === "theory" 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedContentType("theory")}
                  >
                    <Book className="h-4 w-4 mr-1 text-blue-400" />
                    Theory
                  </Button>
                  <Button
                    variant={selectedContentType === "practice" ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedContentType === "practice" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedContentType("practice")}
                  >
                    <Plus className="h-4 w-4 mr-1 text-green-400" />
                    Practice
                  </Button>
                  <Button
                    variant={selectedContentType === "quiz" ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedContentType === "quiz" 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedContentType("quiz")}
                  >
                    <Clock className="h-4 w-4 mr-1 text-purple-400" />
                    Quiz
                  </Button>
                </div>
              </div>

              {/* Desktop Field Filter Buttons - Hidden on Mobile */}
              <div className="hidden md:flex flex-wrap gap-2">
                <Button
                  variant={selectedField === null ? "default" : "outline"}
                  size="sm"
                  className={`${
                    selectedField === null 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                      : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedField(null)}
                >
                  All Fields
                </Button>
                {Object.entries(FIELD_NAMES).map(([id, name]) => (
                  <Button
                    key={id}
                    variant={selectedField === Number(id) ? "default" : "outline"}
                    size="sm"
                    className={`${
                      selectedField === Number(id)
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedField(Number(id))}
                  >
                    {name}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-100">Available Lessons</h2>
                <p className="text-sm text-gray-400">
                  {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
                </p>
              </div>
              
              {filteredLessons.length === 0 ? (
                <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-8 text-center">
                  <p className="text-gray-400">No lessons found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(lessonsByField).map(([fieldId, lessons]) => (
                    lessons.length > 0 && (
                      <div key={fieldId} className="space-y-4">
                        {selectedField === null && (
                          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 border-b border-gray-700 pb-2">
                            {FIELD_NAMES[fieldId as unknown as keyof typeof FIELD_NAMES]}
                          </h3>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {lessons.map((lesson) => (
                            <Card
                              key={lesson.id}
                              className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors"
                            >
                              <div className="p-6 flex flex-col h-full">
                                <div className="flex justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-gray-700/70 rounded-full">
                                      {lesson.icon ? (
                                        <span className="text-xl">{lesson.icon}</span>
                                      ) : (
                                        getContentTypeIcon(lesson.content_type)
                                      )}
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">
                                      {getContentTypeLabel(lesson.content_type)}
                                    </span>
                                  </div>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                                  {lesson.title}
                                </h3>
                                
                                {lesson.description && (
                                  <p className="text-sm text-gray-400 mb-4 flex-grow line-clamp-3">
                                    {lesson.description}
                                  </p>
                                )}
                                
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {lesson.estimated_minutes} min
                                    </div>
                                    {lesson.xp_reward && (
                                      <div className="flex items-center text-xs text-amber-500">
                                        <Award className="h-4 w-4 mr-1" />
                                        {lesson.xp_reward} XP
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isLessonAdded(lesson.id) ? (
                                    <Button
                                      variant="outline"
                                      className="text-xs border-green-600/30 bg-green-500/10 text-green-400 cursor-default"
                                      disabled
                                    >
                                      <Check className="mr-1 h-3 w-3" />
                                      Added
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      className="text-xs border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/50"
                                      onClick={() => handleAddLesson(lesson)}
                                      disabled={addingLoading}
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                      Add to My Lessons
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* User's Lessons View */
            <div>
              {userLessons.length === 0 ? (
                <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-12 text-center">
                  <h3 className="text-xl font-medium text-gray-300 mb-2">No lessons yet</h3>
                  <p className="text-gray-400 mb-6">Select from our library of lessons to get started</p>
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    onClick={() => setIsSelectingLesson(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Browse Lessons
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search and filters */}
                  <div className="flex flex-col gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for lessons..."
                        className="bg-gray-800 border-gray-700 text-gray-100 pl-10"
                      />
                    </div>
                    
                    <div className="flex gap-2 md:hidden">
                      {/* Mobile Content Type Filter Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 justify-between border-gray-700 text-gray-300"
                          >
                            <div className="flex items-center">
                              {selectedContentType === null ? (
                                <span>All Types</span>
                              ) : (
                                <>
                                  {getContentTypeIcon(selectedContentType)}
                                  <span className="ml-2">{getContentTypeLabel(selectedContentType)}</span>
                                </>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-100">
                          <DropdownMenuItem onClick={() => setSelectedContentType(null)}>
                            <span className={selectedContentType === null ? "text-indigo-400 font-medium" : ""}>All Types</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedContentType("theory")}>
                            <div className="flex items-center">
                              <Book className="h-4 w-4 mr-2 text-blue-400" />
                              <span className={selectedContentType === "theory" ? "text-blue-400 font-medium" : ""}>Theory</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedContentType("practice")}>
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 mr-2 text-green-400" />
                              <span className={selectedContentType === "practice" ? "text-green-400 font-medium" : ""}>Practice</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedContentType("quiz")}>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-purple-400" />
                              <span className={selectedContentType === "quiz" ? "text-purple-400 font-medium" : ""}>Quiz</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Mobile Field Filter Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 justify-between border-gray-700 text-gray-300"
                          >
                            <span>{selectedField === null ? "All Fields" : FIELD_NAMES[selectedField as keyof typeof FIELD_NAMES]}</span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72 bg-gray-800 border-gray-700 text-gray-100">
                          <DropdownMenuItem onClick={() => setSelectedField(null)}>
                            <span className={selectedField === null ? "text-indigo-400 font-medium" : ""}>All Fields</span>
                          </DropdownMenuItem>
                          {Object.entries(FIELD_NAMES).map(([id, name]) => (
                            <DropdownMenuItem key={id} onClick={() => setSelectedField(Number(id))}>
                              <span className={selectedField === Number(id) ? "text-indigo-400 font-medium" : ""}>{name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Desktop Type Filter Buttons - Hidden on Mobile */}
                    <div className="hidden md:flex space-x-2 overflow-x-auto py-1 md:py-0">
                      <Button
                        variant={selectedContentType === null ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedContentType === null 
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                            : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedContentType(null)}
                      >
                        All Types
                      </Button>
                      <Button
                        variant={selectedContentType === "theory" ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedContentType === "theory" 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" 
                            : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedContentType("theory")}
                      >
                        <Book className="h-4 w-4 mr-1 text-blue-400" />
                        Theory
                      </Button>
                      <Button
                        variant={selectedContentType === "practice" ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedContentType === "practice" 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                            : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedContentType("practice")}
                      >
                        <Plus className="h-4 w-4 mr-1 text-green-400" />
                        Practice
                      </Button>
                      <Button
                        variant={selectedContentType === "quiz" ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedContentType === "quiz" 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                            : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedContentType("quiz")}
                      >
                        <Clock className="h-4 w-4 mr-1 text-purple-400" />
                        Quiz
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Field Filter Buttons - Hidden on Mobile */}
                  <div className="hidden md:flex flex-wrap gap-2">
                    <Button
                      variant={selectedField === null ? "default" : "outline"}
                      size="sm"
                      className={`${
                        selectedField === null 
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                          : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                      }`}
                      onClick={() => setSelectedField(null)}
                    >
                      All Fields
                    </Button>
                    {Object.entries(FIELD_NAMES).map(([id, name]) => (
                      <Button
                        key={id}
                        variant={selectedField === Number(id) ? "default" : "outline"}
                        size="sm"
                        className={`${
                          selectedField === Number(id)
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                            : "border-gray-700 text-gray-300 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedField(Number(id))}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>

                  {/* Filter user lessons the same way as templates */}
                  {(() => {
                    // Filter user lessons based on search query, content type, and field
                    const filteredUserLessons = userLessons.filter(lesson => {
                      const matchesSearch = searchQuery === '' || 
                        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (lesson.description && lesson.description.toLowerCase().includes(searchQuery.toLowerCase()));
                      
                      const matchesType = selectedContentType === null || 
                        lesson.content_type === selectedContentType;
                      
                      const matchesField = selectedField === null || 
                        lesson.field_id === selectedField;
                      
                      return matchesSearch && matchesType && matchesField;
                    });

                    // Group by field if no field is selected
                    const userLessonsByField = selectedField === null 
                      ? groupByField(filteredUserLessons) 
                      : { [selectedField]: filteredUserLessons };

                    if (filteredUserLessons.length === 0) {
                      return (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-8 text-center">
                          <p className="text-gray-400">No lessons found matching your criteria.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-8">
                        {Object.entries(userLessonsByField).map(([fieldId, lessons]) => (
                          lessons.length > 0 && (
                            <div key={fieldId} className="space-y-4">
                              {selectedField === null && (
                                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 border-b border-gray-700 pb-2">
                                  {FIELD_NAMES[fieldId as unknown as keyof typeof FIELD_NAMES]}
                                </h3>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lessons.map((lesson) => (
                                  <Card 
                                    key={lesson.id}
                                    className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 transition-colors"
                                  >
                                    <div className="p-6 flex flex-col h-full">
                                      <div className="flex justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                          <div className="p-1.5 bg-gray-700/70 rounded-full">
                                            {lesson.icon ? (
                                              <span className="text-xl">{lesson.icon}</span>
                                            ) : (
                                              getContentTypeIcon(lesson.content_type)
                                            )}
                                          </div>
                                          <span className="text-xs font-medium text-gray-400">
                                            {getContentTypeLabel(lesson.content_type)}
                                          </span>
                                        </div>
                                        <Button
                                          variant="outline"
                                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center"
                                          onClick={() => handleRemoveLesson(lesson.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                                        {lesson.title}
                                      </h3>
                                      
                                      {lesson.description && (
                                        <p className="text-sm text-gray-400 mb-4 flex-grow line-clamp-3">
                                          {lesson.description}
                                        </p>
                                      )}
                                      
                                      <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {lesson.estimated_minutes} min
                                          </div>
                                          {lesson.xp_reward && (
                                            <div className="flex items-center text-xs text-amber-500">
                                              <Award className="h-4 w-4 mr-1" />
                                              {lesson.xp_reward} XP
                                            </div>
                                          )}
                                        </div>
                                        
                                        <Button
                                          variant="outline"
                                          className="text-xs border-gray-700 bg-gray-800/70 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30"
                                          onClick={() => {
                                            // Store referrer before navigation
                                            try {
                                              localStorage.setItem('lessonReferrer', '/lessons');
                                              console.log('Set referrer to /lessons');
                                            } catch (error) {
                                              console.error('Failed to set localStorage referrer:', error);
                                            }
                                            router.push(`/lessons/${lesson.id}`);
                                          }}
                                        >
                                          View Details
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 