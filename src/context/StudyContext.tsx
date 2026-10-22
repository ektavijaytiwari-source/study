import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, StudyNote, Exam, StudySession, StudentProfile, Flashcard, MaterialAttachment, SyllabusTopic } from '../types';
import { initialCourses, initialNotes, initialExams, initialSessions, initialProfile } from '../data/mockData';

interface StudyContextType {
  courses: Course[];
  notes: StudyNote[];
  exams: Exam[];
  sessions: StudySession[];
  profile: StudentProfile;
  activeTab: 'dashboard' | 'notes' | 'exams' | 'progress' | 'courses';
  setActiveTab: (tab: 'dashboard' | 'notes' | 'exams' | 'progress' | 'courses') => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  // Note actions
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => StudyNote;
  updateNote: (id: string, note: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  updateFlashcardMastery: (noteId: string, cardId: string, mastery: Flashcard['mastery']) => void;
  addFlashcardToNote: (noteId: string, card: Omit<Flashcard, 'id'>) => void;
  deleteFlashcardFromNote: (noteId: string, cardId: string) => void;
  addAttachmentToNote: (noteId: string, attachment: Omit<MaterialAttachment, 'id'>) => void;
  deleteAttachmentFromNote: (noteId: string, attachmentId: string) => void;
  // Exam actions
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleExamTopicStatus: (examId: string, topicId: string, nextStatus?: SyllabusTopic['status']) => void;
  addSyllabusTopic: (examId: string, topic: Omit<SyllabusTopic, 'id'>) => void;
  deleteSyllabusTopic: (examId: string, topicId: string) => void;
  // Session / Focus actions
  addSession: (session: Omit<StudySession, 'id' | 'completedAt'>) => void;
  deleteSession: (id: string) => void;
  // Global Focus Modal State
  isFocusModalOpen: boolean;
  setIsFocusModalOpen: (open: boolean) => void;
  focusCourseId: string;
  setFocusCourseId: (courseId: string) => void;
  focusTopic: string;
  setFocusTopic: (topic: string) => void;
  // Active Flashcard Deck Modal State
  studyDeckNoteId: string | null;
  setStudyDeckNoteId: (noteId: string | null) => void;
  // Backup / Reset
  resetToSampleData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  // Analytics helpers
  todayMinutesStudied: number;
  overallMasteryPercentage: number;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COURSES: 'scholardeck_courses_v1',
  NOTES: 'scholardeck_notes_v1',
  EXAMS: 'scholardeck_exams_v1',
  SESSIONS: 'scholardeck_sessions_v1',
  PROFILE: 'scholardeck_profile_v1',
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'exams' | 'progress' | 'courses'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Global focus modal
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusCourseId, setFocusCourseId] = useState<string>(initialCourses[0]?.id || '');
  const [focusTopic, setFocusTopic] = useState<string>('Pipelining Review & Datapath');

  // Global flashcard practice modal
  const [studyDeckNoteId, setStudyDeckNoteId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setNotes((prev) => prev.filter((n) => n.courseId !== id));
    setExams((prev) => prev.filter((e) => e.courseId !== id));
    if (selectedCourseId === id) setSelectedCourseId(null);
  };

  // Note actions
  const addNote = (noteData: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>): StudyNote => {
    const timestamp = new Date().toISOString();
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updated: Partial<StudyNote>) => {
    const timestamp = new Date().toISOString();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated, updatedAt: timestamp } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const updateFlashcardMastery = (noteId: string, cardId: string, mastery: Flashcard['mastery']) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          flashcards: n.flashcards.map((fc) =>
            fc.id === cardId ? { ...fc, mastery, lastReviewed: new Date().toISOString() } : fc
          ),
        };
      })
    );
  };

  const addFlashcardToNote = (noteId: string, card: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = {
      ...card,
      id: `fc-${Date.now()}`,
    };
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, flashcards: [...n.flashcards, newCard] } : n))
    );
  };

  const deleteFlashcardFromNote = (noteId: string, cardId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, flashcards: n.flashcards.filter((fc) => fc.id !== cardId) } : n
      )
    );
  };

  const addAttachmentToNote = (noteId: string, attachment: Omit<MaterialAttachment, 'id'>) => {
    const newAttachment: MaterialAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
    };
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, attachments: [...n.attachments, newAttachment] } : n))
    );
  };

  const deleteAttachmentFromNote = (noteId: string, attachmentId: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, attachments: n.attachments.filter((a) => a.id !== attachmentId) } : n
      )
    );
  };

  // Exam actions
  const addExam = (examData: Omit<Exam, 'id'>): Exam => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    setExams((prev) => [newExam, ...prev]);
    return newExam;
  };

  const updateExam = (id: string, updated: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleExamTopicStatus = (examId: string, topicId: string, explicitStatus?: SyllabusTopic['status']) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        return {
          ...e,
          syllabusTopics: e.syllabusTopics.map((t) => {
            if (t.id !== topicId) return t;
            let next: SyllabusTopic['status'] = explicitStatus || 'reviewing';
            if (!explicitStatus) {
              if (t.status === 'not_started') next = 'reviewing';
              else if (t.status === 'reviewing') next = 'mastered';
              else next = 'not_started';
            }
            return { ...t, status: next };
          }),
        };
      })
    );
  };

  const addSyllabusTopic = (examId: string, topic: Omit<SyllabusTopic, 'id'>) => {
    const newTopic: SyllabusTopic = {
      ...topic,
      id: `top-${Date.now()}`,
    };
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, syllabusTopics: [...e.syllabusTopics, newTopic] } : e))
    );
  };

  const deleteSyllabusTopic = (examId: string, topicId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, syllabusTopics: e.syllabusTopics.filter((t) => t.id !== topicId) } : e
      )
    );
  };

  // Session actions
  const addSession = (sessionData: Omit<StudySession, 'id' | 'completedAt'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);

    // Update streak if needed
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      setProfile((p) => ({
        ...p,
        streakDays: p.streakDays + 1,
        lastActiveDate: today,
      }));
    }
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    setCourses(initialCourses);
    setNotes(initialNotes);
    setExams(initialExams);
    setSessions(initialSessions);
    setProfile(initialProfile);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  };

  const exportDataJSON = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      courses,
      notes,
      exams,
      sessions,
      profile,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scholardeck-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.courses) && Array.isArray(data.notes)) {
        setCourses(data.courses);
        setNotes(data.notes);
        if (Array.isArray(data.exams)) setExams(data.exams);
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
        if (data.profile) setProfile(data.profile);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Today study minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutesStudied = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  // Overall syllabus mastery
  const allSyllabusTopics = exams.flatMap((e) => e.syllabusTopics);
  const masteredCount = allSyllabusTopics.filter((t) => t.status === 'mastered').length;
  const overallMasteryPercentage = allSyllabusTopics.length > 0 ? Math.round((masteredCount / allSyllabusTopics.length) * 100) : 0;

  return (
    <StudyContext.Provider
      value={{
        courses,
        notes,
        exams,
        sessions,
        profile,
        activeTab,
        setActiveTab,
        selectedCourseId,
        setSelectedCourseId,
        addCourse,
        updateCourse,
        deleteCourse,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        updateFlashcardMastery,
        addFlashcardToNote,
        deleteFlashcardFromNote,
        addAttachmentToNote,
        deleteAttachmentFromNote,
        addExam,
        updateExam,
        deleteExam,
        toggleExamTopicStatus,
        addSyllabusTopic,
        deleteSyllabusTopic,
        addSession,
        deleteSession,
        isFocusModalOpen,
        setIsFocusModalOpen,
        focusCourseId,
        setFocusCourseId,
        focusTopic,
        setFocusTopic,
        studyDeckNoteId,
        setStudyDeckNoteId,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
        todayMinutesStudied,
        overallMasteryPercentage,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
