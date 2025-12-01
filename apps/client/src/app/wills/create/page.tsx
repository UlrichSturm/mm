'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateWillPage() {
    const router = useRouter();

    useEffect(() => {
        // Immediate redirect - use window.location for reliability
        if (typeof window !== 'undefined') {
            window.location.href = '/wills/postal-code';
        }
    }, []);

    // Return null during SSR and while redirecting
    return null;
}

