import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Saqib Visuals - ShortyOS 3D Clay',
  description: 'High-Performance 3D Clay URL Shortener with Camera Verification & Visitor Intelligence.',
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased overflow-x-hidden selection:bg-[#3a7d8c]/30 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
