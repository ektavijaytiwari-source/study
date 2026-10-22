import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ExamDetailModal } from './ExamDetailModal';
import { AddExamModal } from './AddExamModal';
import { Exam } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { getCourseTheme, formatExamDate, getExamCountdown } from '../../utils/formatters';

export const ExamsTab: React.FC = () => {
  const { exams, courses, selectedCourseId, setSelectedCourseId, setIsFocusModalOpen, setFocusCourseId, setFocusTopic } = useStudy();

  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    if (selectedCourseId && exam.courseId !== selectedCourseId) return false;
    if (filterMode === 'upcoming' && exam.completed) return false;
    if (filterMode === 'completed' && !exam.completed) return false;
    return true;
  });

  // Sort: upcoming by date ascending; completed by date descending
  const sortedExams = [...filteredExams].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  // Find the immediate next upcoming exam
  const nextExam = exams
    .filter((e) => !e.completed && new Date(e.examDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Exam & Assessment Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upcoming midterms, finals, practicals with active syllabus tracking & countdowns
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setExamToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* Immediate Next Exam Hero Banner (if exists) */}
      {nextExam && (
        <div className="relative p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-900/40 shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-300 mb-1">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Next Urgent Target</span>
                <span aria-hidden="true">·</span>
                <span>{courses.find((c) => c.id === nextExam.courseId)?.code}</span>
                <span aria-hidden="true">·</span>
                <span>Weight: {nextExam.weight}%</span>
              </div>
              <h3 className="text-lg font-bold text-white">{nextExam.title}</h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatExamDate(nextExam.examDate)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{nextExam.location}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-indigo-300 block">Remaining</span>
                <span className="text-base font-mono font-bold text-white tabular-nums">
                  {getExamCountdown(nextExam.examDate).formattedText}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExamId(nextExam.id)}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Review Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Course Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        {/* Status Mode Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterMode('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterMode === 'upcoming'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({exams.filter((e) => !e.completed).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterMode === 'completed'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({exams.filter((e) => e.completed).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({exams.length})
          </button>
        </div>

        {/* Course Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCourseId(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCourseId === null
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Courses
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCourseId === course.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {course.code}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Grid */}
      {sortedExams.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No scheduled exams found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {filterMode === 'completed'
              ? 'No exams have been marked as completed yet.'
              : 'Add your upcoming tests, midterms, and finals with syllabus checklists.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setExamToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Schedule New Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedExams.map((exam) => {
            const course = courses.find((c) => c.id === exam.courseId);
            const theme = getCourseTheme(course?.color);
            const countdown = getExamCountdown(exam.examDate);

            // Syllabus metrics
            const totalTopics = exam.syllabusTopics.length;
            const masteredTopics = exam.syllabusTopics.filter((t) => t.status === 'mastered').length;
            const readinessPct = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

            return (
              <div
                key={exam.id}
                className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div>
                  {/* Clean unboxed metadata with typographic separators (Strict Zero-Pill) */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{exam.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>Weight: {exam.weight}%</span>
                    </div>

                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${
                        exam.completed
                          ? 'text-emerald-600'
                          : countdown.isOverdue
                          ? 'text-slate-400'
                          : countdown.days < 3
                          ? 'text-rose-600 font-bold'
                          : 'text-indigo-600'
                      }`}
                    >
                      {exam.completed ? 'Finished' : countdown.formattedText}
                    </span>
                  </div>

                  {/* Exam Title */}
                  <h3
                    onClick={() => setSelectedExamId(exam.id)}
                    className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer mb-2"
                  >
                    {exam.title}
                  </h3>

                  {/* Exam details line */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatExamDate(exam.examDate)}</span>
                    {exam.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[160px]">{exam.location}</span>
                      </>
                    )}
                  </div>

                  {/* Syllabus Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Syllabus Readiness</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {readinessPct}% ({masteredTopics}/{totalTopics} topics)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${readinessPct}%` }}
                        className={`h-full transition-all duration-300 ${
                          readinessPct >= 80 ? 'bg-emerald-500' : readinessPct >= 40 ? 'bg-amber-400' : 'bg-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <span>Target: <strong className="text-slate-800">{exam.targetGrade}</strong></span>
                    {exam.actualGrade && (
                      <span> · Result: <strong className="text-emerald-700">{exam.actualGrade}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFocusCourseId(exam.courseId);
                        setFocusTopic(`${exam.title} Review`);
                        setIsFocusModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Timer className="w-3 h-3" />
                      <span>Study</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedExamId(exam.id)}
                      className="px-3 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Syllabus</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExamId && (
        <ExamDetailModal
          examId={selectedExamId}
          onClose={() => setSelectedExamId(null)}
          onEdit={() => {
            const ex = exams.find((e) => e.id === selectedExamId);
            setExamToEdit(ex || null);
            setSelectedExamId(null);
            setIsAddModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Exam Modal */}
      {isAddModalOpen && (
        <AddExamModal
          examToEdit={examToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setExamToEdit(null);
          }}
        />
      )}
    </div>
  );
};
