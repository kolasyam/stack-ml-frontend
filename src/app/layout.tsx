import type { Metadata, Viewport } from 'next';
import { fontDisplay, fontSans, fontMono } from './fonts';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/app-shell';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ML Knowledge Hub';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Personal AI/ML Learning`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'A premium, mobile-first knowledge hub for organising AI/ML learning resources, todos, and work notes.',
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: '#131313',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} font-sans`}
      >
        {/* Pre-hydration guard: browser extensions (e.g. Grammarly) inject
            attributes such as `fdprocessedid` / `data-gramm*` into inputs and
            buttons before React hydrates, causing a hydration mismatch. This
            inline script runs during initial HTML parsing — ahead of Next's
            hydration bundle — and strips those attributes as soon as they
            appear, so the DOM React hydrates against matches the server HTML. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var ATTRS = ['fdprocessedid', 'data-gramm', 'data-gramm_editor', 'data-gramm_editor_ext', 'gramm'];
                function clean(node) {
                  if (!node || node.nodeType !== 1) return;
                  for (var i = 0; i < ATTRS.length; i++) {
                    if (node.hasAttribute(ATTRS[i])) node.removeAttribute(ATTRS[i]);
                  }
                }
                function cleanAll(root) {
                  if (!root) return;
                  clean(root);
                  var els = root.querySelectorAll('*');
                  for (var i = 0; i < els.length; i++) clean(els[i]);
                }
                function observe() {
                  if (!window.MutationObserver) return;
                  var obs = new MutationObserver(function (muts) {
                    for (var m = 0; m < muts.length; m++) {
                      var rec = muts[m];
                      if (rec.type === 'attributes') clean(rec.target);
                      else if (rec.type === 'childList') {
                        for (var i = 0; i < rec.addedNodes.length; i++) {
                          if (rec.addedNodes[i].nodeType === 1) cleanAll(rec.addedNodes[i]);
                        }
                      }
                    }
                  });
                  obs.observe(document.documentElement, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                    attributeFilter: ATTRS,
                  });
                }
                // Start observing immediately (during initial parse) so extension
                // attributes are stripped in microtasks *before* React's hydration
                // pass reads the DOM. DOMContentLoaded is too late — hydration
                // already ran by then.
                observe();
                if (document.readyState !== 'loading') cleanAll(document);
                document.addEventListener('DOMContentLoaded', function () {
                  cleanAll(document);
                });
              })();
            `,
          }}
        />
        <Providers>
          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
