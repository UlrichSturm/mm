const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },

  async getServices(params?: { search?: string; categoryId?: string }) {
    const query = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(`${API_BASE_URL}/services?${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  },

  // Will/Appointment related methods
  async getAvailableLawyers(postalCode: string) {
    const response = await fetch(
      `${API_BASE_URL}/lawyer-notary/available?postalCode=${postalCode}`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch available lawyers');
    }
    return response.json();
  },

  async getLawyerSchedule(lawyerId: string) {
    const response = await fetch(`${API_BASE_URL}/lawyer-notary/${lawyerId}/schedule`);
    if (!response.ok) {
      throw new Error('Failed to fetch lawyer schedule');
    }
    return response.json();
  },

  async createWillAppointment(data: {
    lawyerId: string;
    appointmentDate: string;
    location: 'office' | 'home';
    clientAddress?: string;
    insurance?: boolean;
    paymentMethod?: 'prepayment' | 'insurance' | 'relatives';
  }) {
    const response = await fetch(`${API_BASE_URL}/wills/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    return response.json();
  },

  async getMyAppointments() {
    const response = await fetch(`${API_BASE_URL}/wills/appointments`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  },

  async getAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/wills/appointments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }
    return response.json();
  },

  async cancelAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/wills/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }
    return response.json();
  },

  async notifyDeath(data: {
    clientName?: string;
    appointmentNumber?: string;
    deathDate: string;
    deathCertificate?: File;
    notifierContact: string;
  }) {
    const formData = new FormData();
    if (data.clientName) {
      formData.append('clientName', data.clientName);
    }
    if (data.appointmentNumber) {
      formData.append('appointmentNumber', data.appointmentNumber);
    }
    formData.append('deathDate', data.deathDate);
    if (data.deathCertificate) {
      formData.append('deathCertificate', data.deathCertificate);
    }
    formData.append('notifierContact', data.notifierContact);

    const response = await fetch(`${API_BASE_URL}/wills/executions`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to notify death');
    }
    return response.json();
  },

  async createInsurancePolicy(data: { appointmentId: string; coverageAmount?: number }) {
    const response = await fetch(`${API_BASE_URL}/insurance/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create insurance policy');
    }
    return response.json();
  },

  async getInsurancePayments(policyId: string) {
    const response = await fetch(`${API_BASE_URL}/insurance/policies/${policyId}/payments`);
    if (!response.ok) {
      throw new Error('Failed to fetch insurance payments');
    }
    return response.json();
  },

  async getCityByPostalCode(postalCode: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/postal-codes/${postalCode}`);
      if (!response.ok) {
        // If API doesn't have this endpoint, return null
        return null;
      }
      const data = await response.json();
      return data.city || data.name || null;
    } catch {
      // If API call fails, try fallback to a simple mapping or external API
      return null;
    }
  },

  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid email or password');
    }
    return response.json();
  },

  async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
    const getToken = () => {
      if (typeof window === 'undefined') {
        return null;
      }
      // Try localStorage first
      const localToken = localStorage.getItem('authToken');
      if (localToken) {
        return localToken;
      }
      // Try cookies
      const cookieToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('authToken='))
        ?.split('=')[1];
      return cookieToken || null;
    };

    const token = getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  async getProfile() {
    const getToken = () => {
      if (typeof window === 'undefined') {
        return null;
      }
      // Try localStorage first
      const localToken = localStorage.getItem('authToken');
      if (localToken) {
        return localToken;
      }
      // Try cookies
      const cookieToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('authToken='))
        ?.split('=')[1];
      return cookieToken || null;
    };

    const token = getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
      throw new Error(error.message || 'Failed to fetch profile');
    }
    return response.json();
  },
};
