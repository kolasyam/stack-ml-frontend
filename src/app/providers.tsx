'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

/**
 * Client-side providers: React Query (data + caching), next-themes
 * (dark-default/light toggle) and Sonner (toasts). The backend is a single
 * user, so a permissive-but-sane query config keeps the UI snappy.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast:
                '!bg-surface !border !border-fg/10 !text-fg !rounded-pill !font-sans',
              title: '!font-sans !text-fg !text-sm',
              description: '!font-sans !text-fg-secondary !text-xs',
              success: '[&_[data-icon]]:!text-mint',
              error: '[&_[data-icon]]:!text-danger',
              icon: '!text-mint',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
