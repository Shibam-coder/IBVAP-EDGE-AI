import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IBVAP-EDGE AI - Tactical Surveillance & Perimeter Defense',
  description: 'Intelligent Border Video Analytics Platform (Problem Statement ID: 26187)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-[#05070A] text-[#e2e2e8] font-sans antialiased overflow-x-hidden selection:bg-[#00d1ff] selection:text-black">
        {children}
      </body>
    </html>
  );
}
