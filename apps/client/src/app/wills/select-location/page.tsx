'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MapPin, Home, Building2, Phone } from 'lucide-react';

interface AddressForm {
    city: string;
    street: string;
    house: string;
    apartment: string;
    phone: string;
}

export default function SelectLocationPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [locationType, setLocationType] = useState<'office' | 'home' | null>(null);
    const [addressForm, setAddressForm] = useState<AddressForm>({
        city: '',
        street: '',
        house: '',
        apartment: '',
        phone: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [lawyerInfo, setLawyerInfo] = useState<{ address: string; maxTravelRadius?: number } | null>(null);

    useEffect(() => {
        // Get selected lawyer info from localStorage or API
        const lawyerId = localStorage.getItem('selectedLawyerId');
        if (!lawyerId) {
            router.push('/wills/select-lawyer');
            return;
        }

        // Load saved address details if available
        const savedAddressDetails = localStorage.getItem('clientAddressDetails');
        if (savedAddressDetails) {
            try {
                const parsed = JSON.parse(savedAddressDetails);
                setAddressForm(prev => ({ ...parsed, ...prev }));
            } catch (e) {
                // Ignore parse errors
            }
        }

        // TODO: Fetch lawyer info from API
        // For now, use placeholder
        setLawyerInfo({
            address: '123 Main Street, City',
            maxTravelRadius: 50,
        });
    }, [router]);

    const validateAddress = (): boolean => {
        if (!addressForm.city.trim()) {
            setError(t('wills.location.cityRequired'));
            return false;
        }
        if (!addressForm.street.trim()) {
            setError(t('wills.location.streetRequired'));
            return false;
        }
        if (!addressForm.house.trim()) {
            setError(t('wills.location.houseRequired'));
            return false;
        }
        if (addressForm.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(addressForm.phone.trim())) {
            setError(t('wills.location.phoneInvalid'));
            return false;
        }
        return true;
    };

    const handleInputChange = (field: keyof AddressForm, value: string) => {
        setAddressForm(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!locationType) {
            setError(t('wills.location.typeRequired'));
            return;
        }

        if (locationType === 'home') {
            if (!validateAddress()) {
                return;
            }

            // Combine address fields
            const fullAddress = `${addressForm.street}, ${addressForm.house}${addressForm.apartment ? `, apt. ${addressForm.apartment}` : ''}, ${addressForm.city}`;
            
            // TODO: Check if address is within lawyer's travel radius
            localStorage.setItem('appointmentLocation', 'home');
            localStorage.setItem('clientAddress', fullAddress);
            localStorage.setItem('clientAddressDetails', JSON.stringify(addressForm));
            if (addressForm.phone.trim()) {
                localStorage.setItem('clientPhone', addressForm.phone.trim());
            }
        } else {
            localStorage.setItem('appointmentLocation', 'office');
        }

        router.push('/wills/select-datetime');
    };

    if (!lawyerInfo) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 text-muted-foreground">
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-heading">
                {t('wills.location.title')}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
                {t('wills.location.subtitle')}
            </p>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
                    {/* Office Option */}
                    <Card
                        className={`cursor-pointer transition-all ${
                            locationType === 'office'
                                ? 'border-primary shadow-md'
                                : 'hover:border-primary/50'
                        }`}
                        onClick={() => setLocationType('office')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${
                                    locationType === 'office' ? 'bg-primary/10' : 'bg-muted'
                                }`}>
                                    <Building2 className={`w-6 h-6 ${
                                        locationType === 'office' ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">
                                        {t('wills.location.office')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {t('wills.location.officeDesc')}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>{lawyerInfo.address}</span>
                                    </div>
                                </div>
                                {locationType === 'office' && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Home Visit Option */}
                    <Card
                        className={`cursor-pointer transition-all ${
                            locationType === 'home'
                                ? 'border-primary shadow-md'
                                : 'hover:border-primary/50'
                        }`}
                        onClick={() => setLocationType('home')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${
                                    locationType === 'home' ? 'bg-primary/10' : 'bg-muted'
                                }`}>
                                    <Home className={`w-6 h-6 ${
                                        locationType === 'home' ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">
                                        {t('wills.location.home')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {t('wills.location.homeDesc')}
                                        {lawyerInfo.maxTravelRadius && (
                                            <span className="block mt-1">
                                                {t('wills.location.radiusInfo')}: {lawyerInfo.maxTravelRadius} km
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {locationType === 'home' && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Address Form for Home Visit */}
                {locationType === 'home' && (
                    <Card className="mb-6 border-none shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {t('wills.location.addressLabel')}
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('wills.location.city')}
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder={t('wills.location.cityPlaceholder')}
                                        value={addressForm.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        className="h-12"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {t('wills.location.street')}
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder={t('wills.location.streetPlaceholder')}
                                        value={addressForm.street}
                                        onChange={(e) => handleInputChange('street', e.target.value)}
                                        className="h-12"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {t('wills.location.house')}
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder={t('wills.location.housePlaceholder')}
                                            value={addressForm.house}
                                            onChange={(e) => handleInputChange('house', e.target.value)}
                                            className="h-12"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {t('wills.location.apartment')}
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder={t('wills.location.apartmentPlaceholder')}
                                            value={addressForm.apartment}
                                            onChange={(e) => handleInputChange('apartment', e.target.value)}
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {t('wills.location.phone')}
                                    </label>
                                    <Input
                                        type="tel"
                                        placeholder={t('wills.location.phonePlaceholder')}
                                        value={addressForm.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="h-12"
                                    />
                                </div>

                                {error && locationType === 'home' && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && locationType !== 'home' && (
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        {t('common.back')}
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                    >
                        {t('common.continue')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

