'use client';
import dynamic from 'next/dynamic';

const Admin = dynamic(() => import('../../views/Admin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-[#e6e2d8] via-[#dbd5c9] to-[#cfc8ba] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg" />
        <span className="text-xs font-black tracking-widest text-zinc-800 uppercase animate-pulse">
          Loading MrAdmin Console...
        </span>
      </div>
    </div>
  ),
});

export default function MrAdminClient() {
  return <Admin />;
}
