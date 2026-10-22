import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Exam } from '../../types';
import { X, Calendar, Plus, Trash2 } from 'lucide-react';

interface AddExamModalProps {
  examToEdit?: Exam | null;
  onClose: () => void;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({ examToEdit, onClose }) => {
  const { courses, addExam, updateExam } = useStudy();

  const [courseId, setCourseId] = useState(examToEdit?.courseId || courses[0]?.id || '');
  const [title, setTitle] = useState(examToEdit?.title || '');
  const [examDate, setExamDate] = useState(
    examToEdit?.examDate ? examToEdit.examDate.substring(0, 16) : new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 16)
  );
  const [location, setLocation] = useState(examToEdit?.location || '');
  const [type, setType] = useState<Exam['type']>(examToEdit?.type || 'Midterm');
  const [weight, setWeight] = useState(examToEdit?.weight || 25);
  const [targetGrade, setTargetGrade] = useState(examToEdit?.targetGrade || '90%');
  const [priority, setPriority] = useState<Exam['priority']>(examToEdit?.priority || 'high');
  const [notes, setNotes] = useState(examToEdit?.notes || '');

  // Pre-seed initial topics if new
  const [topicInputs, setTopicInputs] = useState<Array<{ id: string; topic: string; estimatedHours: number }>>(
    examToEdit?.syllabusTopics.map((t) => ({ id: t.id, topic: t.topic, estimatedHours: t.estimatedHours })) || [
      { id: '1', topic: 'Core Concepts & Theory Review', estimatedHours: 3 },
      { id: '2', topic: 'Practice Exam Problems & Past Papers', estimatedHours: 4 },
    ]
  );

  const handleAddTopicRow = () => {
    setTopicInputs((prev) => [...prev, { id: String(Date.now()), topic: '', estimatedHours: 2 }]);
  };

  const handleRemoveTopicRow = (id: string) => {
    setTopicInputs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examDate) return;

    const formattedTopics = topicInputs
      .filter((t) => t.topic.trim().length > 0)
      .map((t) => ({
        id: t.id.startsWith('top-') ? t.id : `top-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        topic: t.topic.trim(),
        status: 'not_started' as const,
        estimatedHours: t.estimatedHours || 2,
      }));

    if (examToEdit) {
      updateExam(examToEdit.id, {
        courseId,
        title: title.trim(),
        examDate,
        location: location.trim(),
        type,
        weight: Number(weight) || 20,
        targetGrade: targetGrade.trim(),
        priority,
        notes: notes.trim(),
      });
    } else {
      addExam({
        courseId,
        title: title.trim(),
        examDate,
        location: location.trim(),
        type,
        weight: Number(weight) || 20,
        targetGrade: targetGrade.trim(),
        priority,
        notes: notes.trim(),
        completed: false,
        syllabusTopics: formattedTopics,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {examToEdit ? 'Edit Exam / Assessment' : 'Schedule New Exam'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Set date, syllabus topics, and target grade</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Midterm">Midterm Exam</option>
                <option value="Final">Final Examination</option>
                <option value="Quiz">Quiz / Test</option>
                <option value="Practical">Lab / Practical</option>
                <option value="Assignment">Major Assignment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm 2: Pipelining & Cache Coherence"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Exam Date & Time</label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location / Proctor</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hall 104 or ProctorTrack"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Weight (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Score</label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="e.g. 92%"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium capitalize"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Initial Syllabus Topics */}
          {!examToEdit && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">Initial Syllabus Topics</label>
                <button
                  type="button"
                  onClick={handleAddTopicRow}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>

              <div className="space-y-2">
                {topicInputs.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Topic ${index + 1}`}
                      value={row.topic}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTopicInputs((prev) =>
                          prev.map((item) => (item.id === row.id ? { ...item, topic: val } : item))
                        );
                      }}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={row.estimatedHours}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTopicInputs((prev) =>
                          prev.map((item) => (item.id === row.id ? { ...item, estimatedHours: val } : item))
                        );
                      }}
                      className="w-14 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono"
                      title="Estimated study hours"
                    />
                    <span className="text-[11px] text-slate-400">h</span>
                    {topicInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTopicRow(row.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Permitted Materials</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1 cheat sheet allowed, bring scientific calculator..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              {examToEdit ? 'Update Exam' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
