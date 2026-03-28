// ============================================================
// useDeliveries hook – Szállítások lekérése + gyorsítótár
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDeliveries } from '../services/googleSheets';

const CACHE_KEY = 'deliveries_cache';
const CACHE_TS_KEY = 'deliveries_cache_ts';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 perc

export function useDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setDeliveries(JSON.parse(cached));
      }
    } catch (_) {}
  };

  const saveToCache = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      const ts = Date.now();
      await AsyncStorage.setItem(CACHE_TS_KEY, String(ts));
      setLastUpdated(ts);
    } catch (_) {}
  };

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      // Ellenőrizzük a cache érvényességét
      if (!force) {
        const ts = await AsyncStorage.getItem(CACHE_TS_KEY);
        if (ts && Date.now() - Number(ts) < CACHE_TTL_MS) {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            setDeliveries(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }
      }

      const data = await fetchDeliveries();
      // Minden sorhoz hozzáadjuk a rowIndex-et
      const dataWithIndex = data.map((d, i) => ({ ...d, rowIndex: i }));
      setDeliveries(dataWithIndex);
      await saveToCache(dataWithIndex);
    } catch (err) {
      setError('Nem sikerült betölteni az adatokat. Ellenőrizd az internetkapcsolatot.');
      // Offline: próbálunk cache-ből tölteni
      await loadFromCache();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliveryInState = useCallback((rowIndex, updates) => {
    setDeliveries((prev) => {
      const updated = prev.map((d) =>
        d.rowIndex === rowIndex ? { ...d, ...updates } : d
      );
      saveToCache(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    // Először cache-ből töltünk, majd frissítünk hálózatról
    loadFromCache().then(() => refresh());
  }, []);

  return { deliveries, loading, error, refresh, updateDeliveryInState };
}
