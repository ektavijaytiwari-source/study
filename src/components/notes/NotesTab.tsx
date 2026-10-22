import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { NoteEditorModal } from './NoteEditorModal';
import {
  Search,
  Plus,
  Pin,
  Layers,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { getCourseTheme } from '../../utils/formatters';

export const NotesTab: React.FC = () => {
  const { notes, courses, togglePinNote, setStudyDeckNoteId, selectedCourseId, setSelectedCourseId } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeEditingNoteId, setActiveEditingNoteId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedCourseId && n.courseId !== selectedCourseId) return false;
    if (selectedTag && !n.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      const matchUnit = n.unit.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchTags && !matchUnit) return false;
    }
    return true;
  });

  // Sort pinned first, then by updatedAt desc
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Study Notes & Materials</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized lecture notes, formula sheets, active recall decks, and course attachments
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by concept, title, proof, or equation..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>

        {/* Interactive Filter Tabs for Course Selection (Button controls per design guidelines) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCourseId(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
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

      {/* Tag Filter Strip (if tags exist) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-500 py-1">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Topic Tags:</span>
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="text-xs font-medium text-indigo-600 underline cursor-pointer whitespace-nowrap"
            >
              Clear tag filter
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-indigo-100 text-indigo-800 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No notes matched your query</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search keywords, clearing filters, or adding a new study note.
          </p>
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Create New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedNotes.map((note) => {
            const course = courses.find((c) => c.id === note.courseId);
            const theme = getCourseTheme(course?.color);

            return (
              <div
                key={note.id}
                className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div>
                  {/* Clean unboxed metadata with typographic separators (Strict Zero-Pill) */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold ${theme.text}`}>{course?.code || 'Course'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[180px]">{note.unit || 'General Notes'}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePinNote(note.id)}
                      title={note.isPinned ? 'Unpin' : 'Pin note'}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Note Title */}
                  <h3
                    onClick={() => setActiveEditingNoteId(note.id)}
                    className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer mb-2 line-clamp-2"
                  >
                    {note.title}
                  </h3>

                  {/* Clean content preview */}
                  <p
                    onClick={() => setActiveEditingNoteId(note.id)}
                    className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed cursor-pointer font-normal"
                  >
                    {note.content.replace(/#|\*|`|\$|>/g, '')}
                  </p>

                  {/* Clean unboxed tags */}
                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4 flex-wrap">
                      {note.tags.map((t, idx) => (
                        <span key={idx}>
                          #{t}
                          {idx < note.tags.length - 1 ? <span className="ml-2 text-slate-300">·</span> : null}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Metadata counts */}
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    {note.flashcards.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{note.flashcards.length} cards</span>
                      </span>
                    )}
                    {note.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{note.attachments.length} files</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {note.flashcards.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setStudyDeckNoteId(note.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                      >
                        Practice
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveEditingNoteId(note.id)}
                      className="px-3 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      Open Note
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {(activeEditingNoteId !== null || isCreatingNew) && (
        <NoteEditorModal
          noteId={activeEditingNoteId}
          initialCourseId={selectedCourseId || undefined}
          onClose={() => {
            setActiveEditingNoteId(null);
            setIsCreatingNew(false);
          }}
        />
      )}
    </div>
  );
};
