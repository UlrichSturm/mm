export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>,
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Define headers
  const keys = Object.keys(data[0]) as Array<keyof T>;
  const csvHeaders = keys.map(key => headers?.[key] || String(key));

  // Create CSV string
  const csvRows = [
    csvHeaders.join(','),
    ...data.map(row =>
      keys
        .map(key => {
          const value = row[key];
          // Handle values with commas or quotes
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(','),
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

interface LawyerExport {
  user?: { email?: string };
  licenseNumber: string;
  licenseType: string;
  status: string;
  organization?: string;
  specialization?: string;
  yearsOfExperience?: number;
  officePostalCode: string;
  officeAddress: string;
  phone?: string;
  createdAt: string;
}

export function exportLawyersToCSV(lawyers: LawyerExport[]) {
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
      createdAt: new Date(l.createdAt).toLocaleDateString('de-DE'),
    })),
    'lawyers',
    {
      email: 'Email',
      licenseNumber: 'License Number',
      licenseType: 'License Type',
      status: 'Status',
      organization: 'Organization',
      specialization: 'Specialization',
      yearsOfExperience: 'Years of Experience',
      officePostalCode: 'Postal Code',
      officeAddress: 'Office Address',
      phone: 'Phone',
      createdAt: 'Created At',
    },
  );
}

interface AppointmentExport {
  id: string;
  client?: { email?: string };
  lawyerNotary?: { licenseNumber?: string };
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  status: string;
  createdAt: string;
}

export function exportAppointmentsToCSV(appointments: AppointmentExport[]) {
  exportToCSV(
    appointments.map(a => ({
      id: a.id.slice(0, 8),
      clientEmail: a.client?.email || '',
      lawyerLicense: a.lawyerNotary?.licenseNumber || '',
      appointmentDate: new Date(a.appointmentDate).toLocaleDateString('de-DE'),
      appointmentTime: a.appointmentTime,
      location: a.location,
      status: a.status,
      createdAt: new Date(a.createdAt).toLocaleDateString('de-DE'),
    })),
    'appointments',
    {
      id: 'Request ID',
      clientEmail: 'Client Email',
      lawyerLicense: 'Lawyer License',
      appointmentDate: 'Appointment Date',
      appointmentTime: 'Appointment Time',
      location: 'Location',
      status: 'Status',
      createdAt: 'Created At',
    },
  );
}
