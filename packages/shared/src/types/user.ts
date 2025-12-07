/**
 * User roles in the system
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  NOTARY = 'NOTARY',
}

/**
 * Base user interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vendor profile
 */
export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  description?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  stripeAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin user
 */
export interface Admin {
  id: string;
  userId: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

