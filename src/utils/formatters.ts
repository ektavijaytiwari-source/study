import { CourseColor } from '../types';

export const COURSE_COLOR_MAP: Record<
  CourseColor,
  {
    bg: string;
    text: string;
    border: string;
    accent: string;
    lightBg: string;
    badgeBg: string;
  }
> = {
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: '#4f46e5',
    lightBg: 'bg-indigo-50/70',
    badgeBg: 'bg-indigo-50 text-indigo-700',
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: '#059669',
    lightBg: 'bg-emerald-50/70',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: '#d97706',
    lightBg: 'bg-amber-50/70',
    badgeBg: 'bg-amber-50 text-amber-700',
  },
  violet: {
    bg: 'bg-violet-600',
    text: 'text-violet-700',
    border: 'border-violet-200',
    accent: '#7c3aed',
    lightBg: 'bg-violet-50/70',
    badgeBg: 'bg-violet-50 text-violet-700',
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: '#e11d48',
    lightBg: 'bg-rose-50/70',
    badgeBg: 'bg-rose-50 text-rose-700',
  },
  cyan: {
    bg: 'bg-cyan-600',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    accent: '#0891b2',
    lightBg: 'bg-cyan-50/70',
    badgeBg: 'bg-cyan-50 text-cyan-700',
  },
  sky: {
    bg: 'bg-sky-600',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: '#0284c7',
    lightBg: 'bg-sky-50/70',
    badgeBg: 'bg-sky-50 text-sky-700',
  },
};

export function getCourseTheme(color?: CourseColor) {
  if (!color || !COURSE_COLOR_MAP[color]) {
    return COURSE_COLOR_MAP.indigo;
  }
  return COURSE_COLOR_MAP[color];
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatExamDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export interface CountdownInfo {
  days: number;
  hours: number;
  minutes: number;
  totalSeconds: number;
  isOverdue: boolean;
  formattedText: string;
}

export function getExamCountdown(examDateStr: string): CountdownInfo {
  const target = new Date(examDateStr).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const totalSeconds = Math.floor(absDiff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let formattedText = '';
  if (isOverdue) {
    formattedText = 'Past exam';
  } else if (days > 0) {
    formattedText = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    formattedText = `${hours}h ${minutes}m left`;
  } else {
    formattedText = `${minutes}m left`;
  }

  return { days, hours, minutes, totalSeconds, isOverdue, formattedText };
}
