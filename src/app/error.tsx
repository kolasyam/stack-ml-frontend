'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <div>
        <h2 className="font-sans text-lg font-semibold text-fg">Something went wrong</h2>
        <p className="mt-1 font-sans text-sm text-fg-secondary">The page could not be rendered.</p>
      </div>
      <Button variant="secondary" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
