'use client';

import { useEffect, useState } from 'react';
import {
  willsApi,
  WillExecution,
  WillExecutionFilters,
  WillExecutionStatus,
} from '@/lib/api/wills';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Calendar, User, CreditCard } from 'lucide-react';

const statusLabels: Record<WillExecutionStatus, string> = {
  PENDING: 'Pending',
  EXECUTING: 'Executing',
  EXECUTED: 'Executed',
  CANCELLED: 'Cancelled',
};

export default function ExecutionsPage() {
  const { error, handleError, clearError } = useErrorHandler();
  const [executions, setExecutions] = useState<WillExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<WillExecutionFilters>({});

  useEffect(() => {
    loadExecutions();
  }, [filters]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      clearError();
      const data = await willsApi.getAllExecutions(filters);
      setExecutions(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status?: WillExecutionStatus) => {
    setFilters(prev => ({ ...prev, status }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Исполнение завещаний</h1>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          onRetry={loadExecutions}
          showRetry={true}
        />
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!filters.status ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(undefined)}
            >
              Все статусы
            </Button>
            <Button
              variant={filters.status === 'PENDING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              variant={filters.status === 'EXECUTING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('EXECUTING')}
            >
              Executing
            </Button>
            <Button
              variant={filters.status === 'EXECUTED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('EXECUTED')}
            >
              Executed
            </Button>
            <Button
              variant={filters.status === 'CANCELLED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('CANCELLED')}
            >
              Cancelled
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {executions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Исполняемые завещания не найдены</p>
            </CardContent>
          </Card>
        ) : (
          executions.map(execution => (
            <Card key={execution.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Исполнение #{execution.id.slice(0, 8)}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                        {statusLabels[execution.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Клиент ID:</span>{' '}
                          {execution.clientId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <span className="font-medium">Дата смерти:</span>{' '}
                          {new Date(execution.deathDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Notified by:</span>{' '}
                        {execution.notifiedBy === 'LAWYER' ? 'Lawyer' : 'Relatives'}
                      </div>
                      <div>
                        <span className="font-medium">Статус похорон:</span>{' '}
                        {execution.funeralStatus}
                      </div>
                      {execution.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span>
                            <span className="font-medium">Способ оплаты:</span>{' '}
                            {execution.paymentMethod}
                          </span>
                        </div>
                      )}
                      {execution.paymentStatus && (
                        <div>
                          <span className="font-medium">Статус оплаты:</span>{' '}
                          {execution.paymentStatus}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Создано:</span>{' '}
                        {new Date(execution.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
