import {
  BookText,
  FileText,
  FileType,
  FileType2,
  FlaskConical,
  Github,
  Globe,
  Instagram,
  Linkedin,
  ScrollText,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import type { ResourceType } from '@/lib/types';

export interface TypeMeta {
  icon: LucideIcon;
  /** Tailwind text colour for the icon. */
  color: string;
  /** Hex used for saturated tint backgrounds. */
  tint: string;
}

/** Visual identity per resource type (icon + accent colour). */
export const RESOURCE_TYPE_META: Record<ResourceType, TypeMeta> = {
  GitHub: { icon: Github, color: 'text-fg', tint: '#8b949e' },
  PDF: { icon: FileText, color: 'text-danger', tint: '#ff6ec7' },
  Documentation: { icon: BookText, color: 'text-info', tint: '#2f6bff' },
  YouTube: { icon: Youtube, color: 'text-danger', tint: '#ff4d4d' },
  Instagram: { icon: Instagram, color: 'text-tile-pink', tint: '#ff6ec7' },
  LinkedIn: { icon: Linkedin, color: 'text-info', tint: '#2f6bff' },
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
