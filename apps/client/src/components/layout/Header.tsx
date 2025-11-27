'use client';

import Link from 'next/link';
import { ShoppingCart, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Header() {
    const { t, language, setLanguage } = useLanguage();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight gradient-heading-3 golden-shimmer">
                        Memento Mori
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/services" className="text-sm font-medium transition-colors hover:text-primary">
                            {t('nav.services')}
                        </Link>
                    </nav>
                </div>
                
                <div className="flex items-center gap-4">
                    <Link
                        href="/cart"
                        className="relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors"
                        aria-label="Shopping cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </Link>
                    
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent transition-colors cursor-pointer appearance-none pr-8"
                            aria-label="Select language"
                        >
                            <option value="en">EN</option>
                            <option value="ru">RU</option>
                        </select>
                        <Globe className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Link
                            href="/auth/signin"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            {t('nav.signIn')}
                        </Link>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            {t('nav.register')}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

