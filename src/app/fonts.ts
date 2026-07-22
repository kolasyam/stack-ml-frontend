import { Archivo_Black, Space_Grotesk, Space_Mono } from 'next/font/google';

/**
 * Font substitutes for the proprietary Verge stack (per DESIGN-theverge.md §3):
 *  - Manuka (display shout)  → Archivo Black  (heavy industrial display)
 *  - PolySans (UI workhorse) → Space Grotesk  (metrics close to PolySans)
 *  - PolySans Mono (labels)  → Space Mono     (UPPERCASE mono labels/timestamps)
 *
 * Display line-height is loosened (0.80 → ~0.95) in the Tailwind theme because
 * substitute displays have wider vertical metrics than Manuka.
 */
export const fontDisplay = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const fontSans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});
