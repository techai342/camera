'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { SaqibSignature } from '../../components/SaqibSignature';
import { playBubblePop } from '../../lib/sound';

export default function MrAdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both Username and Access Key are required');
      return;
    }

    playBubblePop(720);
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playBubblePop(880);
        window.location.reload();
      } else {
        playBubblePop(380);
        if (res.status === 429) {
          setError(data.error || 'Rate limit exceeded: Too many attempts. Please wait 15 minutes.');
        } else {
          setError(data.error || 'ACCESS DENIED: Invalid Security Credentials');
        }
      }
    } catch {
      setError('Connection to security gateway failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 flex-col relative overflow-hidden">
      {/* Ambient Refraction Blobs */}
      <div className="ambient-refraction-blob w-72 h-72 bg-amber-400/40 -top-10 -left-10" />
      <div className="ambient-refraction-blob w-80 h-80 bg-teal-500/30 -bottom-10 -right-10" />

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm liquid-glass-box rounded-[40px] p-6 sm:p-8 text-center shadow-2xl relative z-10"
      >
        <div className="glass-orb orb-rainbow w-20 h-20 flex items-center justify-center mx-auto mb-5 text-white shadow-xl">
          <Shield className="w-10 h-10 drop-shadow" />
        </div>

        <div className="flex items-center justify-center gap-1 text-[24px] sm:text-[28px] leading-none select-none mb-1">
          <span className="cartoon-letter text-[#2e45b8] -rotate-6">M</span>
          <span className="cartoon-letter text-[#e03c28] rotate-3 -ml-0.5">R</span>
          <span className="cartoon-letter text-[#f5ecd7] -rotate-3 -ml-0.5">A</span>
          <span className="cartoon-letter text-[#f2b726] rotate-6 -ml-0.5">D</span>
          <span className="cartoon-letter text-[#278c68] -rotate-6 -ml-0.5">M</span>
          <span className="cartoon-letter text-[#2e45b8] rotate-3 -ml-0.5">I</span>
          <span className="cartoon-letter text-[#e03c28] -rotate-6 -ml-0.5">N</span>
        </div>

        <p className="text-zinc-700 font-extrabold text-xs mb-6">
          PBKDF2-SHA256 Protected Terminal • High-Security Vault
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-900 text-xs font-black flex items-center gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ADMIN USERNAME"
              disabled={isSubmitting}
              className="w-full liquid-glass-input py-3.5 pl-11 pr-4 text-zinc-900 text-[15px] sm:text-xs font-mono font-bold focus:outline-none transition-colors"
              autoComplete="username"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ACCESS KEY"
              disabled={isSubmitting}
              className="w-full liquid-glass-input py-3.5 pl-11 pr-4 text-zinc-900 text-[15px] sm:text-xs font-mono font-bold focus:outline-none transition-colors"
              autoFocus
              autoComplete="current-password"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full glass-orb orb-blue py-3.5 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Hash...</span>
              </>
            ) : (
              <span>Initialize Handshake</span>
            )}
          </button>
        </form>
      </motion.div>

      <div className="relative z-10">
        <SaqibSignature className="mt-8" />
      </div>
    </div>
  );
}
