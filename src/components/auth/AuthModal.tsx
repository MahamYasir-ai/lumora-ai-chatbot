import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, Zap, LogIn, UserPlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { UserAccount, UserTier } from '../../types/auth';
import { createMockAccount } from '../../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onStayLoggedOut: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onStayLoggedOut,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState<UserTier>('free');
  const [error, setError] = useState('');

  // Reset fields when mode changes
  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const userName = mode === 'signup' && name ? name : email.split('@')[0];
    const account = createMockAccount(userName, email, selectedTier);
    onLoginSuccess(account);
    onClose();
  };

  const handleQuickDemo = (tier: UserTier) => {
    const demoUser = createMockAccount(
      tier === 'pro' ? 'Alex Vance (Pro)' : 'Guest Explorer',
      tier === 'pro' ? 'alex.pro@lumora.ai' : 'guest@lumora.ai',
      tier
    );
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back to Lumora' : 'Initialize Lumora Identity'}
      description="Connect your neural session, sync conversation history, or continue as a guest."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-white border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-pink-400" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-white border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-lime-400" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Access Code / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Tier Selection on Signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Initial Access Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTier('free')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTier === 'free'
                      ? 'bg-slate-850 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Free Plan</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Default</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gemini 3.1 Flash Lite included</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('pro')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTier === 'pro'
                      ? 'bg-slate-850 border-amber-400 text-white shadow-sm shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Pro Neural</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gemini 3.8 Flash unlocked</p>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-orange-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'login' ? 'Authenticate Session' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider mb-2">
            Instant 1-Click Test Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('free')}
              className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Demo: Free User
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('pro')}
              className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Demo: Pro User</span>
            </button>
          </div>
        </div>

        {/* Stay Logged Out Option */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              onStayLoggedOut();
              onClose();
            }}
            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition-colors cursor-pointer"
          >
            Stay Logged Out (Continue as Guest)
          </button>
          <p className="text-[10px] text-slate-500 mt-1">
            Chats are preserved in your local browser even when logged out.
          </p>
        </div>
      </div>
    </Modal>
  );
};
