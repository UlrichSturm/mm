import { API_BASE_URL } from '../config';
import { logout } from '../auth';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  status: VendorStatus;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  userId: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorFilters {
  status?: VendorStatus;
  search?: string;
}

class VendorsApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
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
      // Если 401 - неавторизован, делаем logout и редирект
      // Но только если мы не на странице логина
      if (response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          logout();
        }
        throw new Error('Session expired. Please log in again.');
      }
      
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getAll(filters?: VendorFilters): Promise<VendorProfile[]> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    const query = params.toString();
    const endpoint = `/vendors${query ? `?${query}` : ''}`;
    
    return this.request<VendorProfile[]>(endpoint);
  }

  async getById(id: string): Promise<VendorProfile> {
    return this.request<VendorProfile>(`/vendors/${id}`);
  }

  async create(data: CreateVendorDto): Promise<VendorProfile> {
    return this.request<VendorProfile>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateVendorDto): Promise<VendorProfile> {
    return this.request<VendorProfile>(`/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateStatus(id: string, status: VendorStatus): Promise<VendorProfile> {
    return this.request<VendorProfile>(`/vendors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request(`/vendors/${id}`, {
      method: 'DELETE',
    });
  }
}

export const vendorsApi = new VendorsApiClient();

