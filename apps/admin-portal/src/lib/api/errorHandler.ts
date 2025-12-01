/**
 * API error handling utilities
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Try to extract information from error message
    const message = error.message;
    
    // Check if status code is in the message
    const statusMatch = message.match(/status:\s*(\d+)/i);
    const status = statusMatch ? parseInt(statusMatch[1]) : undefined;
    
    return {
      message,
      status,
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && typeof error === 'object') {
    const err = error as any;
    return {
      message: err.message || err.error || 'An unknown error occurred',
      status: err.status || err.statusCode,
      code: err.code,
      details: err.details,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);
  
  // User-friendly messages for known errors
  if (apiError.status === 401) {
    return 'Authorization required. Please log in.';
  }
  
  if (apiError.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (apiError.status === 404) {
    return 'Requested resource not found.';
  }
  
  if (apiError.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (apiError.status === 503) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
    return 'Connection error. Please ensure the backend server is running on http://localhost:3001';
  }
  
  return apiError.message;
}



