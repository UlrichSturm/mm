/**
 * Application constants
 */

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Currency
export const DEFAULT_CURRENCY = 'EUR';
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'RUB'] as const;

// Time
export const DEFAULT_TIMEZONE = 'Europe/Berlin';

// File uploads
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const POSTAL_CODE_REGEX = /^\d{5}$/;

// Order
export const ORDER_CANCELLATION_HOURS = 24; // Hours before scheduled date when cancellation is allowed

// Reviews
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Search
export const DEFAULT_SEARCH_RADIUS_KM = 50;
export const MAX_SEARCH_RADIUS_KM = 200;

// Session
export const SESSION_EXPIRY_HOURS = 24;
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;

