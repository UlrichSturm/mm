import { API_BASE_URL } from '../config';
import { logout } from '../auth';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type WillExecutionStatus = 'PENDING' | 'EXECUTING' | 'EXECUTED' | 'CANCELLED';

export interface WillAppointment {
  id: string;
  clientId: string;
  lawyerNotaryId: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  lawyerNotary?: {
    id: string;
    licenseNumber: string;
    licenseType: string;
  };
}

export interface WillData {
  id: string;
  appointmentId: string;
  clientId: string;
  clientData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
  };
  relativesContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  heirs?: Array<{
    name: string;
    relationship: string;
    share?: string;
  }>;
  additionalInfo?: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WillExecution {
  id: string;
  willDataId: string;
  clientId: string;
  deathDate: string;
  notifiedBy: 'LAWYER' | 'RELATIVES';
  funeralStatus: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status: WillExecutionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WillAppointmentFilters {
  status?: AppointmentStatus;
  lawyerNotaryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface WillExecutionFilters {
  status?: WillExecutionStatus;
  dateFrom?: string;
  dateTo?: string;
}

interface ErrorResponse {
  message?: string;
  code?: string;
}

class WillsApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // If 401 - unauthorized, logout and redirect
      // But only if we're not on the login page
      if (response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          logout();
        }
        throw new Error('Session expired. Please log in again.');
      }

      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Request failed' };
      }

      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as Error & { status?: number; code?: string }).status = response.status;
      (error as Error & { status?: number; code?: string }).code = errorData.code;
      throw error;
    }

    return response.json();
  }

  // Appointments
  async getAllAppointments(filters?: WillAppointmentFilters): Promise<WillAppointment[]> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.lawyerNotaryId) {
      params.append('lawyerNotaryId', filters.lawyerNotaryId);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const query = params.toString();
    return this.request<WillAppointment[]>(`/wills/appointments${query ? `?${query}` : ''}`);
  }

  async getAppointment(id: string): Promise<WillAppointment> {
    return this.request<WillAppointment>(`/wills/appointments/${id}`);
  }

  // Will Data
  async getWillData(id: string): Promise<WillData> {
    return this.request<WillData>(`/wills/data/${id}`);
  }

  // Executions
  async getAllExecutions(filters?: WillExecutionFilters): Promise<WillExecution[]> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    const query = params.toString();
    return this.request<WillExecution[]>(`/wills/executions${query ? `?${query}` : ''}`);
  }

  async getExecution(id: string): Promise<WillExecution> {
    return this.request<WillExecution>(`/wills/executions/${id}`);
  }
}

export const willsApi = new WillsApiClient();
