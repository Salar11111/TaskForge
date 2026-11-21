export type ColorName =
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "cyan"
  | "orange"
  | "teal"
  | "pink"
  | "sky"
  | "slate";

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

function token(color: ColorName, css: string): ColorTokens {
  return {
    dot: `bg-${color}-500`,
    badge: `bg-${color}-500/15 text-${color}-700 dark:text-${color}-300 border-${color}-500/30`,
    bar: `bg-${color}-500`,
    ring: `ring-${color}-500/20`,
    soft: `bg-${color}-500/10`,
    text: `text-${color}-700 dark:text-${color}-300`,
    avatarBg: `bg-${color}-600 text-white`,
    solid: `bg-${color}-500`,
    headerBg: `bg-${color}-500/10`,
    columnBg: `bg-${color}-500/5`,
    border: `border-${color}-500/30`,
    css,
  };
}

export const colorMap: Record<ColorName, ColorTokens> = {
  emerald: token("emerald", "#10b981"),
  violet: token("violet", "#8b5cf6"),
  amber: token("amber", "#f59e0b"),
  rose: token("rose", "#f43f5e"),
  cyan: token("cyan", "#06b6d4"),
  orange: token("orange", "#f97316"),
  teal: token("teal", "#14b8a6"),
  pink: token("pink", "#ec4899"),
  sky: token("sky", "#0ea5e9"),
  slate: token("slate", "#64748b"),
};

export const statusColorMap: Record<string, ColorName> = {
  TODO: "slate",
  IN_PROGRESS: "amber",
  REVIEW: "violet",
  DONE: "emerald",
};

export const priorityColorMap: Record<string, ColorName> = {
  LOW: "slate",
  MEDIUM: "sky",
  HIGH: "orange",
  URGENT: "rose",
};

export function getColorTokens(color: string): ColorTokens {
  return colorMap[color as ColorName] || colorMap.emerald;
}

export function getStatusColor(status: string): ColorName {
  return statusColorMap[status] || "slate";
}

export function getPriorityColor(priority: string): ColorName {
  return priorityColorMap[priority] || "slate";
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
    solidText: "text-white",
    css: tokens.css,
    dot: tokens.dot,
    badge: tokens.badge,
    soft: tokens.soft,
    ring: tokens.ring,
    avatarBg: tokens.avatarBg,
  };
}

export const availableColors: ColorName[] = [
  "emerald",
  "violet",
  "amber",
  "rose",
  "cyan",
  "orange",
  "teal",
  "pink",
];
