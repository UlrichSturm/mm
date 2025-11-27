'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Memento Mori</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {t('footer.tagline')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('footer.description')}
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold mb-4">{t('footer.aboutUs')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {t('nav.services')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('footer.email')}: support@mementomori.com
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="mailto:support@mementomori.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                                <Mail className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © 2025 Memento Mori. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
}

