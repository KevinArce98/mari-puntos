import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MariPuntos - Gamifica los permisos en tu relación",
  description: "Transforma la dinámica de permisos entre parejas en una experiencia divertida y gamificada. Gana puntos, solicita permisos, canjea recompensas y desbloquea logros.",
  keywords: ["pareja", "relación", "permisos", "gamificación", "puntos", "recompensas", "Costa Rica"],
  openGraph: {
    title: "MariPuntos - Gamifica los permisos en tu relación",
    description: "Gana puntos por acciones, solicita permisos, canjea recompensas y desbloquea logros junto a tu pareja.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
