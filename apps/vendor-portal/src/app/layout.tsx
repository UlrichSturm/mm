import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { KeycloakProvider } from '@/components/auth/KeycloakProvider';
import { LayoutContent } from '@/components/layout/LayoutContent';

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
        <html lang="en">
            <body className={`${inter.variable} ${inter.className}`}>
                <KeycloakProvider>
                    <LayoutContent>
                        {children}
                    </LayoutContent>
                </KeycloakProvider>
            </body>
        </html>
    );
}



