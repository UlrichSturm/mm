import { apiRequest } from './utils';

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
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, options);
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
