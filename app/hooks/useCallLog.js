// ============================================================
// useCallLog hook – Hívásnapló kezelése
// ============================================================
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CALL_OUTCOMES = {
  VISSZAIGAZOLT: 'Visszaigazolt',
  NEM_ELERHETO: 'Nem elérhető',
  VISSZAHIVANDO: 'Visszahívandó',
};

const STORAGE_KEY = 'call_logs_v1';

export function useCallLog() {
  const [callLogs, setCallLogs] = useState({});

  const loadCallLogs = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setCallLogs(JSON.parse(raw));
    } catch {}
  }, []);

  const logCall = useCallback((deliveryId, outcome) => {
    const timestamp = new Date().toISOString();
    setCallLogs(prev => {
      const existing = prev[deliveryId] || { attempts: [] };
      const updated = {
        ...existing,
        attempts: [...existing.attempts, { timestamp, outcome }],
        latestOutcome: outcome,
        lastCallTime: timestamp,
      };
      const next = { ...prev, [deliveryId]: updated };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  useEffect(() => {
    loadCallLogs();
  }, []);

  return { callLogs, logCall, loadCallLogs };
}
