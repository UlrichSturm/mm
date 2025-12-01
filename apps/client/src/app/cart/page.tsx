'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 gradient-heading">
                        Shopping Cart
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Your cart is empty. Shopping cart functionality is coming soon.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/">
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

