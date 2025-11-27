import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FaithProvider } from '@/components/faith/FaithContext';
import { FaithSelector } from '@/components/faith/FaithSelector';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { CartProviderWrapper } from '@/components/cart/CartProviderWrapper';
import { ErrorBoundaryWrapper } from '@/components/layout/ErrorBoundaryWrapper';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Memento Mori',
    description: 'Platform for organizing ritual services',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${inter.className}`}>
                <LanguageProvider>
                    <CartProviderWrapper>
                        <FaithProvider>
                            <ErrorBoundaryWrapper>
                                <div className="flex min-h-screen flex-col bg-iso26-white">
                                <Header />
                                <main className="flex-1">{children}</main>
                                <Footer />
                            </div>
                            <FaithSelector />
                            </ErrorBoundaryWrapper>
                        </FaithProvider>
                    </CartProviderWrapper>
                </LanguageProvider>
            </body>
        </html>
    );
}

