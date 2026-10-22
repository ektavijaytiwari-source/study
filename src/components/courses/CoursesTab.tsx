import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Course, CourseColor } from '../../types';
import { sound } from '../../utils/audio';
import { Plus, Edit2, Trash2, BookOpen, Calendar, Clock, User, X } from 'lucide-react';
import { getCourseTheme, formatMinutes } from '../../utils/formatters';

export const CoursesTab: React.FC = () => {
  const { courses, notes, exams, sessions, addCourse, updateCourse, deleteCourse, setActiveTab, setSelectedCourseId } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState<CourseColor>('indigo');
  const [instructor, setInstructor] = useState('');
  const [schedule, setSchedule] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [credits, setCredits] = useState(4);

  const openCreateModal = () => {
    setCourseToEdit(null);
    setName('');
    setCode('');
    setColor('indigo');
    setInstructor('');
    setSchedule('');
    setTerm('Fall 2026');
    setCredits(4);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setCourseToEdit(c);
    setName(c.name);
    setCode(c.code);
    setColor(c.color);
    setInstructor(c.instructor);
    setSchedule(c.schedule);
    setTerm(c.term);
    setCredits(c.credits);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (courseToEdit) {
      updateCourse(courseToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        instructor: instructor.trim(),
        schedule: schedule.trim(),
        term: term.trim(),
        credits: Number(credits) || 3,
      });
    } else {
      addCourse({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        instructor: instructor.trim(),
        schedule: schedule.trim(),
        term: term.trim(),
        credits: Number(credits) || 3,
      });
    }

    sound.playTap();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Enrolled Courses & Subjects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your academic curriculum, professor contacts, and course schedules
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const theme = getCourseTheme(course.color);
          const courseNotes = notes.filter((n) => n.courseId === course.id);
          const courseExams = exams.filter((e) => e.courseId === course.id);
          const courseMinutes = sessions
            .filter((s) => s.courseId === course.id)
            .reduce((sum, s) => sum + s.durationMinutes, 0);

          return (
            <div
              key={course.id}
              className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div>
                {/* Header line: code · term · credits */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold tracking-tight ${theme.text}`}>{course.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.term}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{course.credits} Credits</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(course)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete course ${course.code}? This will remove its associated notes and exams.`)) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Course Name */}
                <h3 className="text-base font-semibold text-slate-900 mb-3">{course.name}</h3>

                {/* Instructor & Schedule */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.instructor || 'Instructor not listed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.schedule || 'Schedule TBA'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Strip: Course Stats & Quick Links */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span>{courseNotes.length} notes</span>
                  <span aria-hidden="true">·</span>
                  <span>{courseExams.length} exams</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatMinutes(courseMinutes)} studied</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('notes');
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  >
                    View Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveTab('exams');
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                  >
                    Exams
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">
                {courseToEdit ? 'Edit Course Details' : 'Add New Course'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS 310"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase font-bold"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Architecture & Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Instructor / Professor</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. David Miller"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Meeting Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon, Wed 10:00 - 11:30 AM"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Academic Term</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Theme</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value as CourseColor)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium capitalize"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="violet">Violet</option>
                    <option value="rose">Rose</option>
                    <option value="cyan">Cyan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                >
                  {courseToEdit ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
