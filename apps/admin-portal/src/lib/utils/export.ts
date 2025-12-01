export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  // Определяем заголовки
  const keys = Object.keys(data[0]) as Array<keyof T>;
  const csvHeaders = keys.map(key => headers?.[key] || String(key));

  // Создаем CSV строку
  const csvRows = [
    csvHeaders.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = row[key];
        // Обрабатываем значения с запятыми или кавычками
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLawyersToCSV(lawyers: any[]) {
  exportToCSV(
    lawyers.map(l => ({
      email: l.user?.email || '',
      licenseNumber: l.licenseNumber,
      licenseType: l.licenseType,
      status: l.status,
      organization: l.organization || '',
      specialization: l.specialization || '',
      yearsOfExperience: l.yearsOfExperience || '',
      officePostalCode: l.officePostalCode,
      officeAddress: l.officeAddress,
      phone: l.phone || '',
      createdAt: new Date(l.createdAt).toLocaleDateString('ru-RU'),
    })),
    'lawyers',
    {
      email: 'Email',
      licenseNumber: 'Номер лицензии',
      licenseType: 'Тип лицензии',
      status: 'Статус',
      organization: 'Организация',
      specialization: 'Специализация',
      yearsOfExperience: 'Годы опыта',
      officePostalCode: 'Почтовый индекс',
      officeAddress: 'Адрес офиса',
      phone: 'Телефон',
      createdAt: 'Дата создания',
    }
  );
}

export function exportAppointmentsToCSV(appointments: any[]) {
  exportToCSV(
    appointments.map(a => ({
      id: a.id.slice(0, 8),
      clientEmail: a.client?.email || '',
      lawyerLicense: a.lawyerNotary?.licenseNumber || '',
      appointmentDate: new Date(a.appointmentDate).toLocaleDateString('ru-RU'),
      appointmentTime: a.appointmentTime,
      location: a.location,
      status: a.status,
      createdAt: new Date(a.createdAt).toLocaleDateString('ru-RU'),
    })),
    'appointments',
    {
      id: 'ID заявки',
      clientEmail: 'Email клиента',
      lawyerLicense: 'Лицензия адвоката',
      appointmentDate: 'Дата встречи',
      appointmentTime: 'Время встречи',
      location: 'Место встречи',
      status: 'Статус',
      createdAt: 'Дата создания',
    }
  );
}



