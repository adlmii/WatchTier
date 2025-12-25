import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timer untuk update value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Kalau user ngetik lagi sebelum timer habis, timer di-reset
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}