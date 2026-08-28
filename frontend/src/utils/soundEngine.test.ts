import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StationerySoundEngine } from './soundEngine';

describe('StationerySoundEngine', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGain: any;
  let mockBufferSource: any;
  let mockBiquadFilter: any;
  let mockAudioBuffer: any;
  let vibrateMock: any;

  beforeEach(() => {
    localStorage.clear();

    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      configurable: true,
      value: vibrateMock,
    });

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

  it('synthesizes stamp sound with velocity scaling and triggers haptics', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playStampSound(1.2);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    // Sub-bass frequency starting at 65Hz
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(65, 0);
    // Haptic vibration pattern [20, 40, 30]
    expect(vibrateMock).toHaveBeenCalledWith([20, 40, 30]);
  });

  it('synthesizes page flip sound and triggers haptics', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playPageFlipSound();

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(vibrateMock).toHaveBeenCalledWith([10, 15, 10]);
  });

  it('synthesizes pencil scribble sound and triggers haptics', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playPencilScribbleSound(1.5);

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(vibrateMock).toHaveBeenCalledWith([12]);
  });

  it('synthesizes washi tape peel sound and triggers haptics', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playTapePeelSound();

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(vibrateMock).toHaveBeenCalledWith([12]);
  });

  it('synthesizes eraser sound with rubber friction and triggers haptics', () => {
    const engine = new StationerySoundEngine();
    engine.setEnabled(true);

    engine.playEraserSound(1.2);

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled();
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(vibrateMock).toHaveBeenCalledWith([8, 12]);
  });

  it('handles triggerHaptic safely when navigator.vibrate is unavailable', () => {
    // @ts-ignore
    delete navigator.vibrate;
    const engine = new StationerySoundEngine();
    expect(() => engine.triggerHaptic([10, 20])).not.toThrow();
  });
});
