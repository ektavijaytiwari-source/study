import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { StudyNote, MaterialAttachment, Flashcard } from '../../types';
import {
  X,
  Pin,
  Save,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Code,
  List,
  Heading2,
  FileText,
  Bold,
  Italic,
  Eye,
  Edit3,
} from 'lucide-react';

interface NoteEditorModalProps {
  noteId: string | null; // null if creating a new note
  initialCourseId?: string;
  onClose: () => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ noteId, initialCourseId, onClose }) => {
  const { notes, courses, addNote, updateNote, deleteNote, setStudyDeckNoteId } = useStudy();

  const existingNote = notes.find((n) => n.id === noteId);

  const [courseId, setCourseId] = useState(existingNote?.courseId || initialCourseId || courses[0]?.id || '');
  const [title, setTitle] = useState(existingNote?.title || '');
  const [unit, setUnit] = useState(existingNote?.unit || '');
  const [tagsInput, setTagsInput] = useState(existingNote?.tags.join(', ') || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [isPinned, setIsPinned] = useState(existingNote?.isPinned || false);
  const [attachments, setAttachments] = useState<MaterialAttachment[]>(existingNote?.attachments || []);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(existingNote?.flashcards || []);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // New attachment inline inputs
  const [newAttTitle, setNewAttTitle] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [newAttType, setNewAttType] = useState<'pdf' | 'slides' | 'link' | 'textbook'>('pdf');
  const [showAddAtt, setShowAddAtt] = useState(false);

  // Markdown helper buttons
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (existingNote) {
      updateNote(existingNote.id, {
        courseId,
        title: title.trim(),
        unit: unit.trim(),
        tags,
        content,
        isPinned,
        attachments,
        flashcards,
      });
    } else {
      addNote({
        courseId,
        title: title.trim(),
        unit: unit.trim(),
        tags,
        content,
        isPinned,
        attachments,
        flashcards,
      });
    }

    onClose();
  };

  const handleAddAttachment = () => {
    if (!newAttTitle.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        title: newAttTitle.trim(),
        url: newAttUrl.trim() || 'https://faculty.edu/readings',
        type: newAttType,
      },
    ]);
    setNewAttTitle('');
    setNewAttUrl('');
    setShowAddAtt(false);
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleExportMarkdown = () => {
    const textData = `# ${title}\nCourse: ${courseId}\nUnit: ${unit}\nTags: ${tagsInput}\n\n${content}`;
    const blob = new Blob([textData], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'study-note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">
              {existingNote ? 'Edit Study Note' : 'Create New Study Note'}
            </span>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPinned ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Pin className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {existingNote && (
              <button
                type="button"
                onClick={handleExportMarkdown}
                title="Export as Markdown file"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Formatted</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          {/* Metadata Bar */}
          <div className="p-6 pb-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course / Subject</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Module / Unit / Chapter</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Unit 3: Instruction Pipelines"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Hazards, Forwarding, Midterm"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5-Stage RISC Pipeline Hazards & Forwarding Paths"
                className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Editor or Preview Pane */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {viewMode === 'edit' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Markdown Formatting Toolbar */}
                <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Bullet list"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```\n', '\n```')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Code block"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                    title="Callout quote"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('$$ ', ' $$')}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors font-mono font-bold text-[11px]"
                    title="Formula block"
                  >
                    fx
                  </button>
                  <span className="text-slate-300 mx-1">|</span>
                  <span className="text-[11px] text-slate-400">Markdown formatting enabled</span>
                </div>

                <textarea
                  id="note-content-area"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your lecture notes, summaries, formulas, and proofs here..."
                  className="flex-1 w-full p-6 text-sm text-slate-800 leading-relaxed font-sans placeholder:text-slate-400 focus:outline-none resize-none overflow-y-auto"
                />
              </div>
            ) : (
              <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed">
                {content ? (
                  <div className="whitespace-pre-wrap font-sans space-y-3">{content}</div>
                ) : (
                  <p className="text-slate-400 italic">No notes content written yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Attachments & Study Material Links Section */}
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Reference Materials & Attachments ({attachments.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddAtt(!showAddAtt)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Material Link</span>
              </button>
            </div>

            {showAddAtt && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg mb-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Material Title (e.g. Lecture 12 Slides)"
                  value={newAttTitle}
                  onChange={(e) => setNewAttTitle(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="URL link"
                  value={newAttUrl}
                  onChange={(e) => setNewAttUrl(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newAttType}
                    onChange={(e) => setNewAttType(e.target.value as any)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="slides">Slides</option>
                    <option value="pdf">PDF</option>
                    <option value="textbook">Textbook</option>
                    <option value="link">Web Link</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <span className="font-medium">{att.title}</span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-100">
            <div>
              {existingNote && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this study note?')) {
                      deleteNote(existingNote.id);
                      onClose();
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Delete Note
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {existingNote && existingNote.flashcards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStudyDeckNoteId(existingNote.id);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  Practice Flashcards ({existingNote.flashcards.length})
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
