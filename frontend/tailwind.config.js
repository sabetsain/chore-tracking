/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: 'var(--canvas-bg, #F4EFEA)',
          card: 'var(--canvas-card, #FDFAF6)',
        },
        ink: {
          primary: 'var(--ink-primary, #1E232B)',
          secondary: 'var(--ink-secondary, #505A69)',
          muted: 'var(--ink-muted, #94A3B8)',
          navy: 'var(--ink-navy, var(--ink-primary, #1E232B))',
          graphite: 'var(--ink-graphite, var(--ink-secondary, #505A69))',
          margin: 'var(--rule-margin, transparent)',
        },
        accent: {
          terracotta: 'var(--accent-terracotta, #28415C)',
          slate: 'var(--accent-slate, #28415C)',
          sage: 'var(--accent-sage, #3E6B52)',
          rose: 'var(--accent-rose, #B06573)',
          ochre: 'var(--accent-ochre, #3E6B52)',
          indigo: 'var(--accent-indigo, #28415C)',
          crimson: 'var(--accent-crimson, #9B3B42)',
        },
        'border-stone': 'var(--border-stone, #E3DDD5)',
        paper: {
          bg: 'var(--paper-bg, var(--canvas-bg, #F4EFEA))',
          sheet: 'var(--paper-sheet, var(--canvas-card, #FDFAF6))',
          card: 'var(--paper-card, var(--canvas-card, #FDFAF6))',
          manila: 'var(--paper-manila, #F5EEDB)',
          postit: 'var(--paper-postit, #FEF9C3)',
          desk: 'var(--paper-desk, var(--canvas-bg, #F4EFEA))',
        },
        stamp: {
          clean: 'var(--stamp-clean, var(--accent-sage, #3E6B52))',
          dirty: 'var(--stamp-dirty, var(--accent-crimson, #9B3B42))',
          running: 'var(--stamp-running, var(--accent-slate, #28415C))',
          empty: 'var(--stamp-empty, var(--accent-sage, #3E6B52))',
        },
        highlighter: {
          yellow: 'var(--hl-yellow, rgba(254, 240, 138, 0.55))',
          green: 'var(--hl-green, rgba(187, 247, 208, 0.50))',
          pink: 'var(--hl-pink, rgba(254, 205, 211, 0.50))',
          blue: 'var(--hl-blue, rgba(186, 230, 253, 0.50))',
          orange: 'var(--hl-orange, rgba(254, 215, 170, 0.50))',
        },
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'paper-md': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'paper-lg': '0 12px 24px -4px rgba(15, 23, 42, 0.10), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
        'paper-sheet': '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px -4px rgba(15, 23, 42, 0.08)',
        'paper-card': '0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        'paper-lifted': '0 14px 28px rgba(15, 23, 42, 0.12), 0 10px 10px rgba(15, 23, 42, 0.06), 0 0 1px rgba(15, 23, 42, 0.15)',
        'page-stack': '2px 2px 0px #E5DEC9, 4px 4px 0px #D8D0BA, 6px 6px 0px #CBC2AA',
        'letterpress': 'inset 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.8)',
        'binder-spine': 'inset -8px 0 12px -4px rgba(0, 0, 0, 0.12), inset 4px 0 6px -2px rgba(255, 255, 255, 0.5)',
      },
      fontFamily: {
        serif: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
