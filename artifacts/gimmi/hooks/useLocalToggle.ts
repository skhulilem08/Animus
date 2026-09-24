import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persists a boolean toggle to on-device storage only. There's no backend
 * endpoint for notification/privacy preferences in this app yet, so these
 * settings are real and durable on this device, but not synced to the
 * server or to any other device the person signs into.
 */
export function useLocalToggle(key: string, defaultValue: boolean) {
  const storageKey = `gimmi:pref:${key}`;
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (cancelled) return;
      if (stored !== null) setValue(stored === '1');
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [storageKey]);

  const set = useCallback((next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(storageKey, next ? '1' : '0');
  }, [storageKey]);

  return [value, set, loaded] as const;
}
