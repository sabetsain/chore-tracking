import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StationerySoundEngine } from './soundEngine';

describe('StationerySoundEngine', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGain: any;
  let mockBufferSource: any;
  let mockBiquadFilter: any;
  let mockAudioBuffer: any;

  beforeEach(() => {
    localStorage.clear();

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockBufferSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockBiquadFilter = {
      type: 'bandpass',
      frequency: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioBuffer = {
      getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
    };

    mockAudioContext = {
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      destination: {},
      createGain: vi.fn().mockReturnValue(mockGain),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createBufferSource: vi.fn().mockReturnValue(mockBufferSource),
      createBiquadFilter: vi.fn().mockReturnValue(mockBiquadFilter),
      createBuffer: vi.fn().mockReturnValue(mockAudioBuffer),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes disabled by default when localStorage has no entry', () => {
    const engine = new StationerySoundEngine();
    expect(engine.getEnabled()).toBe(false);
  });

  it('initializes enabled when localStorage is "true"', () => {
    localStorage.setItem('chores_sound_enabled', 'true');
    const engine = new StationerySoundEngine();
    expect(engine.getEnabled()).toBe(true);
  });

  it('updates state and persists to localStorage on setEnabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);
    expect(engine.getEnabled()).toBe(true);
    expect(localStorage.getItem('chores_sound_enabled')).toBe('true');

    engine.setEnabled(false);
    expect(engine.getEnabled()).toBe(false);
    expect(localStorage.getItem('chores_sound_enabled')).toBe('false');
  });

  it('does not invoke AudioContext when sound is disabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(false);

    engine.playStampSound();
    engine.playPageFlipSound();
    engine.playPencilScribbleSound();
    engine.playTapePeelSound();

    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  it('synthesizes stamp sound when enabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playStampSound();

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
  });

  it('synthesizes page flip sound when enabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playPageFlipSound();

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
  });

  it('synthesizes pencil scribble sound when enabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playPencilScribbleSound();

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
  });

  it('synthesizes washi tape peel sound when enabled', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playTapePeelSound();

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
  });
});
