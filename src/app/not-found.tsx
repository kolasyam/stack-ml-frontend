import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="mono-label text-[10px] text-mint">404</p>
      <h2 className="font-sans text-xl font-semibold text-fg">Page not found</h2>
      <Button asChild variant="secondary"><Link href="/">Back to dashboard</Link></Button>
    </div>
  );
}
