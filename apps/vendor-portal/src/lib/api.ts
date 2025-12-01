const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get auth token from localStorage or cookie
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || null;
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const vendorApi = {
  // Lawyer/Notary Profile
  async getMyProfile() {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me`);
  },

  async updateMyProfile(data: any) {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Settings
  async getMySettings() {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/settings`);
  },

  async updateSettings(data: {
    officePostalCode?: string;
    officeAddress?: string;
    officeRadius?: number;
    homeVisitEnabled?: boolean;
    homeVisitPostalCode?: string;
    homeVisitRadius?: number;
  }) {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Schedule
  async getMySchedule() {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/schedule`);
  },

  async getBlockedDates() {
    const schedule = await this.getMySchedule();
    return schedule?.blockedDates || [];
  },

  async updateSchedule(schedule: {
    monday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    tuesday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    wednesday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    thursday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    friday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    saturday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
    sunday?: { enabled: boolean; timeSlots: Array<{ start: string; end: string }> };
  }) {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/schedule`, {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    });
  },

  async blockDate(date: string) {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/schedule/block`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  async unblockDate(date: string) {
    return fetchWithAuth(`${API_BASE_URL}/lawyer-notary/me/schedule/block`, {
      method: 'DELETE',
      body: JSON.stringify({ date }),
    });
  },

  // Appointments
  async getMyAppointments(filters?: {
    status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    if (filters?.page) query.append('page', filters.page.toString());
    if (filters?.limit) query.append('limit', filters.limit.toString());
    
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments?${query}`);
  },

  async getAppointment(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments/${id}`);
  },

  async confirmAppointment(id: string, data?: { appointmentDate?: string; appointmentTime?: string }) {
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments/${id}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(data || {}),
    });
  },

  async cancelAppointment(id: string) {
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  async completeAppointment(id: string, willData: any) {
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(willData),
    });
  },

  // Will Data
  async createWillData(data: {
    appointmentId: string;
    clientData: {
      fullName: string;
      dateOfBirth: string;
      passportData: string;
      address: string;
      phone: string;
      email: string;
    };
    relatives?: Array<{
      name: string;
      relationship: string;
      phone: string;
      email: string;
    }>;
    beneficiaries?: Array<{
      name: string;
      relationship: string;
      share: string;
    }>;
    specialInstructions?: string;
    willNumber?: string;
    registrationDate?: string;
  }) {
    return fetchWithAuth(`${API_BASE_URL}/wills/data`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadWillDocument(willDataId: string, file: File) {
    const formData = new FormData();
    formData.append('document', file);
    
    return fetchWithAuth(`${API_BASE_URL}/wills/data/${willDataId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  // Death Notification
  async notifyDeath(data: {
    clientId?: string;
    appointmentId?: string;
    deathDate: string;
    deathCertificate: File;
    additionalDocuments?: File[];
    notifierContact: string;
  }) {
    const formData = new FormData();
    if (data.clientId) formData.append('clientId', data.clientId);
    if (data.appointmentId) formData.append('appointmentId', data.appointmentId);
    formData.append('deathDate', data.deathDate);
    formData.append('deathCertificate', data.deathCertificate);
    if (data.additionalDocuments) {
      data.additionalDocuments.forEach((doc) => {
        formData.append('additionalDocuments', doc);
      });
    }
    formData.append('notifierContact', data.notifierContact);
    
    return fetchWithAuth(`${API_BASE_URL}/wills/executions`, {
      method: 'POST',
      body: formData,
    });
  },

  // Clients
  async getMyClients(filters?: {
    status?: 'ACTIVE' | 'EXECUTING' | 'EXECUTED';
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    
    return fetchWithAuth(`${API_BASE_URL}/wills/appointments?${query}`);
  },
};

