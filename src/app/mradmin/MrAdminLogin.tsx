'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { SaqibSignature } from '../../components/SaqibSignature';

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
        // Authenticated! Reload page so server sends the full MrAdmin Dashboard
        window.location.reload();
      } else {
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
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4 sm:p-6 flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm clay-board p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="clay-circle-grey w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5 text-[#2c6574]">
          <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-[#2c6574]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#162736] mb-1">
          MrAdmin Access
        </h1>
        <p className="text-[#3b556b] font-medium text-xs mb-6">
          PBKDF2-SHA256 Protected Terminal • High-Security Vault
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
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
              className="w-full clay-search-pill py-3.5 pl-11 pr-4 text-[#162736] text-[15px] sm:text-xs font-mono font-bold focus:outline-none transition-colors"
              autoComplete="username"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#436279]" />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ACCESS KEY"
              disabled={isSubmitting}
              className="w-full clay-search-pill py-3.5 pl-11 pr-4 text-[#162736] text-[15px] sm:text-xs font-mono font-bold focus:outline-none transition-colors"
              autoFocus
              autoComplete="current-password"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#436279]" />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full clay-teal-btn py-3.5 text-white font-extrabold uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
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

      <SaqibSignature className="mt-8" />
    </div>
  );
}
