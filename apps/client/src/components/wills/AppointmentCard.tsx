'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, MapPin, User, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { StatusBadge } from './StatusBadge';
import Link from 'next/link';

interface AppointmentCardProps {
    appointment: {
        id: string;
        lawyerName: string;
        appointmentDate: string;
        location: 'office' | 'home';
        address: string;
        status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    };
    onCancel?: (id: string) => void;
}

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
    const { t } = useLanguage();
    const date = new Date(appointment.appointmentDate);
    const canCancel = appointment.status === 'PENDING';

    return (
        <Card className="hover:border-primary/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">
                                    {t('wills.appointments.appointment')} #{appointment.id.substring(0, 8).toUpperCase()}
                                </h3>
                                <StatusBadge status={appointment.status} />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{appointment.lawyerName}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{date.toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>
                                    {appointment.location === 'office'
                                        ? t('wills.appointments.location.office')
                                        : t('wills.appointments.location.home')}
                                    : {appointment.address}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                        >
                            <Link href={`/wills/appointments/${appointment.id}`}>
                                {t('wills.appointments.viewDetails')}
                            </Link>
                        </Button>
                        {canCancel && onCancel && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCancel(appointment.id)}
                                className="text-red-600 hover:text-red-700 hover:border-red-600"
                            >
                                <X className="w-4 h-4 mr-1" />
                                {t('wills.appointments.cancel')}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}



