export interface User {
  id: string;
  name: string;
  email: string;
  progress: Progress;
}

export interface Progress {
  completedExercises: number;
  totalExercises: number;
  subjects: SubjectProgress[];
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
}

export interface Exercise {
  id: string;
  subjectId: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  totalExercises: number;
  difficulty: 'easy' | 'medium' | 'hard';
} 