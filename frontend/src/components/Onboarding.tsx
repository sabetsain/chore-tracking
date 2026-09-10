import { useState } from 'react';
import { Home, Sparkles, ArrowRight, AlertCircle, Sun, Moon, BookOpen } from 'lucide-react';
import { PaperCard } from './stationery/PaperCard';

type Tab = 'join' | 'create' | 'login';
type CoverStyle = 'moleskine' | 'kraft' | 'leather';

interface OnboardingProps {
  onLogin: (data: { nickname: string; pin?: string; invite_code?: string }) => Promise<void>;
  onJoin: (data: { invite_code: string; nickname: string; pin?: string }) => Promise<void>;
  onCreate: (data: { name: string; timezone?: string; nickname: string; pin?: string }) => Promise<void>;
}

const COVER_STYLES: Record<
  CoverStyle,
  {
    name: string;
    bgClass: string;
    borderClass: string;
    titleColor: string;
    crestColor: string;
    subtitleColor: string;
    badgeBg: string;
  }
> = {
  moleskine: {
    name: 'Classic Moleskine',
    bgClass: 'bg-[#1C1917]',
    borderClass: 'border-stone-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-stone-500/20',
    titleColor: 'text-stone-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]',
    crestColor: 'text-stone-300',
    subtitleColor: 'text-stone-300/80',
    badgeBg: 'bg-stone-900 border-stone-600 text-stone-200',
  },
  kraft: {
    name: 'Raw Kraft Board',
    bgClass: 'bg-[#C19A6B]',
    borderClass: 'border-stone-800/40 shadow-[0_20px_40px_rgba(60,30,10,0.4)]',
    titleColor: 'text-ink-navy drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]',
    crestColor: 'text-ink-navy',
    subtitleColor: 'text-ink-graphite',
    badgeBg: 'bg-[#b08756] border-stone-800/30 text-ink-navy',
  },
  leather: {
    name: 'Saddle Leather',
    bgClass: 'bg-[#78350F]',
    borderClass: 'border-2 border-dashed border-stone-900/70 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-4 ring-[#3D2314]',
    titleColor: 'text-stone-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
    crestColor: 'text-stone-200',
    subtitleColor: 'text-stone-200/90',
    badgeBg: 'bg-[#4A2612] border-stone-800/40 text-stone-200',
  },
};

export function Onboarding({ onLogin, onJoin, onCreate }: OnboardingProps) {
  const [tab, setTab] = useState<Tab>('join');
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('moleskine');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form fields
  const [inviteCode, setInviteCode] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [timezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  const resetState = () => {
    setError(null);
  };

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    resetState();
  };

  const toggleDeskLamp = () => {
    if (typeof document !== 'undefined') {
      const next = document.documentElement.classList.toggle('dark');
      setIsDark(next);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'join') {
        if (!inviteCode || !nickname) {
          throw new Error('Please provide both invite code and your nickname');
        }
        await onJoin({
          invite_code: inviteCode.trim().toUpperCase(),
          nickname: nickname.trim(),
          pin: pin.trim() || undefined,
        });
      } else if (tab === 'create') {
        if (!householdName || !nickname) {
          throw new Error('Please provide both household name and your nickname');
        }
        await onCreate({
          name: householdName.trim(),
          nickname: nickname.trim(),
          pin: pin.trim() || undefined,
          timezone,
        });
      } else if (tab === 'login') {
        if (!nickname) {
          throw new Error('Please provide your nickname');
        }
        await onLogin({
          nickname: nickname.trim(),
          pin: pin.trim() || undefined,
          invite_code: inviteCode.trim().toUpperCase() || undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const currentCover = COVER_STYLES[coverStyle];

  return (
    <div className="min-h-screen bg-paper-desk dark:bg-[#080D17] text-ink-navy dark:text-slate-100 flex flex-col justify-center items-center px-3 sm:px-6 py-8 transition-colors duration-300">
      {/* Top Desk Lamp & Material Switcher Toolbar */}
      <div className="max-w-xl w-full flex items-center justify-between mb-4 px-2">
        {/* Cover Material Switcher */}
        <div className="flex items-center gap-1.5 bg-paper-card dark:bg-[#1A2234] p-1.5 rounded-lg border border-stone-300 dark:border-slate-700 shadow-paper-sm text-xs font-sans font-bold">
          <BookOpen className="w-4 h-4 text-ink-graphite dark:text-slate-400 ml-1 mr-0.5" />
          <button
            type="button"
            onClick={() => setCoverStyle('moleskine')}
            className={`px-2.5 py-1 rounded transition ${
              coverStyle === 'moleskine'
                ? 'bg-[#1C1917] text-stone-200 shadow-sm'
                : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
            }`}
          >
            Moleskine
          </button>
          <button
            type="button"
            onClick={() => setCoverStyle('kraft')}
            className={`px-2.5 py-1 rounded transition ${
              coverStyle === 'kraft'
                ? 'bg-[#C19A6B] text-ink-navy shadow-sm'
                : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
            }`}
          >
            Kraft
          </button>
          <button
            type="button"
            onClick={() => setCoverStyle('leather')}
            className={`px-2.5 py-1 rounded transition ${
              coverStyle === 'leather'
                ? 'bg-[#78350F] text-stone-100 shadow-sm'
                : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
            }`}
          >
            Leather
          </button>
        </div>

        {/* Pull-Chain Desk Lamp Dark Mode Switch */}
        <button
          type="button"
          onClick={toggleDeskLamp}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper-card dark:bg-[#1A2234] hover:bg-stone-100 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-700 rounded-lg text-xs font-sans font-bold text-ink-navy dark:text-slate-200 shadow-paper-sm transition-all active:scale-95"
          title="Toggle Desk Lamp (Night Mode)"
          aria-label="Toggle Desk Lamp"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-accent-slate dark:text-slate-300" />
              <span>Desk Lamp: ON</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-accent-slate dark:text-slate-300" />
              <span>Desk Lamp: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Notebook Cover Container */}
      <div
        className={`max-w-xl w-full rounded-2xl p-6 sm:p-8 transition-all duration-300 relative ${currentCover.bgClass} ${currentCover.borderClass}`}
      >
        {/* Cover Header Branding / Foil Stamping */}
        <div className="text-center mb-6 pt-2 select-none">
          <div className="w-14 h-14 rounded-2xl bg-accent-slate/10 border border-accent-slate/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Home className={`w-7 h-7 ${currentCover.crestColor}`} />
          </div>
          <h1 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${currentCover.titleColor}`}>
            Household Coordination
          </h1>
          <p className={`text-sm font-serif italic mt-1 tracking-wide ${currentCover.subtitleColor}`}>
            Kitchen Table Logbook & Roommate Ledger
          </p>
        </div>

        {/* Paper Card Resting on the Cover */}
        <div className="relative mt-4">
          <PaperCard
            variant="sheet"
            className="p-6 shadow-paper-lifted border border-stone-300 dark:border-slate-700"
          >
            {/* Tab Selector */}
            <div
              role="tablist"
              aria-label="Onboarding Options"
              className="flex p-1 bg-stone-100 dark:bg-slate-800 rounded-xl mb-6 text-xs font-sans font-bold border border-border-stone dark:border-slate-700"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'join'}
                onClick={() => handleTabChange('join')}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                  tab === 'join'
                    ? 'bg-paper-sheet dark:bg-[#1A2234] text-ink-navy dark:text-slate-100 shadow-paper-sm'
                    : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
                }`}
              >
                Join House
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'create'}
                onClick={() => handleTabChange('create')}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                  tab === 'create'
                    ? 'bg-paper-sheet dark:bg-[#1A2234] text-ink-navy dark:text-slate-100 shadow-paper-sm'
                    : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
                }`}
              >
                Create House
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'login'}
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-paper-sheet dark:bg-[#1A2234] text-ink-navy dark:text-slate-100 shadow-paper-sm'
                    : 'text-ink-graphite dark:text-slate-400 hover:text-ink-navy dark:hover:text-slate-200'
                }`}
              >
                Log In
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-stamp-dirty dark:text-red-300 text-xs flex items-center gap-2 font-sans font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'create' && (
                <div>
                  <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                    Household Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House or apartment name (e.g. Maple Grove)"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
                  />
                </div>
              )}

              {(tab === 'join' || tab === 'login') && (
                <div>
                  <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                    Invite Code {tab === 'login' && <span className="font-normal text-ink-muted dark:text-slate-400">(optional)</span>}
                  </label>
                  <input
                    type="text"
                    required={tab === 'join'}
                    maxLength={6}
                    placeholder="6-letter code (e.g. ABC123)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm font-mono tracking-wider uppercase text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 mb-1 font-sans">
                  Your Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your nickname (e.g. Alex, Sam)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition font-sans"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-ink-navy dark:text-slate-200 font-sans">
                    4-Digit PIN <span className="font-normal text-ink-muted dark:text-slate-400">(optional)</span>
                  </label>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]*"
                  placeholder="4-digit PIN (optional)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper-card dark:bg-[#222D42] border border-stone-300 dark:border-slate-600 rounded-lg text-sm font-mono text-ink-navy dark:text-slate-100 placeholder:text-ink-muted dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-slate transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-accent-slate hover:bg-[#1E334A] disabled:opacity-50 text-white font-sans font-bold text-sm tracking-wide rounded-lg shadow-paper-sm hover:shadow-paper-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : tab === 'join' ? (
                  <>
                    <span>Join Household</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : tab === 'create' ? (
                  <>
                    <span>Create Household</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Log In to Household</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </PaperCard>
        </div>
      </div>
    </div>
  );
}
