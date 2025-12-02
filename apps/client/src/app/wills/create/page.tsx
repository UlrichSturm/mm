'use client';

import { useEffect } from 'react';

export default function CreateWillPage() {
  useEffect(() => {
    // Immediate redirect - use window.location for reliability
    if (typeof window !== 'undefined') {
      window.location.href = '/wills/postal-code';
    }
  }, []);

  // Return null during SSR and while redirecting
  return null;
}
