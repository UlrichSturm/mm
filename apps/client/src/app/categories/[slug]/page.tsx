'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function CategoryPage() {
    const params = useParams();
    const { t } = useLanguage();
    const slug = params?.slug as string;

    // Translate category slug to name
    const categoryKey = `categories.${slug}`;
    const categoryName = t(categoryKey) !== categoryKey ? t(categoryKey) : slug;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card className="border-none shadow-lg">
                <CardContent className="p-6 sm:p-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 gradient-heading">
                        {categoryName}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Category page is coming soon. Please use the search functionality to find services in this category.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

