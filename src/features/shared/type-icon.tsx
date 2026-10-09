import {
  BookText,
  FileText,
  FileType,
  FileType2,
  FlaskConical,
  Github,
  Globe,
  Instagram,
  ScrollText,
  Youtube,
} from 'lucide-react';
import type { ElementType, CSSProperties } from 'react';
import type { ResourceType } from '@/lib/types';

export interface TypeMeta {
  icon: ElementType;
  /** Tailwind text colour for the icon. */
  color: string;
  /** Hex used for saturated tint backgrounds. */
  tint: string;
}

const SubstackIcon = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect width="24" height="24" rx="4" fill="currentColor" />
    <path d="M6 5.5h12v2H6V5.5zm0 3.5h12v2H6V9zm0 3.5h12v6l-6-3.5-6 3.5v-6z" fill="white" />
  </svg>
);

const LinkedInIcon = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect width="24" height="24" rx="4" fill="currentColor" />
    <path d="M7.5 9.5h2.5v9h-2.5v-9zM8.75 8c-.8 0-1.25-.5-1.25-1.25s.45-1.25 1.25-1.25 1.25.5 1.25 1.25-.45 1.25-1.25 1.25zM11.5 9.5h2.5v1.2c.4-.6 1.1-1.2 2.2-1.2 2.2 0 2.8 1.4 2.8 3.5v5.5h-2.5v-5c0-.9-.1-2-1.4-2s-1.6.9-1.6 2v5h-2.5v-9z" fill="white" />
  </svg>
);

/** Visual identity per resource type (icon + accent colour). */
export const RESOURCE_TYPE_META: Record<ResourceType, TypeMeta> = {
  GitHub: { icon: Github, color: 'text-fg', tint: '#8b949e' },
  PDF: { icon: FileText, color: 'text-danger', tint: '#ff6ec7' },
  Documentation: { icon: BookText, color: 'text-info', tint: '#2f6bff' },
  YouTube: { icon: Youtube, color: 'text-danger', tint: '#ff4d4d' },
  Instagram: { icon: Instagram, color: 'text-tile-pink', tint: '#ff6ec7' },
  LinkedIn: { icon: LinkedInIcon, color: 'text-info', tint: '#0a66c2' },
  Substack: { icon: SubstackIcon, color: 'text-tile-orange', tint: '#ff6719' },
  Website: { icon: Globe, color: 'text-mint', tint: '#3cffd0' },
  'Research Paper': { icon: FlaskConical, color: 'text-violet', tint: '#5200ff' },
  DOC: { icon: FileType, color: 'text-tile-blue', tint: '#2f6bff' },
  DOCX: { icon: FileType2, color: 'text-tile-blue', tint: '#2f6bff' },
  Other: { icon: ScrollText, color: 'text-fg-secondary', tint: '#949494' },
};

export function ResourceTypeIcon({
  type,
  className,
}: {
  type: ResourceType;
  className?: string;
}) {
  const meta = RESOURCE_TYPE_META[type] ?? RESOURCE_TYPE_META.Other;
  const Icon = meta.icon;
  return <Icon className={className} style={{ color: meta.tint }} />;
}
