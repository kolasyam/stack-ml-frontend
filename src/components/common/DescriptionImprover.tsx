'use client';

import * as React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDescriptionImprover } from './use-description-improver';

const EMPTY_MESSAGE = 'Enter a description to improve.';

interface DescriptionImproverProps {
  /** Current field value (controlled). */
  value: string;
  /** Called with the improved (replacing) text. */
  onChange: (value: string) => void;
  /** Disable both the textarea and the button (e.g. while the form submits). */
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

/**
 * DescriptionImprover — a drop-in replacement for a plain `<Textarea>` that adds
 * a contextual Grammarify "Improve" action.
 *
 * Reusable across every Description field (Resource / Todo / Note forms):
 *  - The ✨ Improve button appears only when the field has non-whitespace text.
 *  - While improving: textarea + button are disabled and the button shows a
 *    spinner ("Improving…") — multiple requests are blocked.
 *  - On success the textarea content is *replaced* with the improved text.
 *  - On empty input (defensive) a validation toast is shown.
 *
 * Uses the project's own `Textarea` / `Button` primitives so styling stays
 * consistent with the rest of the app (mint outline, pill radius, mint focus
 * ring, shared loading spinner).
 */
export function DescriptionImprover({
  value,
  onChange,
  disabled,
  placeholder,
  id,
}: DescriptionImproverProps) {
  const { improve, isImproving } = useDescriptionImprover();
  const hasText = value.trim().length > 0;
  const busy = isImproving || !!disabled;

  const handleImprove = async () => {
    if (isImproving || !hasText) return;
    if (!value.trim()) {
      toast.error(EMPTY_MESSAGE);
      return;
    }
    const improved = await improve(value);
    // Replace the current text (never append).
    if (improved != null) onChange(improved);
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={busy}
        placeholder={placeholder}
      />

      {hasText && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImprove}
            disabled={busy}
            className="animate-in fade-in-0 slide-in-from-bottom-1"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Improving…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Improve
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
