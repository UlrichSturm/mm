/**
 * Централизованная конфигурация API
 * 
 * В браузере всегда используем localhost:3001 (бэкенд доступен через порт хоста)
 * На сервере (SSR) используем переменную окружения или localhost
 */
const getApiBaseUrl = (): string => {
  // В браузере всегда используем localhost:3001
  // (даже если приложение в Docker, браузер обращается к хосту)
  if (typeof window !== 'undefined') {
    return 'http://localhost:3001';
  }
  
  // На сервере (SSR) используем переменную окружения
  // В Docker это будет http://server:3001, но это только для SSR
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Если это Docker hostname, заменяем на localhost для SSR
  // (но это не критично, так как SSR используется редко)
  if (envUrl.includes('server:3001')) {
    return 'http://localhost:3001';
  }
  
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();



