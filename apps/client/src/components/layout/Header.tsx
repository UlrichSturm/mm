'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Globe, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { PostalCodeDisplay } from '@/components/layout/PostalCodeDisplay';
import { isAuthenticated, getUser } from '@/lib/auth';

export function Header() {
    const { t, language, setLanguage } = useLanguage();
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = () => {
            const auth = isAuthenticated();
            const userData = getUser();
            setAuthenticated(auth);
            setUser(userData);
        };

        checkAuth();
        // Check auth on storage changes (e.g., after login)
        const interval = setInterval(checkAuth, 1000);
        window.addEventListener('storage', checkAuth);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight gradient-heading-3 golden-shimmer">
                        Memento Mori
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/services" prefetch={false} className="text-sm font-medium transition-colors hover:text-primary">
                            {t('nav.services')}
                        </Link>
                    </nav>
                </div>
                
                <div className="flex items-center gap-4">
                    <PostalCodeDisplay />
                    <NotificationCenter />
                    <Link
                        href="/cart"
                        prefetch={false}
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
                        {authenticated ? (
                            <Link
                                href="/profile"
                                prefetch={false}
                                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                {user?.firstName && user?.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.email?.split('@')[0] || t('nav.profile')
                                }
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/auth/signin"
                                    prefetch={false}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                >
                                    {t('nav.signIn')}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    prefetch={false}
                                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

