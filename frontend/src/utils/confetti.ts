import confetti from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  origin?: { x: number; y: number };
}

/**
 * Triggers an organic paper fleck and graphite dust celebration.
 * Respects prefers-reduced-motion to avoid unwanted motion.
 */
export function triggerPaperDustCelebration(options?: ConfettiOptions): void {
  if (typeof window === 'undefined') return;

  // Check prefers-reduced-motion
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      return;
    }
  } catch {
    // Ignore media query error in tests
  }

  try {
    const count = options?.particleCount ?? 30;
    const origin = options?.origin ?? { x: 0.5, y: 0.6 };

    confetti({
      particleCount: count,
      origin,
      spread: 60,
      startVelocity: 22,
      decay: 0.91,
      gravity: 0.85,
      scalar: 0.75,
      ticks: 120, // ~1.2s settle time
      colors: [
        '#FAF6EE', // warm cream paper
        '#FEF08A', // canary highlighter yellow
        '#CBD5E1', // graphite slate
        '#B89772', // kraft fiber
        '#FBBF24', // amber stamp
        '#15803D', // forest green stamp
        '#BAE6FD', // blueprint pastel blue
      ],
      shapes: ['square', 'circle'],
      disableForReducedMotion: true,
    });
  } catch {
    // Safely ignore canvas-confetti errors in headless test environments
  }
}

export default triggerPaperDustCelebration;
