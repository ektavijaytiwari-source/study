import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { sound } from '../../utils/audio';
import {
  TrendingUp,
  Clock,
  Calendar,
  Flame,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { formatMinutes, getCourseTheme } from '../../utils/formatters';

export const ProgressTab: React.FC = () => {
  const {
    courses,
    exams,
    sessions,
    profile,
    addSession,
    deleteSession,
    todayMinutesStudied,
    overallMasteryPercentage,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
  } = useStudy();

  const [showManualLog, setShowManualLog] = useState(false);
  const [logCourseId, setLogCourseId] = useState(courses[0]?.id || '');
  const [logTopic, setLogTopic] = useState('');
  const [logMinutes, setLogMinutes] = useState(45);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logMode, setLogMode] = useState<'pomodoro' | 'deep_work' | 'review' | 'manual'>('deep_work');
  const [logNotes, setLogNotes] = useState('');

  // Weekly study time aggregation (last 7 days)
  const last7Days: { dateStr: string; label: string; minutes: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const minutes = sessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    last7Days.push({ dateStr, label: dayLabel, minutes });
  }

  const maxDailyMinutes = Math.max(120, ...last7Days.map((d) => d.minutes));
  const weekTotalMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);
  const overallTotalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Time distribution by course
  const courseTimeMap: Record<string, number> = {};
  courses.forEach((c) => {
    courseTimeMap[c.id] = 0;
  });
  sessions.forEach((s) => {
    if (courseTimeMap[s.courseId] !== undefined) {
      courseTimeMap[s.courseId] += s.durationMinutes;
    }
  });

  // Syllabus mastery per course
  const courseMasteryList = courses.map((course) => {
    const courseExams = exams.filter((e) => e.courseId === course.id);
    const allTopics = courseExams.flatMap((e) => e.syllabusTopics);
    const mastered = allTopics.filter((t) => t.status === 'mastered').length;
    const reviewing = allTopics.filter((t) => t.status === 'reviewing').length;
    const total = allTopics.length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { course, total, mastered, reviewing, pct };
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopic.trim()) return;

    addSession({
      courseId: logCourseId,
      topic: logTopic.trim(),
      durationMinutes: Number(logMinutes) || 30,
      date: logDate,
      mode: logMode,
      notes: logNotes.trim(),
    });

    sound.playTap();
    setLogTopic('');
    setLogNotes('');
    setShowManualLog(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        alert('Data backup imported successfully!');
      } else {
        alert('Invalid data file. Please choose a valid ScholarDeck JSON export.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Study Progress & Quantitative Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track study time allocation, active streaks, syllabus topic mastery, and logged sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualLog(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Session</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Quantitative Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Study Streak */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {profile.streakDays}
            </span>
            <span className="text-xs text-slate-500">consecutive days</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {last7Days.map((d, idx) => (
              <div
                key={idx}
                title={`${d.label}: ${d.minutes} mins`}
                className={`flex-1 h-1.5 rounded-full ${
                  d.minutes > 0 ? 'bg-amber-500' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* KPI 2: Today's Focus */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Today's Study</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatMinutes(todayMinutesStudied)}
            </span>
            <span className="text-xs text-slate-500">/ {formatMinutes(profile.dailyGoalMinutes)} goal</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              style={{
                width: `${Math.min(100, Math.round((todayMinutesStudied / profile.dailyGoalMinutes) * 100))}%`,
              }}
              className="h-full bg-indigo-600 transition-all duration-300"
            />
          </div>
        </div>

        {/* KPI 3: 7-Day Total Hours */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Past 7 Days Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatMinutes(weekTotalMinutes)}
            </span>
            <span className="text-xs text-slate-500">logged</span>
          </div>
          <span className="block text-[11px] text-slate-400 mt-2 font-mono">
            All-time: {formatMinutes(overallTotalMinutes)}
          </span>
        </div>

        {/* KPI 4: Overall Syllabus Mastery */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Syllabus Topics Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {overallMasteryPercentage}%
            </span>
            <span className="text-xs text-slate-500">overall readiness</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              style={{ width: `${overallMasteryPercentage}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Daily Study Time Bar Chart */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Study Time Activity</h3>
              <p className="text-xs text-slate-500">Daily logged duration (minutes)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-600 tabular-nums">
              {formatMinutes(weekTotalMinutes)} this week
            </span>
          </div>

          {/* SVG Bar Chart with Tabular Numbers */}
          <div className="pt-4">
            <div className="flex items-end justify-between gap-2 h-44 border-b border-slate-200 pb-2">
              {last7Days.map((day, idx) => {
                const heightPercent = maxDailyMinutes > 0 ? (day.minutes / maxDailyMinutes) * 100 : 0;
                const isToday = idx === 6;

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                      {day.minutes}m
                    </span>
                    <div
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                      className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                        isToday ? 'bg-indigo-600' : day.minutes > 0 ? 'bg-indigo-400/80' : 'bg-slate-100'
                      }`}
                    />
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isToday ? 'text-indigo-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Course Time Distribution & Mastery Breakdown */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Course Syllabus Mastery</h3>
              <p className="text-xs text-slate-500">Readiness breakdown per subject</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {courseMasteryList.map(({ course, total, mastered, reviewing, pct }) => {
              const theme = getCourseTheme(course.color);
              const minutes = courseTimeMap[course.id] || 0;

              return (
                <div key={course.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${theme.text}`}>{course.code}</span>
                      <span className="text-slate-600 truncate max-w-[140px] sm:max-w-[200px]">
                        {course.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                      <span className="text-slate-500">{formatMinutes(minutes)} studied</span>
                      <span className="font-semibold text-slate-900">{pct}% Ready</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300"
                    />
                    <div
                      style={{
                        width: `${total > 0 ? (reviewing / total) * 100 : 0}%`,
                      }}
                      className="h-full bg-amber-400 transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>
                      {mastered} Mastered · {reviewing} Reviewing · {total - mastered - reviewing} Left
                    </span>
                    <span>{total} Total Topics</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Study Session Log Table */}
      <div className="p-5 bg-white border border-slate-200/80 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Study Session History</h3>
            <p className="text-xs text-slate-500">Comprehensive log of focus blocks and manual entries</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{sessions.length} sessions logged</span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No study sessions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-2.5 px-3 font-normal">Date</th>
                  <th className="py-2.5 px-3 font-normal">Course</th>
                  <th className="py-2.5 px-3 font-normal">Topic / Objective</th>
                  <th className="py-2.5 px-3 font-normal">Mode</th>
                  <th className="py-2.5 px-3 font-normal text-right">Duration</th>
                  <th className="py-2.5 px-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => {
                  const course = courses.find((c) => c.id === sess.courseId);
                  const theme = getCourseTheme(course?.color);

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                        {sess.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800 block truncate max-w-xs">{sess.topic}</span>
                        {sess.notes && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">{sess.notes}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-500 whitespace-nowrap">
                        {sess.mode.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                        {formatMinutes(sess.durationMinutes)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteSession(sess.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Management & Backup Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-slate-800 block">Data Backup & Local Persistence</span>
          <span className="text-slate-500 text-[11px]">
            Your study notes, schedules, and logs are automatically saved locally on this device.
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportDataJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to initial sample course notes and exams?')) {
                resetToSampleData();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Samples</span>
          </button>
        </div>
      </div>

      {/* Manual Study Log Modal */}
      {showManualLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Log Offline Study Session</h3>
              <button
                type="button"
                onClick={() => setShowManualLog(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
                <select
                  value={logCourseId}
                  onChange={(e) => setLogCourseId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Topic / Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 6 Problem Set on Eigenvalues"
                  value={logTopic}
                  onChange={(e) => setLogTopic(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Study Mode</label>
                <select
                  value={logMode}
                  onChange={(e) => setLogMode(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="deep_work">Deep Work / Problem Solving</option>
                  <option value="pomodoro">Pomodoro Session</option>
                  <option value="review">Flashcards & Concept Review</option>
                  <option value="manual">Class Lecture / Lab Session</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Reflection (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="What key concept clicked today?"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualLog(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
