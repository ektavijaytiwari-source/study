export type CourseColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'sky';

export interface Course {
  id: string;
  name: string;
  code: string;
  color: CourseColor;
  instructor: string;
  schedule: string;
  term: string;
  credits: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastery: 'new' | 'learning' | 'mastered';
  lastReviewed?: string;
}

export interface MaterialAttachment {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'slides' | 'link' | 'textbook';
}

export interface StudyNote {
  id: string;
  courseId: string;
  title: string;
  content: string;
  unit: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  flashcards: Flashcard[];
  attachments: MaterialAttachment[];
}

export interface SyllabusTopic {
  id: string;
  topic: string;
  status: 'not_started' | 'reviewing' | 'mastered';
  estimatedHours: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  examDate: string; // ISO string e.g. "2026-11-04T09:00:00"
  location: string;
  type: 'Midterm' | 'Final' | 'Quiz' | 'Practical' | 'Assignment';
  weight: number; // percentage of overall course grade e.g. 30
  targetGrade: string; // e.g. "90%"
  priority: 'high' | 'medium' | 'normal';
  syllabusTopics: SyllabusTopic[];
  notes?: string;
  completed: boolean;
  actualGrade?: string;
}

export interface StudySession {
  id: string;
  courseId: string;
  examId?: string;
  topic: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  mode: 'pomodoro' | 'deep_work' | 'review' | 'manual';
  notes?: string;
  completedAt: string;
}

export interface StudentProfile {
  name: string;
  major: string;
  university: string;
  term: string;
  dailyGoalMinutes: number;
  streakDays: number;
  lastActiveDate: string;
}
