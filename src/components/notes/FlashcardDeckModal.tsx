import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { sound } from '../../utils/audio';
import { X, RotateCw, CheckCircle, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getCourseTheme } from '../../utils/formatters';

export const FlashcardDeckModal: React.FC = () => {
  const { studyDeckNoteId, setStudyDeckNoteId, notes, courses, updateFlashcardMastery, addFlashcardToNote, deleteFlashcardFromNote } = useStudy();

  const note = notes.find((n) => n.id === studyDeckNoteId);
  const course = courses.find((c) => c.id === note?.courseId);
  const theme = getCourseTheme(course?.color);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  // Reset when opened
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAddingCard(false);
  }, [studyDeckNoteId]);

  if (!note || !studyDeckNoteId) return null;

  const cards = note.flashcards;
  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    sound.playTap();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleScore = (mastery: 'new' | 'learning' | 'mastered') => {
    if (currentCard) {
      updateFlashcardMastery(note.id, currentCard.id, mastery);
      sound.playTap();
      if (currentIndex === cards.length - 1) {
        sound.playCompletionChime();
      }
      handleNext();
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    addFlashcardToNote(note.id, {
      front: newFront.trim(),
      back: newBack.trim(),
      mastery: 'new',
    });
    setNewFront('');
    setNewBack('');
    setIsAddingCard(false);
    sound.playTap();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>{course?.code || 'Course'}</span>
              <span aria-hidden="true">·</span>
              <span>Active Recall Deck</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 truncate max-w-md">{note.title}</h3>
          </div>
          <button
            type="button"
            onClick={() => setStudyDeckNoteId(null)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {cards.length === 0 && !isAddingCard ? (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-slate-700">No flashcards in this note yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Add key questions and definitions to test your retention.</p>
              <button
                type="button"
                onClick={() => setIsAddingCard(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Flashcard</span>
              </button>
            </div>
          ) : isAddingCard ? (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Add New Concept Card</h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Front: Question / Prompt</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the rate determining step in EAS?"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Back: Answer / Explanation</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Formation of the arenium ion sigma complex..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Progress & Deck Status */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono">
                <span>
                  Card <strong className="text-slate-900 font-semibold">{currentIndex + 1}</strong> of {cards.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs capitalize">
                    Status: <strong className="text-slate-800">{currentCard?.mastery || 'new'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this flashcard?')) {
                        deleteFlashcardFromNote(note.id, currentCard.id);
                        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                      }
                    }}
                    title="Delete card"
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Flip Card Container */}
              <div
                onClick={handleFlip}
                className="relative min-h-[220px] p-6 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xs select-none"
              >
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    {isFlipped ? 'Answer' : 'Question / Concept'}
                  </span>
                  <div className="mt-3 text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click anywhere to flip</span>
                  </span>
                  <span className="font-mono text-[11px]">Space to Flip</span>
                </div>
              </div>

              {/* Rating Controls (Shown when card is flipped) */}
              {isFlipped ? (
                <div className="mt-5 space-y-2">
                  <span className="block text-center text-xs font-medium text-slate-500">How well did you know this?</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleScore('new')}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                    >
                      Again (Hard)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScore('learning')}
                      className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition-colors cursor-pointer"
                    >
                      Good (Need Review)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScore('mastered')}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      Mastered (Easy)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFlip}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm cursor-pointer"
                  >
                    Reveal Answer
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with quick Add Card */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {cards.filter((c) => c.mastery === 'mastered').length} of {cards.length} Mastered
          </span>
          {!isAddingCard && (
            <button
              type="button"
              onClick={() => setIsAddingCard(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
