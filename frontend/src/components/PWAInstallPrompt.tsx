import { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const standaloneMode =
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)').matches
        : false) || (navigator as any).standalone === true;
    setIsStandalone(Boolean(standaloneMode));

    // Check iOS
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (dismissed || isStandalone) {
    return null;
  }

  // Only render if install prompt event was caught or user is on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <aside
      aria-label="Install Household App"
      className="bg-accent-slate text-white rounded-2xl p-4 shadow-lg border border-slate-700 mb-6 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1E334A] rounded-xl shrink-0 text-slate-200">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Install Household App</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Add to your home screen for instant updates and push notifications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-[#1E334A] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {deferredPrompt && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium transition"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-sage hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {!deferredPrompt && isIOS && (
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-100 space-y-1.5">
          <p className="font-semibold text-white">Add to Home Screen (iOS):</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span>1. Tap Share</span>
            <Share className="w-3.5 h-3.5 text-white inline shrink-0" />
            <span>in Safari</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span>2. Select "Add to Home Screen"</span>
            <PlusSquare className="w-3.5 h-3.5 text-white inline shrink-0" />
          </div>
        </div>
      )}
    </aside>
  );
}
