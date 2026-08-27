import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerPaperDustCelebration } from './confetti';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('confetti utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers confetti with paper-themed palette and options', () => {
    triggerPaperDustCelebration({ particleCount: 35, origin: { x: 0.5, y: 0.5 } });

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 35,
        origin: { x: 0.5, y: 0.5 },
        disableForReducedMotion: true,
      })
    );
  });

  it('does not trigger confetti when prefers-reduced-motion is active', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    triggerPaperDustCelebration();
    expect(confetti).not.toHaveBeenCalled();
  });
});
