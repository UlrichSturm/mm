import { useState, useEffect } from 'react';

const goldTextGradientClasses = [
  'gradient-gold-text-1',
  'gradient-gold-text-2',
  'gradient-gold-text-3',
  'gradient-gold-text-4',
  'gradient-gold-text-5',
  'gradient-gold-text-6',
  'gradient-gold-text-7',
  'gradient-gold-text-8',
];

const goldBackgroundGradientClasses = [
  'gradient-gold',
  'gradient-gold-vertical',
  'gradient-gold-radial',
];

function getRandomGradientClass(classes: string[]): string {
  const index = Math.floor(Math.random() * classes.length);
  return classes[index];
}

export function useRandomGoldTextGradient(key?: string): string {
  const [gradientClass, setGradientClass] = useState<string>(() => {
    return getRandomGradientClass(goldTextGradientClasses);
  });

  useEffect(() => {
    // Re-generate gradient on mount if key is provided
    if (key) {
      setGradientClass(getRandomGradientClass(goldTextGradientClasses));
    }
  }, [key]);

  return gradientClass;
}

export function useRandomGoldGradient(key?: string): string {
  const [gradientClass, setGradientClass] = useState<string>(() => {
    return getRandomGradientClass(goldBackgroundGradientClasses);
  });

  useEffect(() => {
    if (key) {
      setGradientClass(getRandomGradientClass(goldBackgroundGradientClasses));
    }
  }, [key]);

  return gradientClass;
}

