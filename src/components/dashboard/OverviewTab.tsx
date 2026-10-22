import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { NoteEditorModal } from '../notes/NoteEditorModal';
import { ExamDetailModal } from '../exams/ExamDetailModal';
import { AddExamModal } from '../exams/AddExamModal';
import {
  Calendar,
  Clock,
  BookOpen,
  Timer,
  Flame,
  CheckCircle2,
  ChevronRight,
  Plus,
  Layers,
  ArrowUpRight,
  Pin,
  TrendingUp,
} from 'lucide-react';
import { getCourseTheme, formatExamDate, getExamCountdown, formatMinutes } from '../../utils/formatters';

export const OverviewTab: React.FC = () => {
  const {
    courses,
    notes,
    exams,
    sessions,
    profile,
    setActiveTab,
    setSelectedCourseId,
    setIsFocusModalOpen,
    setFocusCourseId,
    setFocusTopic,
    setStudyDeckNoteId,
    todayMinutesStudied,
    overallMasteryPercentage,
  } = useStudy();

  const [activeNoteModalId, setActiveNoteModalId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // Immediate next upcoming exam
  const upcomingExams = exams
    .filter((e) => !e.completed && new Date(e.examDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  const nextExam = upcomingExams[0];

  // Recent notes (pinned first)
  const recentNotes = [...notes]
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 4);

  // Total flashcards count
  const totalFlashcards = notes.reduce((sum, n) => sum + n.flashcards.length, 0);

  // 7-day study minutes
  const today = new Date();
  const last7Days: { day: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const minutes = sessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    last7Days.push({ day: dayLabel, minutes });
  }
  const weekTotalMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);
  const maxMins = Math.max(90, ...last7Days.map((d) => d.minutes));

  return (
    <div className="space-y-6">
      {/* Student Welcome & Fast Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
        <div>
          {/* Clean unboxed metadata with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>{profile.term}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.major}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.university}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Flame streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-mono tabular-nums">{profile.streakDays} Day Streak</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingNote(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddExamOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFocusModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Focus Now</span>
          </button>
        </div>
      </div>

      {/* Immediate Next Exam Hero Spotlight (if any upcoming) */}
      {nextExam && (
        <div className="relative p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-900/50 shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-indigo-300">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Primary Upcoming Milestone</span>
                <span aria-hidden="true">·</span>
                <span>{courses.find((c) => c.id === nextExam.courseId)?.code}</span>
                <span aria-hidden="true">·</span>
                <span>{nextExam.weight}% Weight</span>
              </div>
              <h2 className="text-lg font-bold text-white">{nextExam.title}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatExamDate(nextExam.examDate)}</span>
                <span aria-hidden="true">·</span>
                <span>{nextExam.location || 'Location TBA'}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-indigo-300 block font-medium">Countdown</span>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {getExamCountdown(nextExam.examDate).formattedText}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedExamId(nextExam.id)}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                Inspect Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Study Time Progress */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-xs text-slate-500 font-medium">Today's Focus Duration</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatMinutes(todayMinutesStudied)}
              </span>
              <span className="text-xs text-slate-400">/ {formatMinutes(profile.dailyGoalMinutes)}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {weekTotalMinutes > 0 ? `${formatMinutes(weekTotalMinutes)} logged this week` : 'Ready to start'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Syllabus Mastery */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-xs text-slate-500 font-medium">Exam Syllabus Readiness</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {overallMasteryPercentage}%
              </span>
              <span className="text-xs text-emerald-600 font-medium">Mastered</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across {exams.length} scheduled assessments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Material Library */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-xs text-slate-500 font-medium">Study Material Library</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {notes.length}
              </span>
              <span className="text-xs text-slate-500">Notes · {totalFlashcards} Cards</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across {courses.length} enrolled courses</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols wide on desktop): Upcoming Exams & Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams Strip */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Assessments Timeline</h3>
                <p className="text-xs text-slate-500">Checklists & readiness status</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('exams')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({exams.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No upcoming exams scheduled.</div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.slice(0, 3).map((exam) => {
                  const course = courses.find((c) => c.id === exam.courseId);
                  const theme = getCourseTheme(course?.color);
                  const countdown = getExamCountdown(exam.examDate);

                  const totalTopics = exam.syllabusTopics.length;
                  const masteredTopics = exam.syllabusTopics.filter((t) => t.status === 'mastered').length;
                  const readinessPct = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

                  return (
                    <div
                      key={exam.id}
                      onClick={() => setSelectedExamId(exam.id)}
                      className="group p-3.5 border border-slate-200/70 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{exam.type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{countdown.formattedText}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {exam.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-28 text-right">
                          <span className="text-[11px] font-mono font-semibold text-slate-700 tabular-nums">
                            {readinessPct}% Ready
                          </span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              style={{ width: `${readinessPct}%` }}
                              className={`h-full ${
                                readinessPct >= 75
                                  ? 'bg-emerald-500'
                                  : readinessPct >= 40
                                  ? 'bg-amber-400'
                                  : 'bg-indigo-500'
                              }`}
                            />
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Study Notes */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Study Notes & Material</h3>
                <p className="text-xs text-slate-500">Quick access to lecture summaries & active recall cards</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All ({notes.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentNotes.map((note) => {
                const course = courses.find((c) => c.id === note.courseId);
                const theme = getCourseTheme(course?.color);

                return (
                  <div
                    key={note.id}
                    className="p-4 border border-slate-200/70 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                        {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current" />}
                      </div>
                      <h4
                        onClick={() => setActiveNoteModalId(note.id)}
                        className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 mb-2"
                      >
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {note.content.replace(/#|\*|`|\$|>/g, '')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {note.flashcards.length > 0 ? `${note.flashcards.length} cards` : 'No cards'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {note.flashcards.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setStudyDeckNoteId(note.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                          >
                            Practice
                          </button>
                        )}
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => setActiveNoteModalId(note.id)}
                          className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Habit Visualizer & Subject Mastery Breakdown */}
        <div className="space-y-6">
          {/* 7-Day Activity Spark */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">7-Day Study Activity</span>
              <span className="text-xs font-mono font-semibold text-indigo-600 tabular-nums">
                {formatMinutes(weekTotalMinutes)}
              </span>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-24 pt-2 border-b border-slate-100 pb-1">
              {last7Days.map((d, idx) => {
                const heightPct = maxMins > 0 ? (d.minutes / maxMins) * 100 : 0;
                const isToday = idx === 6;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isToday ? 'bg-indigo-600' : d.minutes > 0 ? 'bg-indigo-400' : 'bg-slate-100'
                      }`}
                      title={`${d.day}: ${d.minutes} mins`}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Target: {formatMinutes(profile.dailyGoalMinutes)} / day
            </p>
          </div>

          {/* Subject Mastery Radar List */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Syllabus Completion by Subject</span>
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Analytics
              </button>
            </div>

            <div className="space-y-3.5">
              {courses.map((course) => {
                const theme = getCourseTheme(course.color);
                const courseExams = exams.filter((e) => e.courseId === course.id);
                const allTopics = courseExams.flatMap((e) => e.syllabusTopics);
                const mastered = allTopics.filter((t) => t.status === 'mastered').length;
                const pct = allTopics.length > 0 ? Math.round((mastered / allTopics.length) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('exams');
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${theme.text}`}>{course.code}</span>
                      <span className="font-mono text-[11px] font-bold text-slate-800 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-emerald-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Active Recall Prompt Card */}
          <div className="p-5 bg-indigo-50/60 border border-indigo-200/70 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold mb-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Active Recall Challenge</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed mb-3">
              Testing yourself on key concepts boosts retention by up to 200% compared to passive rereading.
            </p>
            {notes[0] && (
              <button
                type="button"
                onClick={() => setStudyDeckNoteId(notes[0].id)}
                className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer text-center"
              >
                Practice "{notes[0].title.substring(0, 24)}..." Deck
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note Editor Modal */}
      {(activeNoteModalId !== null || isCreatingNote) && (
        <NoteEditorModal
          noteId={activeNoteModalId}
          onClose={() => {
            setActiveNoteModalId(null);
            setIsCreatingNote(false);
          }}
        />
      )}

      {/* Exam Detail Modal */}
      {selectedExamId && (
        <ExamDetailModal
          examId={selectedExamId}
          onClose={() => setSelectedExamId(null)}
          onEdit={() => {
            setSelectedExamId(null);
            setIsAddExamOpen(true);
          }}
        />
      )}

      {/* Add Exam Modal */}
      {isAddExamOpen && (
        <AddExamModal
          onClose={() => setIsAddExamOpen(false)}
        />
      )}
    </div>
  );
};
