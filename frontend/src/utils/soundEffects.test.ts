import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundEffects, soundEffects } from './soundEffects';

describe('SoundEffects', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGain: any;

  beforeEach(() => {
    localStorage.clear();

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockAudioContext = {
      currentTime: 1.5,
      sampleRate: 44100,
      state: 'suspended',
      destination: {},
      createGain: vi.fn().mockReturnValue(mockGain),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton and initialization', () => {
    it('exports a singleton instance of SoundEffects', () => {
      expect(soundEffects).toBeInstanceOf(SoundEffects);
    });

    it('initializes unmuted by default when localStorage is empty', () => {
      const instance = new SoundEffects();
      expect(instance.getMuted()).toBe(false);
    });

    it('initializes muted when localStorage has "chores_audio_muted" = "true"', () => {
      localStorage.setItem('chores_audio_muted', 'true');
      const instance = new SoundEffects();
      expect(instance.getMuted()).toBe(true);
    });
  });

  describe('mute management', () => {
    it('sets muted state and persists to localStorage', () => {
      const instance = new SoundEffects();
      instance.setMuted(true);
      expect(instance.getMuted()).toBe(true);
      expect(localStorage.getItem('chores_audio_muted')).toBe('true');

      instance.setMuted(false);
      expect(instance.getMuted()).toBe(false);
      expect(localStorage.getItem('chores_audio_muted')).toBe('false');
    });

    it('toggles muted state and persists to localStorage', () => {
      const instance = new SoundEffects();
      expect(instance.getMuted()).toBe(false);

      const res1 = instance.toggleMuted();
      expect(res1).toBe(true);
      expect(instance.getMuted()).toBe(true);
      expect(localStorage.getItem('chores_audio_muted')).toBe('true');

      const res2 = instance.toggleMuted();
      expect(res2).toBe(false);
      expect(instance.getMuted()).toBe(false);
      expect(localStorage.getItem('chores_audio_muted')).toBe('false');
    });
  });

  describe('playWoodClick', () => {
    it('synthesizes an 80ms wood click impulse when unmuted', () => {
      const instance = new SoundEffects();
      instance.setMuted(false);

      instance.playWoodClick();

      expect(window.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();

      // Triangle wave
      expect(mockOscillator.type).toBe('triangle');

      // Frequency decay from 140Hz to 40Hz over 0.08s
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(140, 1.5);
      expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(40, 1.5 + 0.08);

      // Gain exponential decay from 0.35 to 0.001 over 0.08s
      expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.35, 1.5);
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 1.5 + 0.08);

      // Connections and start/stop
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockOscillator.start).toHaveBeenCalledWith(1.5);
      expect(mockOscillator.stop).toHaveBeenCalledWith(1.5 + 0.08);
    });

    it('does not play sound when muted', () => {
      const instance = new SoundEffects();
      instance.setMuted(true);

      instance.playWoodClick();

      expect(window.AudioContext).not.toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
      expect(mockAudioContext.createGain).not.toHaveBeenCalled();
    });

    it('gracefully handles missing AudioContext or errors', () => {
      // @ts-ignore
      delete window.AudioContext;
      // @ts-ignore
      delete window.webkitAudioContext;

      const instance = new SoundEffects();
      expect(() => instance.playWoodClick()).not.toThrow();
    });
  });
});
