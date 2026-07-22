'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Tag input — type a tag and press Enter / comma to add; Backspace on an empty
 * field removes the last tag. Used for resource tags.
 */
export function TagInput({
  value,
  onChange,
  placeholder = 'Add tag and press Enter',
  id,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        'flex min-h-11 flex-wrap items-center gap-1.5 rounded-xs border border-fg/15 bg-canvas/60 px-2 py-1.5',
        'focus-within:border-mint focus-within:ring-1 focus-within:ring-mint transition-colors',
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} tone="mint" className="gap-1 py-1">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="rounded-full p-0.5 hover:bg-fg/10"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length ? '' : placeholder}
        className="h-7 min-w-[8rem] flex-1 bg-transparent font-sans text-sm text-fg outline-none placeholder:text-fg-secondary"
      />
    </div>
  );
}
