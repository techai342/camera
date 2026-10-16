'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SaqibAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mradmin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(20,184,166,0.3)]" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Redirecting to /mradmin...</span>
      </div>
    </div>
  );
}
