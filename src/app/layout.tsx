import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Fredoka } from 'next/font/google';
import { AntiInspectionShield } from '../components/AntiInspectionShield';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Muhammad Saqib | 3D Liquid Glass Control Center & Cyber Hub',
  description: 'Tactile 3D Liquid Glass URL Intelligence, Camera Verification & Cyber Security OS by Muhammad Saqib.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
  openGraph: {
    title: 'Muhammad Saqib | 3D Liquid Glass Control Center',
    description: 'Tactile 3D Liquid Glass URL Intelligence, Camera Verification & Cyber Security OS by Muhammad Saqib.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#e6e2d8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${fredoka.variable}`} suppressHydrationWarning>
      <body className="antialiased selection:bg-amber-300 selection:text-zinc-900 relative" suppressHydrationWarning>
        <AntiInspectionShield />

        {/* Ambient Refraction Blobs Behind Glass Surfaces */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="relative w-full max-w-6xl h-full">
            <div id="blob-1" className="ambient-refraction-blob w-72 h-72 bg-amber-400/40 top-16 left-8" />
            <div id="blob-2" className="ambient-refraction-blob w-80 h-80 bg-teal-500/30 top-96 right-12" />
            <div id="blob-3" className="ambient-refraction-blob w-72 h-72 bg-rose-400/30 bottom-24 left-1/3" />
            <div id="blob-4" className="ambient-refraction-blob w-64 h-64 bg-indigo-500/25 top-40 right-1/4" />
          </div>
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
