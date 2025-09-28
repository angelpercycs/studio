"use client";

import { useState, useEffect } from 'react';

function getStorageValue<T>(key: string, defaultValue: T, daysToLive: number): T {
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
    return getStorageValue(key, defaultValue, daysToLive);
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedValue = getStorageValue(key, defaultValue, daysToLive);
    if (JSON.stringify(value) !== JSON.stringify(savedValue)) {
        setValue(savedValue);
    }
  }, [key, defaultValue, daysToLive]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + daysToLive * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }, [key, value, daysToLive]);

  return [value, setValue] as const;
}
