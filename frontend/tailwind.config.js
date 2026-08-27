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
          bg: 'var(--paper-bg, #FAF7F0)',
          sheet: 'var(--paper-sheet, #FFFDF9)',
          card: 'var(--paper-card, #FAF6EE)',
          manila: 'var(--paper-manila, #F5EEDB)',
          postit: 'var(--paper-postit, #FEF9C3)',
          desk: 'var(--paper-desk, #EFE9DC)',
        },
        ink: {
          navy: 'var(--ink-navy, #0F172A)',
          graphite: 'var(--ink-graphite, #475569)',
          muted: 'var(--ink-muted, #94A3B8)',
          margin: 'var(--rule-margin, #E11D48)',
        },
        stamp: {
          clean: 'var(--stamp-clean, #15803D)',
          dirty: 'var(--stamp-dirty, #BE123C)',
          running: 'var(--stamp-running, #1D4ED8)',
          empty: 'var(--stamp-empty, #D97706)',
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
        serif: ['"Fraunces"', '"Lora"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Fraunces"', '"Lora"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
