'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { AppointmentCard } from '@/components/wills/AppointmentCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { apiClient } from '@/lib/api';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Filter, Calendar } from 'lucide-react';

interface Appointment {
    id: string;
    lawyerName: string;
    appointmentDate: string;
    location: 'office' | 'home';
    address: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function MyAppointmentsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.getMyAppointments();
            // Transform API data to our format
            const transformedAppointments: Appointment[] = data.map((apt: any) => ({
                id: apt.id,
                lawyerName: apt.lawyer?.name || apt.lawyerName || 'Unknown Lawyer',
                appointmentDate: apt.appointmentDate || apt.date,
                location: apt.location || 'office',
                address: apt.address || apt.clientAddress || 'N/A',
                status: apt.status || 'PENDING',
            }));
            setAppointments(transformedAppointments);
        } catch (err) {
            console.error('Failed to load appointments:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm(t('wills.appointments.confirmCancel'))) {
            return;
        }

        try {
            await apiClient.cancelAppointment(id);
            // Reload appointments
            await loadAppointments();
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            alert(t('wills.appointments.cancelError'));
        }
    };

    const filteredAndSortedAppointments = appointments
        .filter((apt) => {
            if (statusFilter === 'all') return true;
            return apt.status === statusFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
            } else {
                return a.status.localeCompare(b.status);
            }
        });

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12 text-muted-foreground">
                    {t('common.loading')}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorDisplay
                    error={error}
                    onRetry={loadAppointments}
                    title={t('wills.appointments.loadError')}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 gradient-heading">
                        {t('wills.appointments.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('wills.appointments.subtitle')}
                    </p>
                </div>
                <Button
                    asChild
                    className="mt-4 sm:mt-0"
                >
                    <Link href="/wills/create">
                        {t('wills.appointments.createNew')}
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-12">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder={t('wills.appointments.filterStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('wills.appointments.filterAll')}</SelectItem>
                            <SelectItem value="PENDING">{t('wills.appointments.status.pending')}</SelectItem>
                            <SelectItem value="CONFIRMED">{t('wills.appointments.status.confirmed')}</SelectItem>
                            <SelectItem value="COMPLETED">{t('wills.appointments.status.completed')}</SelectItem>
                            <SelectItem value="CANCELLED">{t('wills.appointments.status.cancelled')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-48">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'status')}>
                        <SelectTrigger className="h-12">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">{t('wills.appointments.sortByDate')}</SelectItem>
                            <SelectItem value="status">{t('wills.appointments.sortByStatus')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Appointments List */}
            {filteredAndSortedAppointments.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {t('wills.appointments.noAppointments')}
                    </p>
                    <Button asChild>
                        <Link href="/wills/create">
                            {t('wills.appointments.createNew')}
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedAppointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onCancel={handleCancel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

