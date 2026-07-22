'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { descriptionsApi } from '@/lib/api/descriptions';

const SUCCESS_MESSAGE = 'Description improved successfully.';
const ERROR_MESSAGE = 'Unable to improve description. Please try again.';

/**
 * useDescriptionImprover — centralises the improve flow for any Description
 * field so the logic is never duplicated across Resource / Todo / Note forms.
 *
 *  - `isImproving` drives the loading state (button + textarea disabled).
 *  - Guarantees a single in-flight request (callers also guard on this flag).
 *  - Surfaces success / error toasts through Sonner, matching the rest of the
 *    app, and never throws — callers just get `null` on failure.
 */
export function useDescriptionImprover() {
  const [isImproving, setIsImproving] = React.useState(false);

  const improve = React.useCallback(
    async (text: string): Promise<string | null> => {
      if (isImproving) return null;
      setIsImproving(true);
      try {
        const improved = await descriptionsApi.improve(text);
        toast.success(SUCCESS_MESSAGE);
        return improved;
      } catch {
        toast.error(ERROR_MESSAGE);
        return null;
      } finally {
        setIsImproving(false);
      }
    },
    [isImproving],
  );

  return { improve, isImproving };
}
