'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface AppointmentsCalendarProps {
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

export function AppointmentsCalendar({ appointments, onAppointmentClick }: AppointmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      if (!appointment.appointmentDate) return false;
      const appointmentDate = new Date(appointment.appointmentDate);
      return isSameDay(appointmentDate, date);
    });
  };

  // Group appointments by date for month view
  const appointmentsByDate = new Map<string, any[]>();
  appointments.forEach(appointment => {
    if (appointment.appointmentDate) {
      const dateKey = format(new Date(appointment.appointmentDate), 'yyyy-MM-dd');
      if (!appointmentsByDate.has(dateKey)) {
        appointmentsByDate.set(dateKey, []);
      }
      appointmentsByDate.get(dateKey)!.push(appointment);
    }
  });

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar grid
  const firstDayOfWeek = getDay(monthStart);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  // Create calendar grid with empty cells for days before month start
  // getDay returns 0-6 (Sunday = 0), we need Monday = 0
  const firstDayIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  daysInMonth.forEach(day => calendarDays.push(day));
  
  // Fill remaining cells to complete the grid (6 weeks * 7 days = 42)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(null);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ru })}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToToday}>
                Сегодня
              </Button>
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={view === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('month')}
                >
                  Месяц
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('week')}
                >
                  Неделя
                </Button>
                <Button
                  variant={view === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('day')}
                >
                  День
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayAppointments = getAppointmentsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "aspect-square border rounded-lg p-1 overflow-hidden",
                    !isCurrentMonth && "opacity-40",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isToday && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => onAppointmentClick(appointment)}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate border",
                            statusColors[appointment.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                          )}
                          title={`${appointment.clientName || 'Клиент'}: ${format(new Date(appointment.appointmentDate), 'HH:mm')}`}
                        >
                          <div className="truncate">
                            {format(new Date(appointment.appointmentDate), 'HH:mm')} - {appointment.clientName || 'Клиент'}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground p-1">
                          +{dayAppointments.length - 3} еще
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="text-sm font-medium">Легенда:</div>
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded border", colorClass)} />
                <span className="text-sm text-muted-foreground">
                  {status === 'PENDING' && 'Ожидают'}
                  {status === 'CONFIRMED' && 'Подтверждены'}
                  {status === 'IN_PROGRESS' && 'В процессе'}
                  {status === 'COMPLETED' && 'Завершены'}
                  {status === 'CANCELLED' && 'Отменены'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

