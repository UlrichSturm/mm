import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { VendorHeader } from '@/components/layout/VendorHeader';
import { VendorSidebar } from '@/components/layout/VendorSidebar';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Vendor Portal - Memento Mori',
    description: 'Личный кабинет адвоката/нотариуса',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <body className={`${inter.variable} ${inter.className}`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}



