'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, CheckCircle2, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export default function HomePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const heroGradient = useRandomGoldTextGradient('hero-title');
    const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categoriesError, setCategoriesError] = useState<Error | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoadingCategories(true);
        setCategoriesError(null);
        try {
            const data = await apiClient.getCategories();
            setCategories(data.slice(0, 8)); // Show top 8 categories
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategoriesError(error instanceof Error ? error : new Error(String(error)));
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory && selectedCategory !== 'all') params.set('categoryId', selectedCategory);
        router.push(`/services?${params.toString()}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-16">
            {/* Hero Section with Search */}
            <section className="text-center py-12 md:py-20">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-4 gradient-heading-1">
                    {t('home.heroTitle')}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-10 max-w-2xl mx-auto px-4">
                    {t('home.heroSubtitle')}
                </p>

                <div className="mb-8">
                    <Button asChild size="lg" className="text-lg px-8 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all golden-shimmer-full">
                        <Link href="/wizard">
                            {t('home.wizardButton')} <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                        {t('home.wizardSubtitle')}
                    </p>
                </div>
                
                {/* Search Form */}
                <Card className="max-w-4xl mx-auto border-none shadow-lg">
                    <CardContent className="p-4 sm:p-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full text-left space-y-2">
                                <label className="text-sm font-medium ml-1">{t('home.searchPlaceholder')}</label>
                                <Input
                                    type="text"
                                    placeholder={t('common.search')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div className="w-full md:w-64 text-left space-y-2">
                                <label className="text-sm font-medium ml-1">{t('home.categoryLabel')}</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder={t('home.allCategories')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('home.allCategories')}</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-auto flex-shrink-0">
                                <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 min-w-[120px]">
                                    <Search className="mr-2 h-4 w-4" /> {t('home.searchButton')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </section>

            {/* Categories */}
            <section>
                {categoriesError ? (
                    <ErrorDisplay
                        error={categoriesError}
                        onRetry={loadCategories}
                        title="Failed to load categories"
                    />
                ) : loadingCategories ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {t('common.loading')}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                        {categories.map((category) => {
                            // Translate category name based on slug
                            const categoryKey = `categories.${category.slug}`;
                            const translatedName = t(categoryKey);
                            const displayName = translatedName !== categoryKey ? translatedName : category.name;
                            
                            // Get category-specific icon
                            const categoryIcon = getCategoryIcon(category.slug);
                            
                            return (
                                <Link key={category.id} href={`/categories/${category.slug}`} className="block h-full">
                                    <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer text-center golden-shimmer">
                                        <CardContent className="pt-8">
                                            <div className="text-4xl mb-4">{categoryIcon}</div>
                                            <h3 className="font-semibold text-lg gradient-category">{displayName}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {t('services.noServices')}
                    </div>
                )}
            </section>

            {/* How It Works */}
            <section className="bg-[#5D7A5D] py-12 sm:py-16 rounded-2xl sm:rounded-3xl">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center gradient-heading">
                        {t('home.howItWorks')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="text-center relative">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#D4AF37] text-ivory rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 font-bold text-xl sm:text-2xl shadow-lg">
                                    {step}
                                </div>
                                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-ivory">{t(`home.steps.${step}.title`)}</h3>
                                <p className="text-sm sm:text-base text-[#EDE8DA]">{t(`home.steps.${step}.desc`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="max-w-5xl mx-auto px-4 pb-12 sm:pb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center gradient-heading">
                    {t('home.benefits.title')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                            <h3 className="text-lg font-semibold mb-2">{t('home.benefits.verified.title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.benefits.verified.desc')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                            <h3 className="text-lg font-semibold mb-2">{t('home.benefits.secure.title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.benefits.secure.desc')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <Star className="h-10 w-10 text-primary mb-2" />
                            <h3 className="text-lg font-semibold mb-2">{t('home.benefits.reviews.title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.benefits.reviews.desc')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
