import React, { useState, useCallback, useMemo } from 'react';
import {
  View, FlatList, Text, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeliveries } from '../hooks/useDeliveries';
import DeliveryCard from '../components/DeliveryCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

export default function HomeScreen({ navigation }) {
  const { deliveries, loading, error, refresh } = useDeliveries();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ judet: null, localitate: null, status: null });
  const [role, setRole] = useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('user_role').then(setRole);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const filteredDeliveries = useMemo(() => {
    let result = deliveries;

    // Kereső szűrő
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((d) =>
        [d.id, d.document, d.localitate, d.judet, d.adresa, d.nrVehicul, d.alteInfo]
          .some((v) => v && v.toLowerCase().includes(q))
      );
    }

    // Megye szűrő
    if (filters.judet) {
      result = result.filter((d) => d.judet === filters.judet);
    }
    // Helység szűrő
    if (filters.localitate) {
      result = result.filter((d) => d.localitate === filters.localitate);
    }
    // Státusz szűrő
    if (filters.status) {
      result = result.filter((d) => d.status === filters.status);
    }

    return result;
  }, [deliveries, search, filters]);

  const handleLogout = () => {
    AsyncStorage.removeItem('user_role');
    navigation.replace('Login');
  };

  const renderHeader = () => (
    <View>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
        placeholder="Keresés: ID, dokumentum, helység, cím..."
      />
      <FilterBar
        deliveries={deliveries}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color="#C0001A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <Text style={styles.countLabel}>
        {filteredDeliveries.length} szállítás
      </Text>
    </View>
  );

  if (loading && deliveries.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C0001A" />
        <Text style={styles.loadingText}>Adatok betöltése...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ReSelecto</Text>
          <Text style={styles.headerSub}>
            {role === 'Sofőr' ? 'Sofőr nézet' : 'Iroda nézet'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDeliveries}
        keyExtractor={(item) => `${item.id}-${item.rowIndex}`}
        renderItem={({ item }) => (
          <DeliveryCard
            delivery={item}
            onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>Nincs találat</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => refresh(true)}
            colors={['#C0001A']}
            tintColor="#C0001A"
          />
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: '#C0001A', fontWeight: '600', marginTop: 2 },
  logoutBtn: { padding: 6 },
  list: { paddingBottom: 20 },
  countLabel: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#C0001A',
    margin: 12,
    padding: 10,
    borderRadius: 6,
    gap: 8,
  },
  errorText: { color: '#C0001A', fontSize: 13, flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#BBBBBB', fontSize: 16, marginTop: 10 },
});
