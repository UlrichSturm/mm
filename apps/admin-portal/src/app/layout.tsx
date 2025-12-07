import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LayoutContent } from '@/components/layout/LayoutContent';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Admin Portal - Memento Mori',
  description: 'Administrative panel for managing lawyers, notaries, and vendors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className}`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
