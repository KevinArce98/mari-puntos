import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MariPuntos BETA - Convierte tu relación en el mejor juego',
  description:
    'Únete a la BETA privada. Gamificamos decisiones de pareja y llevá tu relación al siguiente nivel con humor, niños y mucha gamificación.',
  keywords: [
    'pareja',
    'relación',
    'permisos',
    'gamificación',
    'puntos',
    'rachas',
    'beta',
    'app de pareja',
    'Costa Rica',
  ],
  openGraph: {
    title: 'MariPuntos BETA - Convierte tu relación en el mejor juego',
    description:
      'Gamificamos decisiones de pareja. Gana puntos, solicita permisos y mantén rachas semanales junto a tu pareja.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
