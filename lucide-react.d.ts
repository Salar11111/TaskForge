/**
 * lucide-react 0.460 ships no type declarations (its `typings` field points to
 * a file that is not in the package). This module declaration gives the icons
 * we actually use a real component type instead of `any`, so JSX prop typos
 * are still caught by TypeScript.
 */
declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';

  export interface LucideIconProps extends SVGProps<SVGSVGElement> {
    className?: string;
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export type LucideIcon = ComponentType<LucideIconProps>;

  export const AlertCircle: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const Clock: LucideIcon;
  export const Edit: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderKanban: LucideIcon;
  export const Kanban: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const ListTodo: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const Moon: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Plus: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash2: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
}
