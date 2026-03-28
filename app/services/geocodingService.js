// ============================================================
// Geocoding szolgáltatás – Cím → koordináta (Google Geocoding API)
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CONFIG } from '../config/google';

const CACHE_KEY = 'geocoding_cache_v1';

async function loadCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function saveCache(cache) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function geocodeDelivery(delivery) {
  const parts = [delivery.adresa, delivery.localitate, delivery.judet].filter(Boolean);
  if (!parts.length) return null;

  const cache = await loadCache();
  if (cache[delivery.id]) return cache[delivery.id];

  const apiKey = GOOGLE_CONFIG.mapsApiKey;
  if (!apiKey || apiKey.includes('YOUR_')) return null;

  const address = encodeURIComponent(parts.join(', ') + ', Romania');
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
    );
    const data = await resp.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      const coords = { latitude: lat, longitude: lng };
      await saveCache({ ...cache, [delivery.id]: coords });
      return coords;
    }
  } catch {}
  return null;
}
