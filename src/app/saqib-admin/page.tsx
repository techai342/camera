'use client';
import dynamic from 'next/dynamic';

const Admin = dynamic(() => import('../../views/Admin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function Page() {
  return <Admin />;
}
