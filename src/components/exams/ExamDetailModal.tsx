import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Exam, SyllabusTopic } from '../../types';
import { sound } from '../../utils/audio';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Trash2,
  Timer,
  Award,
  Edit2,
} from 'lucide-react';
import { getCourseTheme, formatExamDate, getExamCountdown } from '../../utils/formatters';

interface ExamDetailModalProps {
  examId: string;
  onClose: () => void;
  onEdit: () => void;
}

export const ExamDetailModal: React.FC<ExamDetailModalProps> = ({ examId, onClose, onEdit }) => {
  const {
    exams,
    courses,
    toggleExamTopicStatus,
    addSyllabusTopic,
    deleteSyllabusTopic,
    updateExam,
    deleteExam,
    setIsFocusModalOpen,
    setFocusCourseId,
    setFocusTopic,
  } = useStudy();

  const exam = exams.find((e) => e.id === examId);
  const course = courses.find((c) => c.id === exam?.courseId);
  const theme = getCourseTheme(course?.color);

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(3);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [actualGradeInput, setActualGradeInput] = useState(exam?.actualGrade || '');

  if (!exam) return null;

  const countdown = getExamCountdown(exam.examDate);

  // Syllabus stats
  const totalTopics = exam.syllabusTopics.length;
  const masteredTopics = exam.syllabusTopics.filter((t) => t.status === 'mastered').length;
  const reviewingTopics = exam.syllabusTopics.filter((t) => t.status === 'reviewing').length;
  const readinessPct = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
  const totalEstHours = exam.syllabusTopics.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addSyllabusTopic(exam.id, {
      topic: newTopicName.trim(),
      status: 'not_started',
      estimatedHours: Number(newTopicHours) || 2,
    });
    setNewTopicName('');
    setShowAddTopic(false);
    sound.playTap();
  };

  const handleStartFocusForTopic = (topic: string) => {
    setFocusCourseId(exam.courseId);
    setFocusTopic(`${exam.title}: ${topic}`);
    setIsFocusModalOpen(true);
    onClose();
  };

  const handleToggleComplete = () => {
    const willComplete = !exam.completed;
    updateExam(exam.id, {
      completed: willComplete,
      actualGrade: willComplete ? actualGradeInput || exam.targetGrade : undefined,
    });
    if (willComplete) {
      sound.playCompletionChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Clean unboxed metadata with typographic separators */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                <span aria-hidden="true">·</span>
                <span>{exam.type}</span>
                <span aria-hidden="true">·</span>
                <span>Weight: {exam.weight}% of Final Grade</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                title="Edit Exam Info"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Date & Time</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatExamDate(exam.examDate)}</span>
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-400">Countdown</span>
              <span
                className={`text-xs font-mono font-semibold flex items-center gap-1 mt-0.5 tabular-nums ${
                  countdown.isOverdue
                    ? 'text-slate-500'
                    : countdown.days < 3
                    ? 'text-rose-600 font-bold'
                    : 'text-indigo-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown.formattedText}</span>
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-400">Venue / Location</span>
              <span className="text-xs font-medium text-slate-800 truncate block mt-0.5" title={exam.location}>
                {exam.location || 'Not specified'}
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-400">Target Grade</span>
              <span className="text-xs font-mono font-semibold text-emerald-700 block mt-0.5">
                {exam.targetGrade}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body / Syllabus Breakdown */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Readiness Progress Bar Card */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-800">Syllabus Mastery Readiness</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {readinessPct}% ({masteredTopics}/{totalTopics} Topics Mastered)
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${readinessPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
              <div
                style={{
                  width: `${totalTopics > 0 ? (reviewingTopics / totalTopics) * 100 : 0}%`,
                }}
                className="h-full bg-amber-400 transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{masteredTopics} Mastered</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>{reviewingTopics} Reviewing</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  <span>{totalTopics - masteredTopics - reviewingTopics} Not started</span>
                </span>
              </div>
              <span>Total Est: {totalEstHours}h prep</span>
            </div>
          </div>

          {/* Syllabus Topic Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">Exam Syllabus Topics</h4>
              <button
                type="button"
                onClick={() => setShowAddTopic(!showAddTopic)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Syllabus Topic</span>
              </button>
            </div>

            {/* Add Topic Form */}
            {showAddTopic && (
              <form onSubmit={handleAddTopic} className="p-3 bg-white border border-slate-200 rounded-xl mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Topic description (e.g. Virtual Memory & TLB)"
                    className="sm:col-span-3 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={newTopicHours}
                      onChange={(e) => setNewTopicHours(Number(e.target.value))}
                      placeholder="Hours"
                      className="w-16 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                    />
                    <span className="text-xs text-slate-400">hrs</span>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {exam.syllabusTopics.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No syllabus topics entered yet. Add topics to track readiness!</p>
            ) : (
              <div className="space-y-2">
                {exam.syllabusTopics.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        {/* Status Cycle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            toggleExamTopicStatus(exam.id, item.id);
                          }}
                          title={`Status: ${item.status}. Click to cycle.`}
                          className="text-slate-400 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                        >
                          {item.status === 'mastered' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : item.status === 'reviewing' ? (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`text-xs font-medium block truncate ${
                              item.status === 'mastered'
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {item.topic}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.estimatedHours}h est. ·{' '}
                            <span className="capitalize font-semibold text-slate-600">
                              {item.status.replace('_', ' ')}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Topic Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartFocusForTopic(item.topic)}
                          title="Start timer on this topic"
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Timer className="w-3 h-3" />
                          <span>Study</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSyllabusTopic(exam.id, item.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes or Permitted Materials */}
          {exam.notes && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900">
              <strong className="font-semibold block mb-0.5">Instructions & Permitted Materials:</strong>
              <p className="leading-relaxed">{exam.notes}</p>
            </div>
          )}

          {/* Exam Completion & Final Grade Entry */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Exam Completion Status</span>
              <span className="text-[11px] text-slate-500">
                {exam.completed
                  ? `Completed. Grade earned: ${exam.actualGrade || exam.targetGrade}`
                  : 'Mark exam finished after taking it'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {exam.completed && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">Grade:</span>
                  <input
                    type="text"
                    value={actualGradeInput}
                    onChange={(e) => setActualGradeInput(e.target.value)}
                    onBlur={() => updateExam(exam.id, { actualGrade: actualGradeInput })}
                    placeholder="e.g. 94%"
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-center font-bold"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleToggleComplete}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  exam.completed
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {exam.completed ? 'Reopen Exam' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this exam and all its syllabus topics?')) {
                deleteExam(exam.id);
                onClose();
              }
            }}
            className="text-xs font-medium text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            Delete Exam
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFocusCourseId(exam.courseId);
                setFocusTopic(`${exam.title} Prep`);
                setIsFocusModalOpen(true);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Launch Focus Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
