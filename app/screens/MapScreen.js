import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveries } from '../hooks/useDeliveries';
import { geocodeDelivery } from '../services/geocodingService';
import { getStatusConfig } from '../config/statusConfig';
import { GOOGLE_CONFIG } from '../config/google';

const ROMANIA_REGION = {
  latitude: 45.9432,
  longitude: 24.9668,
  latitudeDelta: 7,
  longitudeDelta: 7,
};

const apiKeyConfigured =
  !!GOOGLE_CONFIG.mapsApiKey && !GOOGLE_CONFIG.mapsApiKey.includes('YOUR_');

export default function MapScreen({ navigation }) {
  const { deliveries, loading: deliveriesLoading } = useDeliveries();
  const [markers, setMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const buildMarkers = useCallback(async () => {
    if (!deliveries.length) return;
    setGeocoding(true);
    setProgress({ done: 0, total: deliveries.length });
    const result = [];
    for (let i = 0; i < deliveries.length; i++) {
      const coords = await geocodeDelivery(deliveries[i]);
      if (coords) result.push({ ...deliveries[i], coords });
      setProgress({ done: i + 1, total: deliveries.length });
      if (i < deliveries.length - 1) {
        await new Promise(r => setTimeout(r, 50));
      }
    }
    setMarkers(result);
    setGeocoding(false);
  }, [deliveries]);

  useEffect(() => {
    buildMarkers();
  }, [buildMarkers]);

  if (deliveriesLoading && !deliveries.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C0001A" />
        <Text style={styles.loadingText}>Szállítások betöltése...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={ROMANIA_REGION}
        showsUserLocation
      >
        {markers.map((delivery) => {
          const cfg = getStatusConfig(delivery.status);
          return (
            <Marker
              key={delivery.id}
              coordinate={delivery.coords}
              tracksViewChanges={false}
            >
              {/* Custom colored circle pin – no TouchableOpacity wrapper */}
              <View style={[styles.pin, { backgroundColor: cfg.color }]}>
                <Ionicons name="location-sharp" size={13} color={cfg.textColor} />
              </View>

              <Callout
                tooltip
                onPress={() => navigation.navigate('DeliveryDetail', { delivery })}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutDoc} numberOfLines={1}>
                    {delivery.document || delivery.id}
                  </Text>
                  <Text style={styles.calloutAddr} numberOfLines={2}>
                    {[delivery.adresa, delivery.localitate].filter(Boolean).join(', ')}
                  </Text>
                  <View style={[styles.calloutBadge, { backgroundColor: cfg.color }]}>
                    <Text style={[styles.calloutBadgeText, { color: cfg.textColor }]}>
                      {cfg.label}
                    </Text>
                  </View>
                  <Text style={styles.calloutHint}>Koppints a részletekért →</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Geocoding progress */}
      {geocoding && (
        <View style={styles.geocodingBar}>
          <ActivityIndicator size="small" color="#FFF" />
          <Text style={styles.geocodingText}>
            Helymeghatározás: {progress.done}/{progress.total}
          </Text>
        </View>
      )}

      {/* Stats bar */}
      {!geocoding && markers.length > 0 && (
        <View style={styles.statsBar}>
          <Ionicons name="location" size={14} color="#C0001A" />
          <Text style={styles.statsText}>{markers.length} szállítás</Text>
          {markers.length < deliveries.length && (
            <Text style={styles.statsSkipped}>
              {' '}· {deliveries.length - markers.length} cím nem azonosítható
            </Text>
          )}
        </View>
      )}

      {/* No results overlay */}
      {!geocoding && markers.length === 0 && deliveries.length > 0 && (
        <View style={styles.noResultCard}>
          <Ionicons
            name={apiKeyConfigured ? 'warning-outline' : 'key-outline'}
            size={36}
            color="#CCC"
          />
          <Text style={styles.noResultTitle}>
            {apiKeyConfigured ? 'Nincs megjeleníthető cím' : 'Maps API kulcs szükséges'}
          </Text>
          <Text style={styles.noResultBody}>
            {apiKeyConfigured
              ? 'A szállítások helyszíneit nem sikerült meghatározni.\nEllenőrizd az internetkapcsolatot.'
              : 'Add meg a Google Maps API kulcsot a\nconfig/google.js → mapsApiKey mezőben.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: { marginTop: 12, color: '#888', fontSize: 15 },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 5,
  },
  callout: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    minWidth: 190,
    maxWidth: 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  calloutDoc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  calloutAddr: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 7,
  },
  calloutBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  calloutBadgeText: { fontSize: 11, fontWeight: '600' },
  calloutHint: { fontSize: 11, color: '#C0001A', fontWeight: '600' },
  geocodingBar: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(26,26,26,0.85)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  geocodingText: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  statsBar: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  statsText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  statsSkipped: { fontSize: 12, color: '#999' },
  noResultCard: {
    position: 'absolute',
    top: '28%',
    left: 28,
    right: 28,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  noResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 14,
    textAlign: 'center',
  },
  noResultBody: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
