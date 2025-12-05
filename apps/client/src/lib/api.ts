/**
 * API client with Keycloak authentication
 */

import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get headers with authentication token
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    return response.json();
  },

  async getMyAppointments() {
    const response = await fetch(`${API_BASE_URL}/wills/appointments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    return response.json();
  },

  async getAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/wills/appointments/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }
    return response.json();
  },

  async cancelAppointment(id: string) {
    const response = await fetch(`${API_BASE_URL}/wills/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
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

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/wills/executions`, {
      method: 'POST',
      headers,
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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create insurance policy');
    }
    return response.json();
  },

  async getInsurancePayments(policyId: string) {
    const response = await fetch(`${API_BASE_URL}/insurance/policies/${policyId}/payments`, {
      headers: getAuthHeaders(),
    });
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

  // Note: register() and login() are now handled by Keycloak
  // Use keycloak.register() and keycloak.login() from lib/keycloak.ts

  async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
      throw new Error(error.message || 'Failed to fetch profile');
    }
    return response.json();
  },

  // Orders
  async createOrder(data: { items: Array<{ serviceId: string; quantity: number }> }) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create order' }));
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  async getMyOrders() {
    const response = await fetch(`${API_BASE_URL}/orders/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  async getOrder(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  },

  // Payments
  async createPaymentIntent(orderId: string, returnUrl?: string) {
    const response = await fetch(`${API_BASE_URL}/payments/intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId, returnUrl }),
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to create payment intent' }));
      throw new Error(error.message || 'Failed to create payment intent');
    }
    return response.json();
  },

  async getMyPayments() {
    const response = await fetch(`${API_BASE_URL}/payments/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return response.json();
  },

  async getPayment(paymentId: string) {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }
    return response.json();
  },
};
