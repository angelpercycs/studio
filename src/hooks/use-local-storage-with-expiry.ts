"use client";

import { useState, useEffect, useCallback } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const savedItem = localStorage.getItem(key);
  if (!savedItem) {
    return defaultValue;
  }

  try {
    const item = JSON.parse(savedItem);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    return item.value;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

export function useLocalStorageWithExpiry<T>(key: string, defaultValue: T, daysToLive: number) {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  const setStoredValue = useCallback((newValue: T | ((prevState: T) => T)) => {
     if (typeof window === 'undefined') {
      return;
    }
    const valueToStore = newValue instanceof Function ? newValue(getStorageValue(key, defaultValue)) : newValue;
    setValue(valueToStore);
    const now = new Date();
    const item = {
      value: valueToStore,
      expiry: now.getTime() + daysToLive * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }, [key, defaultValue, daysToLive]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setValue(getStorageValue(key, defaultValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);
  
  return [value, setStoredValue] as const;
}
