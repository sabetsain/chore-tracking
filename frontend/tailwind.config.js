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
        paper: {
          bg: 'var(--paper-bg, #faf6ee)',
          sheet: 'var(--paper-sheet, #fcfbf7)',
          card: 'var(--paper-card, #fffdf9)',
          manila: 'var(--paper-manila, #fef7e0)',
          postit: 'var(--paper-postit, #fef9c3)',
          desk: 'var(--desk-surface, #eae4d5)',
        },
        ink: {
          navy: 'var(--ink-navy, #1e293b)',
          graphite: 'var(--ink-graphite, #475569)',
          muted: 'var(--ink-muted, #94a3b8)',
          margin: 'var(--rule-margin, #ef4444)',
        },
        stamp: {
          clean: 'var(--stamp-clean, #15803d)',
          dirty: 'var(--stamp-dirty, #b91c1c)',
          running: 'var(--stamp-running, #1d4ed8)',
          empty: 'var(--stamp-empty, #b45309)',
        },
        highlighter: {
          yellow: 'var(--hl-yellow, rgba(254, 240, 138, 0.65))',
          green: 'var(--hl-green, rgba(187, 247, 208, 0.60))',
          pink: 'var(--hl-pink, rgba(254, 205, 211, 0.60))',
          blue: 'var(--hl-blue, rgba(186, 230, 253, 0.60))',
          orange: 'var(--hl-orange, rgba(254, 215, 170, 0.60))',
        },
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(30, 41, 59, 0.08), 0 1px 2px rgba(30, 41, 59, 0.04)',
        'paper-md': '0 4px 8px -1px rgba(30, 41, 59, 0.10), 0 2px 4px -2px rgba(30, 41, 59, 0.06)',
        'paper-lg': '0 10px 20px -3px rgba(30, 41, 59, 0.12), 0 4px 6px -4px rgba(30, 41, 59, 0.08)',
        'paper-lifted': '0 14px 28px rgba(30, 41, 59, 0.15), 0 10px 10px rgba(30, 41, 59, 0.08), 0 0 1px rgba(30, 41, 59, 0.2)',
        'binder-spine': 'inset -8px 0 12px -4px rgba(0, 0, 0, 0.15), inset 4px 0 6px -2px rgba(255, 255, 255, 0.4)',
        'page-stack': '2px 2px 0px #e2d9c8, 4px 4px 0px #d5cbba, 6px 6px 0px #c8bea9',
      },
      fontFamily: {
        hand: ['"Patrick Hand"', '"Caveat"', 'cursive', 'sans-serif'],
        display: ['"Caveat"', '"Patrick Hand"', 'cursive', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
};
