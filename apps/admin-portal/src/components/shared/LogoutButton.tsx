'use client';

import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Выход
    </button>
  );
}

