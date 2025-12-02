import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { VendorHeader } from '@/components/layout/VendorHeader';
import { VendorSidebar } from '@/components/layout/VendorSidebar';
import { KeycloakProvider } from '@/components/auth/KeycloakProvider';

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
                <KeycloakProvider>
                    <div className="flex min-h-screen bg-background">
                        <VendorSidebar />
                        <div className="flex-1 flex flex-col">
                            <VendorHeader />
                            <main className="flex-1 p-6">{children}</main>
                        </div>
                    </div>
                </KeycloakProvider>
            </body>
        </html>
    );
}



