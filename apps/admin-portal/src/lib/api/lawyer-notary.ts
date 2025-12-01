import { API_BASE_URL } from '../config';
import { logout } from '../auth';

export type LawyerNotaryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LicenseType = 'LAWYER' | 'NOTARY' | 'BOTH';

export interface LawyerNotaryProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseType: LicenseType;
  organization?: string;
  specialization?: string;
  yearsOfExperience?: number;
  officePostalCode: string;
  officeAddress: string;
  phone?: string;
  status: LawyerNotaryStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CreateLawyerNotaryDto {
  userId: string;
  licenseNumber: string;
  licenseType: LicenseType;
  organization?: string;
  specialization?: string;
  yearsOfExperience?: number;
  officePostalCode: string;
  officeAddress: string;
  phone?: string;
}

export interface UpdateLawyerNotaryDto extends Partial<CreateLawyerNotaryDto> {}

export interface LawyerNotaryFilters {
  status?: LawyerNotaryStatus;
  licenseType?: LicenseType;
  search?: string;
  postalCode?: string;
}

class LawyerNotaryApiClient {
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
        errorData = { message: 'Request failed' };
      }
      
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).code = errorData.code;
      throw error;
    }

    return response.json();
  }

  async getAll(filters?: LawyerNotaryFilters): Promise<LawyerNotaryProfile[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.licenseType) params.append('licenseType', filters.licenseType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.postalCode) params.append('postalCode', filters.postalCode);

    const query = params.toString();
    return this.request<LawyerNotaryProfile[]>(
      `/lawyer-notary${query ? `?${query}` : ''}`
    );
  }

  async getOne(id: string): Promise<LawyerNotaryProfile> {
    return this.request<LawyerNotaryProfile>(`/lawyer-notary/${id}`);
  }

  async create(data: CreateLawyerNotaryDto): Promise<LawyerNotaryProfile> {
    return this.request<LawyerNotaryProfile>('/lawyer-notary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateLawyerNotaryDto): Promise<LawyerNotaryProfile> {
    return this.request<LawyerNotaryProfile>(`/lawyer-notary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateStatus(
    id: string,
    status: LawyerNotaryStatus,
    comment?: string
  ): Promise<LawyerNotaryProfile> {
    return this.request<LawyerNotaryProfile>(`/lawyer-notary/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/lawyer-notary/${id}`, {
      method: 'DELETE',
    });
  }
}

export const lawyerNotaryApi = new LawyerNotaryApiClient();

