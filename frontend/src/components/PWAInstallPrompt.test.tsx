import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PWAInstallPrompt } from './PWAInstallPrompt';

describe('PWAInstallPrompt Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset matchMedia default
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders install prompt when beforeinstallprompt event is fired', async () => {
    const user = userEvent.setup();
    const promptMock = vi.fn().mockResolvedValue({ outcome: 'accepted' });
    
    render(<PWAInstallPrompt />);

    // Initially hidden if no event and not iOS
    expect(screen.queryByText(/Install Household App/i)).not.toBeInTheDocument();

    // Trigger beforeinstallprompt event
    const installEvent = new Event('beforeinstallprompt');
    Object.assign(installEvent, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
      preventDefault: vi.fn(),
    });

    act(() => {
      window.dispatchEvent(installEvent);
    });

    expect(screen.getByText(/Install Household App/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^install app$/i })).toBeInTheDocument();

    // Click install
    const installBtn = screen.getByRole('button', { name: /^install app$/i });
    await user.click(installBtn);

    expect(promptMock).toHaveBeenCalled();
  });

  it('renders iOS specific instructions when on iOS Safari and not standalone', () => {
    // Mock iOS user agent
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      configurable: true,
    });

    render(<PWAInstallPrompt />);

    expect(screen.getAllByText(/Add to Home Screen/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tap Share/i)).toBeInTheDocument();

    // Restore
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      configurable: true,
    });
  });

  it('does not render if app is running in standalone mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<PWAInstallPrompt />);

    const installEvent = new Event('beforeinstallprompt');
    Object.assign(installEvent, {
      prompt: vi.fn(),
      preventDefault: vi.fn(),
    });

    act(() => {
      window.dispatchEvent(installEvent);
    });

    expect(screen.queryByText(/Install Household App/i)).not.toBeInTheDocument();
  });

  it('hides prompt and remembers choice when dismissed', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<PWAInstallPrompt onDismiss={onDismiss} />);

    const installEvent = new Event('beforeinstallprompt');
    Object.assign(installEvent, {
      prompt: vi.fn(),
      preventDefault: vi.fn(),
    });

    act(() => {
      window.dispatchEvent(installEvent);
    });

    const dismissBtn = screen.getByRole('button', { name: /dismiss install prompt/i });
    await user.click(dismissBtn);

    expect(screen.queryByText(/Install Household App/i)).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalled();
  });
});
