import confetti from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  origin?: { x: number; y: number };
}

/**
 * Triggers an organic paper fleck and graphite dust celebration.
 * Respects prefers-reduced-motion to avoid unwanted motion.
 */
export function triggerPaperDustCelebration(options?: ConfettiOptions | React.MouseEvent | any): void {
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
    let count = 30;
    let origin = { x: 0.5, y: 0.6 };

    if (options) {
      if (typeof options.clientX === 'number' && typeof options.clientY === 'number') {
        const x = window.innerWidth > 0 ? options.clientX / window.innerWidth : 0.5;
        const y = window.innerHeight > 0 ? options.clientY / window.innerHeight : 0.6;
        origin = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
      } else {
        if (options.particleCount !== undefined) count = options.particleCount;
        if (options.origin !== undefined) origin = options.origin;
      }
    }

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
        '#3E6B52', // sage green
        '#28415C', // slate navy
        '#CBD5E1', // graphite slate
        '#D6D3D1', // soft stone
        '#52796F', // muted sage
      ],
      shapes: ['square', 'circle'],
      disableForReducedMotion: true,
    });
  } catch {
    // Safely ignore canvas-confetti errors in headless test environments
  }
}

export default triggerPaperDustCelebration;
