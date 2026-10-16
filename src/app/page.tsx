'use client';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('../views/Home'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-[#1d2e3f] via-[#162736] to-[#0e1b27] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(45,212,191,0.25)]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-teal-400/80 animate-pulse">
          Starting Engine...
        </span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <Home />;
}
