import { useState } from 'react';
import { Home, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

type Tab = 'join' | 'create' | 'login';

interface OnboardingProps {
  onLogin: (data: { nickname: string; pin?: string; invite_code?: string }) => Promise<void>;
  onJoin: (data: { invite_code: string; nickname: string; pin?: string }) => Promise<void>;
  onCreate: (data: { name: string; timezone?: string; nickname: string; pin?: string }) => Promise<void>;
}

export function Onboarding({ onLogin, onJoin, onCreate }: OnboardingProps) {
  const [tab, setTab] = useState<Tab>('join');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* App Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-100">
            <Home className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Household Coordination
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time chore duty & appliance tracking for roommates.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Tab Selector */}
          <div
            role="tablist"
            className="flex p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'join'}
              onClick={() => handleTabChange('join')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'join'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Join House
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'create'}
              onClick={() => handleTabChange('create')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'create'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create House
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'create' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Household Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="House or apartment name (e.g. Maple Grove)"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            )}

            {(tab === 'join' || tab === 'login') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invite Code {tab === 'login' && <span className="font-normal text-slate-400">(optional)</span>}
                </label>
                <input
                  type="text"
                  required={tab === 'join'}
                  maxLength={6}
                  placeholder="6-letter code (e.g. ABC123)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                required
                placeholder="Your nickname (e.g. Alex, Sam)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  4-Digit PIN <span className="font-normal text-slate-400">(optional)</span>
                </label>
              </div>
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]*"
                placeholder="4-digit PIN (optional)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
