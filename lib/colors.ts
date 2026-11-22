export type ColorName =
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'sky'
  | 'slate';

export interface ColorTokens {
  dot: string;
  badge: string;
  bar: string;
  ring: string;
  soft: string;
  text: string;
  avatarBg: string;
  solid: string;
  headerBg: string;
  columnBg: string;
  border: string;
  css: string;
}

// NOTE: class names are string literals on purpose. Tailwind only generates
// CSS for classes it sees as literal source, so dynamic class construction
// (like 'bg-' + color + '-500') ends up unstyled at runtime.
export const colorMap: Record<ColorName, ColorTokens> = {
  emerald: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    soft: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    avatarBg: 'bg-emerald-700 text-white',
    solid: 'bg-emerald-500',
    headerBg: 'bg-emerald-500/10',
    columnBg: 'bg-emerald-500/5',
    border: 'border-emerald-500/30',
    css: '#10b981',
  },
  violet: {
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30',
    bar: 'bg-violet-500',
    ring: 'ring-violet-500/20',
    soft: 'bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
    avatarBg: 'bg-violet-700 text-white',
    solid: 'bg-violet-500',
    headerBg: 'bg-violet-500/10',
    columnBg: 'bg-violet-500/5',
    border: 'border-violet-500/30',
    css: '#8b5cf6',
  },
  amber: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    bar: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    soft: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    avatarBg: 'bg-amber-700 text-white',
    solid: 'bg-amber-500',
    headerBg: 'bg-amber-500/10',
    columnBg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    css: '#f59e0b',
  },
  rose: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    bar: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    soft: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    avatarBg: 'bg-rose-700 text-white',
    solid: 'bg-rose-500',
    headerBg: 'bg-rose-500/10',
    columnBg: 'bg-rose-500/5',
    border: 'border-rose-500/30',
    css: '#f43f5e',
  },
  cyan: {
    dot: 'bg-cyan-500',
    badge: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
    bar: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
    soft: 'bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-300',
    avatarBg: 'bg-cyan-700 text-white',
    solid: 'bg-cyan-500',
    headerBg: 'bg-cyan-500/10',
    columnBg: 'bg-cyan-500/5',
    border: 'border-cyan-500/30',
    css: '#06b6d4',
  },
  orange: {
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
    bar: 'bg-orange-500',
    ring: 'ring-orange-500/20',
    soft: 'bg-orange-500/10',
    text: 'text-orange-700 dark:text-orange-300',
    avatarBg: 'bg-orange-700 text-white',
    solid: 'bg-orange-500',
    headerBg: 'bg-orange-500/10',
    columnBg: 'bg-orange-500/5',
    border: 'border-orange-500/30',
    css: '#f97316',
  },
  teal: {
    dot: 'bg-teal-500',
    badge: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30',
    bar: 'bg-teal-500',
    ring: 'ring-teal-500/20',
    soft: 'bg-teal-500/10',
    text: 'text-teal-700 dark:text-teal-300',
    avatarBg: 'bg-teal-700 text-white',
    solid: 'bg-teal-500',
    headerBg: 'bg-teal-500/10',
    columnBg: 'bg-teal-500/5',
    border: 'border-teal-500/30',
    css: '#14b8a6',
  },
  pink: {
    dot: 'bg-pink-500',
    badge: 'bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-500/30',
    bar: 'bg-pink-500',
    ring: 'ring-pink-500/20',
    soft: 'bg-pink-500/10',
    text: 'text-pink-700 dark:text-pink-300',
    avatarBg: 'bg-pink-700 text-white',
    solid: 'bg-pink-500',
    headerBg: 'bg-pink-500/10',
    columnBg: 'bg-pink-500/5',
    border: 'border-pink-500/30',
    css: '#ec4899',
  },
  sky: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    bar: 'bg-sky-500',
    ring: 'ring-sky-500/20',
    soft: 'bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
    avatarBg: 'bg-sky-700 text-white',
    solid: 'bg-sky-500',
    headerBg: 'bg-sky-500/10',
    columnBg: 'bg-sky-500/5',
    border: 'border-sky-500/30',
    css: '#0ea5e9',
  },
  slate: {
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30',
    bar: 'bg-slate-500',
    ring: 'ring-slate-500/20',
    soft: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    avatarBg: 'bg-slate-700 text-white',
    solid: 'bg-slate-500',
    headerBg: 'bg-slate-500/10',
    columnBg: 'bg-slate-500/5',
    border: 'border-slate-500/30',
    css: '#64748b',
  },
};

export const statusColorMap: Record<string, ColorName> = {
  TODO: 'slate',
  IN_PROGRESS: 'amber',
  REVIEW: 'violet',
  DONE: 'emerald',
};

export const priorityColorMap: Record<string, ColorName> = {
  LOW: 'slate',
  MEDIUM: 'sky',
  HIGH: 'orange',
  URGENT: 'rose',
};

export function getColorTokens(color: string): ColorTokens {
  return colorMap[color as ColorName] || colorMap.emerald;
}

export function getStatusColor(status: string): ColorName {
  return statusColorMap[status] || 'slate';
}

export function getPriorityColor(priority: string): ColorName {
  return priorityColorMap[priority] || 'slate';
}

export function getProjectAccent(color: string) {
  const tokens = getColorTokens(color);
  return {
    headerBg: tokens.headerBg,
    headerText: tokens.text,
    headerBorder: tokens.border,
    columnBg: tokens.columnBg,
    columnText: tokens.text,
    columnBorder: tokens.border,
    solidBg: tokens.solid,
    solidText: 'text-white',
    css: tokens.css,
    dot: tokens.dot,
    badge: tokens.badge,
    soft: tokens.soft,
    ring: tokens.ring,
    avatarBg: tokens.avatarBg,
  };
}

export const availableColors: ColorName[] = ['emerald', 'violet', 'amber', 'rose', 'cyan', 'orange', 'teal', 'pink', 'sky', 'slate'];
