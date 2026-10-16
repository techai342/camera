'use client';
import dynamic from 'next/dynamic';

const Admin = dynamic(() => import('../../views/Admin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(20,184,166,0.3)]" />
        <span className="text-xs font-black tracking-widest text-teal-400 uppercase animate-pulse">
          Loading MrAdmin Console...
        </span>
      </div>
    </div>
  ),
});

export default function MrAdminPage() {
  return <Admin />;
}
