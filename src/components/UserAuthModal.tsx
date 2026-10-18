'use client';
import React, { useState } from 'react';
import { X, Lock, User, Sparkles, Check, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { playBubblePop } from '../lib/sound';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string; email?: string }) => void;
  initialMode?: 'login' | 'register';
  mode?: 'login' | 'register';
  reason?: 'quota' | 'api' | 'manual';
}

export function UserAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'register',
  mode: propMode,
  reason = 'manual',
}: UserAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(propMode || initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (propMode) setMode(propMode);
    else if (initialMode) setMode(initialMode);
    setError('');
  }, [propMode, initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      const cleanUser = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanUser) {
        setError('Please enter a username.');
        return;
      }
      if (cleanUser.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid Gmail / Email address.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match! Please check both passwords.');
        return;
      }

      playBubblePop(680);
      setIsLoading(true);

      try {
        const res = await fetch('/api/user/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            username: cleanUser,
            email: cleanEmail,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          playBubblePop(380);
          setError(data.error || 'Registration failed. Please check credentials.');
          return;
        }

        playBubblePop(880);
        if (data.token) {
          try {
            localStorage.setItem('supashort_user_token', data.token);
          } catch {}
        }
        if (data.user) {
          try {
            localStorage.setItem('supashort_user_cache', JSON.stringify(data.user));
          } catch {}
        }
        // Automatically logged in!
        onSuccess(data.user);
        onClose();
      } catch {
        playBubblePop(380);
        setError('Network connection failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // LOGIN MODE
      const cleanIdentifier = username.trim().toLowerCase();
      if (!cleanIdentifier) {
        setError('Please enter your username or Gmail.');
        return;
      }
      if (password.length < 4) {
        setError('Please enter your password.');
        return;
      }

      playBubblePop(680);
      setIsLoading(true);

      try {
        const res = await fetch('/api/user/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            username: cleanIdentifier,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          playBubblePop(380);
          setError(data.error || 'Invalid username/email or password.');
          return;
        }

        playBubblePop(880);
        if (data.token) {
          try {
            localStorage.setItem('supashort_user_token', data.token);
          } catch {}
        }
        if (data.user) {
          try {
            localStorage.setItem('supashort_user_cache', JSON.stringify(data.user));
          } catch {}
        }
        onSuccess(data.user);
        onClose();
      } catch {
        playBubblePop(380);
        setError('Network connection failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 min-h-[100dvh] overflow-y-auto clay-scroll">
      <div className="liquid-glass-box liquid-glass-modal p-4 sm:p-7 w-full max-w-md relative text-zinc-900 shadow-2xl rounded-[26px] sm:rounded-[34px] border-2 border-white/95 animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92dvh] overflow-y-auto clay-scroll">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 border-b border-zinc-200/60">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="glass-orb orb-rainbow w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-white shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 drop-shadow" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 leading-tight">
                {mode === 'register' ? 'Create Free Account' : 'Welcome Back'}
              </h3>
              <p className="text-[10.5px] sm:text-xs text-zinc-600 font-bold truncate">
                {mode === 'register' ? 'Unlimited Links & Gated Developer API' : 'Sign in to access your dashboard'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              playBubblePop(450);
              onClose();
            }}
            className="glass-orb orb-clear w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-zinc-800 transition-all active:scale-90 shadow shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Reason Banner / Alert */}
        {reason === 'quota' && (
          <div className="mb-3.5 p-2.5 sm:p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 text-[11px] font-bold flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You reached your <strong>2 free guest links</strong>! Sign up in 5 seconds to unlock <strong>unlimited link creations</strong>.</span>
          </div>
        )}

        {reason === 'api' && (
          <div className="mb-3.5 p-2.5 sm:p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-950 text-[11px] font-bold flex items-center gap-2 shadow-sm">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Developer API Hub, Curl snippets, and Telegram SDK are reserved for registered users. Free instant registration!</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex liquid-glass-input p-1 rounded-full mb-4 gap-1">
          <button
            type="button"
            onClick={() => {
              playBubblePop(520);
              setMode('register');
              setError('');
            }}
            className={cn(
              "flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-full transition-all active:scale-95 cursor-pointer",
              mode === 'register' ? "nav-pill-active text-white shadow-md" : "text-zinc-700 hover:text-zinc-950 font-bold"
            )}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              playBubblePop(520);
              setMode('login');
              setError('');
            }}
            className={cn(
              "flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-full transition-all active:scale-95 cursor-pointer",
              mode === 'login' ? "nav-pill-active text-white shadow-md" : "text-zinc-700 hover:text-zinc-950 font-bold"
            )}
          >
            Sign In
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
          {/* USERNAME / IDENTIFIER */}
          <div>
            <label className="text-[10px] text-zinc-700 font-extrabold uppercase tracking-wider mb-1 block">
              {mode === 'register' ? 'Username' : 'Username or Gmail'}
            </label>
            <div className="liquid-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
              <User className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'register' ? 'e.g. saqib_pro' : 'saqib_pro or yourname@gmail.com'}
                autoCapitalize="none"
                autoCorrect="off"
                className="bg-transparent border-none outline-none text-base sm:text-sm font-bold text-zinc-900 placeholder-zinc-400 w-full font-mono"
                required
              />
            </div>
          </div>

          {/* GMAIL / EMAIL FIELD (REGISTER MODE ONLY) */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-700 font-extrabold uppercase tracking-wider block">
                  Gmail / Email
                </label>
                <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>No Approval Needed</span>
                </span>
              </div>
              <div className="liquid-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. saqib@gmail.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="bg-transparent border-none outline-none text-base sm:text-sm font-bold text-zinc-900 placeholder-zinc-400 w-full font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* PASSWORD */}
          <div>
            <label className="text-[10px] text-zinc-700 font-extrabold uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="liquid-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-base sm:text-sm font-bold text-zinc-900 placeholder-zinc-400 w-full font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-500 hover:text-zinc-900 focus:outline-none p-1 shrink-0 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD (REGISTER MODE ONLY) */}
          {mode === 'register' && (
            <div>
              <label className="text-[10px] text-zinc-700 font-extrabold uppercase tracking-wider mb-1 block">
                Confirm Password
              </label>
              <div className="liquid-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none text-base sm:text-sm font-bold text-zinc-900 placeholder-zinc-400 w-full font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-zinc-500 hover:text-zinc-900 focus:outline-none p-1 shrink-0 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full glass-orb orb-rainbow py-3.5 mt-2 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'register' ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Account &amp; Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Sign In to Supashort</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Guarantee note */}
        <div className="mt-3.5 text-center">
          <p className="text-[10px] text-zinc-600 font-bold">
            🔒 Secured with PBKDF2-SHA256 • Direct Instant Login
          </p>
        </div>

      </div>
    </div>
  );
}
