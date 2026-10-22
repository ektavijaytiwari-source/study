import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { Timer, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsFocusModalOpen } = useStudy();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
            S
          </span>
          <span>ScholarDeck</span>
        </a>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'notes'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          Study Notes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'exams'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          Exam Planner
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'progress'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          Progress & Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
            activeTab === 'courses'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          Courses
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsFocusModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Timer className="w-4 h-4 text-indigo-100" />
          <span>Start Focus Timer</span>
        </button>
      </div>
    </header>
  );
};
