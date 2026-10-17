'use client';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('../views/Home'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e2d8] via-[#dbd5c9] to-[#cfc8ba] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin shadow-lg" />
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800 animate-pulse">
          Starting 3D Liquid OS...
        </span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <Home />;
}
