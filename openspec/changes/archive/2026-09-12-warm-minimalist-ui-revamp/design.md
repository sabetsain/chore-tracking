# Technical Design: Warm Minimalist UI Revamp

## 1. Architectural Approach

The revamp migrates the frontend presentation layer from skeuomorphic physical props to a clean, warm architectural canvas with tactile status seals and community stickers. This is achieved entirely within `frontend/` without breaking backend REST or WebSocket contracts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND COMPONENT TOPOLOGY                         │
└─────────────────────────────────────────────────────────────────────────────┘

  [index.css] ── 60-30-10 Color Tokens (--canvas-bg, --canvas-card, accents)
       │
       ├─► [PaperCard] ──────── Soft Milk Surface (#FDFAF6), 1px Muted Stone Border
       │       │
       │       ├─► [StatusStamp] ──── Mechanical state seal (dashed border, ±1.5°)
       │       ├─► [IdentitySticker]  Curated domestic avatar (organic vector, ±2°)
       │       └─► [Action Button] ── Full-width thumb target with 4 tactile states
       │
       └─► [soundEffects.ts] ── Browser Web Audio API (~80ms wood-block impulse)
```

## 2. CSS Variable Overhaul (`frontend/src/index.css`)

Replace existing skeuomorphic tokens with the calibrated 60-30-10 palette:

```css
:root {
  /* 60% Canvas Ground & Surfaces */
  --canvas-bg: #F4EFEA;         /* Warm Oatmeal / Unbleached Linen */
  --canvas-card: #FDFAF6;       /* Soft Milk / Porcelain */
  
  /* 30% Structural Neutrals */
  --ink-primary: #1E232B;       /* Warm Deep Charcoal */
  --ink-secondary: #505A69;     /* Muted Slate Lead */
  --ink-muted: #94A3B8;         /* Faint Metadata */
  --border-stone: #E3DDD5;      /* Muted Stone Hairline */

  /* 10% Toned Complementary Accents */
  --accent-terracotta: #C25E3E; /* Running State / Primary Active */
  --accent-slate: #3B5B75;      /* Slate Blue Complement */
  --accent-sage: #436A54;       /* Clean State / Success */
  --accent-rose: #B06573;       /* Soft Clay Rose Complement */
  --accent-ochre: #D9822B;      /* Attention / Notice / Claim */
  --accent-indigo: #283654;     /* Deep Indigo Complement */
  --accent-crimson: #A83842;    /* Dirty State / Reset */
}

.dark {
  /* Warm Night Journal Surfaces */
  --canvas-bg: #141312;         /* Deep Espresso / Obsidian */
  --canvas-card: #1F1D1A;       /* Roasted Walnut / Charcoal */
  
  /* Night Inks */
  --ink-primary: #F1F5F9;
  --ink-secondary: #94A3B8;
  --ink-muted: #64748B;
  --border-stone: #2E2A26;      /* Amber-Stone Border */

  /* Night Accents (calibrated for dark background) */
  --accent-terracotta: #E07A5F;
  --accent-slate: #60A5FA;
  --accent-sage: #52B788;
  --accent-rose: #F472B6;
  --accent-ochre: #F59E0B;
  --accent-indigo: #818CF8;
  --accent-crimson: #FB7185;
}
```

## 3. Tactile Primitives Specification

### 3.1 `StatusStamp.tsx`
- **Role**: Communicates current machine or duty state (`CLEAN`, `DIRTY`, `RUNNING`, `NEEDS EMPTYING`, `PENDING`, `CLAIMED`).
- **Visuals**: Transparent background, `1.5px` dashed or double border matching the state color, bold monospaced uppercase typography (`JetBrains Mono`, `tracking-wider`).
- **Interaction**: Non-clickable (output). Rotated subtly at $\pm 1.5^\circ$. On state change, triggers a scale pop animation (`scale(1.04) -> scale(1.0)` over 180ms).

### 3.2 `IdentitySticker.tsx`
- **Role**: Represents household members, chore categories, and domestic milestones.
- **Visuals**: Rounded die-cut outline (`rounded-xl`), soft micro-shadow (`shadow-[0_2px_0_rgba(0,0,0,0.06)]`), warm muted fill, and simple organic glyphs (☕, 🌿, 🐱, ☀️, 🧽, ♻, 🧺).
- **Placement**: Slight natural rotational tilt ($\pm 2^\circ$).

### 3.3 The 4-State Button Pattern
- **Resting**: Solid accent background (`bg-[var(--accent-terracotta)]` or `bg-[var(--accent-sage)]`), high-contrast text, `shadow-[0_2px_0_rgba(30,35,43,0.12)]`.
- **Hover/Focus**: `translate-y-[-1px]` with `shadow-[0_3px_0_rgba(30,35,43,0.15)]`, `ring-2 ring-accent-slate`.
- **Active (Pressed)**: `translate-y-[1px]`, `shadow-none`.
- **Disabled/Loading**: `pointer-events: none`, `opacity-60`, with an animated spinner.

## 4. Web Audio Synthesizer (`soundEffects.ts`)

A zero-dependency browser Web Audio utility:
```typescript
class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  playWoodClick() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}
```

## 5. Deprecation & Cleanup Plan

1. Remove `SpiralSpine.tsx`, `WashiTape.tsx`, `PaperclipFastener.tsx`.
2. Remove `.notebook-ruled-surface` and `.notebook-margin-guide` CSS rules.
3. Replace all uses of font family `Caveat` and `Fraunces` with `Plus Jakarta Sans` and `JetBrains Mono`.
4. Update Vitest tests in `stationery.test.tsx`, `ApplianceCard.test.tsx`, `ChoreDutyView.test.tsx` to assert new clean semantics.
