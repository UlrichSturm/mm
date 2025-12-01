'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Faith = 'christian' | 'muslim' | 'jewish' | 'buddhist' | 'hindu' | 'other';

interface FaithContextType {
  faith: Faith | null;
  setFaith: (faith: Faith | null) => void;
}

const FaithContext = createContext<FaithContextType | undefined>(undefined);

export function FaithProvider({ children }: { children: ReactNode }) {
  const [faith, setFaith] = useState<Faith | null>(null);

  return (
    <FaithContext.Provider value={{ faith, setFaith }}>
      {children}
    </FaithContext.Provider>
  );
}

export function useFaith() {
  const context = useContext(FaithContext);
  if (!context) {
    throw new Error('useFaith must be used within FaithProvider');
  }
  return context;
}

