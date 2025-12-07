/**
 * Utility functions
 */
/**
 * Format price with currency symbol
 */
export declare function formatPrice(amount: number, currency?: string): string;
/**
 * Format date to locale string
 */
export declare function formatDate(date: Date | string, locale?: string): string;
/**
 * Format date and time
 */
export declare function formatDateTime(date: Date | string, locale?: string): string;
/**
 * Generate a slug from a string
 */
export declare function slugify(text: string): string;
/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
/**
 * Truncate text with ellipsis
 */
export declare function truncate(text: string, maxLength: number): string;
/**
 * Get initials from name
 */
export declare function getInitials(firstName: string, lastName: string): string;
/**
 * Delay execution (for async operations)
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export declare function isEmpty(value: unknown): boolean;
