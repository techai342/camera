import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Saqib Visuals - ShortyOS 3D Clay',
  description: 'High-Performance 3D Clay URL Shortener with Camera Verification & Visitor Intelligence.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
  openGraph: {
    title: 'Saqib Visuals - ShortyOS 3D Clay',
    description: 'High-Performance 3D Clay URL Shortener with Camera Verification & Visitor Intelligence.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1d2e3f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased overflow-x-hidden selection:bg-[#3a7d8c]/30 selection:text-white" suppressHydrationWarning>
        <AntiInspectionShield />
        {children}
      </body>
    </html>
  );
}
