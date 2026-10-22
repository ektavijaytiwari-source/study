import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { sound } from '../../utils/audio';
import { X, Play, Pause, RotateCcw, CheckCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { getCourseTheme } from '../../utils/formatters';

export const FocusTimerModal: React.FC = () => {
  const {
    isFocusModalOpen,
    setIsFocusModalOpen,
    courses,
    focusCourseId,
    setFocusCourseId,
    focusTopic,
    setFocusTopic,
    addSession,
  } = useStudy();

  const [mode, setMode] = useState<'pomodoro' | 'deep_work' | 'review'>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  // Set initial time when mode changes
  const handleModeChange = (newMode: 'pomodoro' | 'deep_work' | 'review') => {
    setMode(newMode);
    setIsRunning(false);
    let mins = 25;
    if (newMode === 'deep_work') mins = 50;
    if (newMode === 'review') mins = 15;
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            sound.playCompletionChime();
            setCompletedSuccess(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Ambient sound toggle
  const toggleSound = () => {
    const isNowPlaying = sound.toggleAmbient('rain');
    setAmbientSound(isNowPlaying);
  };

  const handleClose = () => {
    if (ambientSound) {
      sound.stopAmbient();
      setAmbientSound(false);
    }
    setIsFocusModalOpen(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setCompletedSuccess(false);
  };

  const handleLogCompletedSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    addSession({
      courseId: focusCourseId || courses[0]?.id || '',
      topic: focusTopic.trim() || 'General Study & Review',
      durationMinutes: elapsedMinutes,
      date: new Date().toISOString().split('T')[0],
      mode: mode,
      notes: `Focus session concluded with ${elapsedMinutes} minutes dedicated time.`,
    });
    sound.playTap();
    handleClose();
  };

  if (!isFocusModalOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const selectedCourse = courses.find((c) => c.id === focusCourseId) || courses[0];
  const theme = getCourseTheme(selectedCourse?.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Deep Work & Focus Timer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Stay locked in with structured study blocks</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              title={ambientSound ? 'Mute ambient rain' : 'Play ambient rain focus noise'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                ambientSound
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Mode Selector - Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('pomodoro')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('deep_work')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'deep_work'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deep Work (50m)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('review')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'review'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quick Sprint (15m)
            </button>
          </div>

          {/* Context Target: Course & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Course</label>
              <select
                value={focusCourseId}
                onChange={(e) => setFocusCourseId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Study Objective / Topic</label>
              <input
                type="text"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                placeholder="e.g. Pipeline Hazard Forwarding"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Central Timer Circular Display */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative flex items-center justify-center w-52 h-52">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  strokeWidth="5"
                  className="stroke-slate-100"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  strokeWidth="5"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (progressPercent / 100) * 276.46}
                  strokeLinecap="round"
                  className="stroke-indigo-600 transition-all duration-300"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1">
                  {isRunning ? 'Focus Mode Active' : secondsLeft === 0 ? 'Block Finished!' : 'Ready to begin'}
                </span>
              </div>
            </div>
          </div>

          {/* Audio ambient indicator */}
          {ambientSound && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 mb-4 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Playing gentle rain ambient noise</span>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleReset}
              title="Reset Timer"
              className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setIsRunning(!isRunning);
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{secondsLeft === totalSeconds ? 'Start Session' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogCompletedSession}
              title="Log Study Time to History"
              className="flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log Now</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active Course: <strong className="text-slate-800">{selectedCourse?.code}</strong></span>
          <span>Target: {focusTopic || 'General Study'}</span>
        </div>
      </div>
    </div>
  );
};
