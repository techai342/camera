'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';

const Redirect = dynamic(() => import('../../views/Redirect'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 min-h-screen bg-white z-[9999]" />,
});

export default function Page({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = use(params);
  return <Redirect shortCode={resolvedParams.shortCode} />;
}
