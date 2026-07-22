import type { Config } from 'tailwindcss';

/**
 * Tailwind theme = The Verge design system, wired to CSS variables so the
 * dark canvas (default) and a light theme both work. Palette, radii, type
 * scale and motion are lifted from DESIGN-theverge.md.
 *
 *  - Surfaces + accents resolve through `rgb(var(--token) / <alpha>)` so opacity
 *    utilities (e.g. `bg-mint/20`) work for hover/glow states.
 *  - Saturated story-tile colors stay fixed (they're intentional color blocks).
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
        },
        frame: 'rgb(var(--frame) / <alpha-value>)',
        mint: {
          DEFAULT: 'rgb(var(--mint) / <alpha-value>)',
          border: 'rgb(var(--mint-border) / <alpha-value>)',
        },
        violet: {
          DEFAULT: 'rgb(var(--violet) / <alpha-value>)',
          rule: 'rgb(var(--violet-rule) / <alpha-value>)',
        },
        link: 'rgb(var(--link) / <alpha-value>)',
        focusring: 'rgb(var(--focus) / <alpha-value>)',
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          secondary: 'rgb(var(--fg-secondary) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          invert: 'rgb(var(--fg-invert) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        // Saturated story-tile palette (intentional color blocks, fixed)
        tile: {
          yellow: '#ffe14d',
          pink: '#ff6ec7',
          orange: '#ff7a2f',
          blue: '#2f6bff',
          purple: '#5200ff',
          mint: '#3cffd0',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'Helvetica', 'sans-serif'],
        sans: ['var(--font-sans)', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '3px',
        DEFAULT: '4px',
        pill: '20px',
        card: '20px',
        feature: '24px',
        promo: '30px',
        cta: '40px',
      },
      letterSpacing: {
        label: '0.11em',
        wide: '0.15em',
        display: '0.01em',
      },
      lineHeight: {
        display: '0.95',
        tight: '1.0',
      },
      transitionTimingFunction: {
        verge: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.28s ease-verge',
        shimmer: 'shimmer 1.5s infinite',
        'slide-up': 'slide-up 0.3s ease-verge',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
