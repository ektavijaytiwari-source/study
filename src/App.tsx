import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/layout/Header';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { NotesTab } from './components/notes/NotesTab';
import { ExamsTab } from './components/exams/ExamsTab';
import { ProgressTab } from './components/progress/ProgressTab';
import { CoursesTab } from './components/courses/CoursesTab';
import { FocusTimerModal } from './components/focus/FocusTimerModal';
import { FlashcardDeckModal } from './components/notes/FlashcardDeckModal';
import { BookOpen, Calendar, TrendingUp, Layers, CheckCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useStudy();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <OverviewTab />}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'exams' && <ExamsTab />}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'courses' && <CoursesTab />}
      </main>

      {/* Global Focus Timer Modal */}
      <FocusTimerModal />

      {/* Global Flashcard Recall Deck Modal */}
      <FlashcardDeckModal />

      {/* Quiet Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ScholarDeck</span>
            <span aria-hidden="true">·</span>
            <span>Student Study Material, Exam Planner & Progress System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Offline-First Storage</span>
            <span aria-hidden="true">·</span>
            <span>Spaced Repetition</span>
            <span aria-hidden="true">·</span>
            <span>Pomodoro Deep Work</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainAppContent />
    </StudyProvider>
  );
}
