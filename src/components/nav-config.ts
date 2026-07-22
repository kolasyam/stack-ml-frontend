import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Mono kicker shown above the heading on the page. */
  kicker: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, kicker: 'Overview' },
  { label: 'Resources', href: '/resources', icon: BookOpen, kicker: 'Library' },
  { label: 'Todos', href: '/todos', icon: CheckSquare, kicker: 'Personal Learning' },
  { label: 'Notes', href: '/notes', icon: StickyNote, kicker: 'Work Tasks' },
];
