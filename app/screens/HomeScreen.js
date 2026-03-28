import React, { useState, useCallback, useMemo } from 'react';
import {
  View, FlatList, Text, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeliveries } from '../hooks/useDeliveries';
import { useCallLog } from '../hooks/useCallLog';
import DeliveryCard from '../components/DeliveryCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isToday(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const s = String(dateStr).trim();
  // ISO:   YYYY-MM-DD
  if (s.startsWith(`${y}-${m}-${d}`)) return true;
  // Dot:   DD.MM.YYYY
  if (s.startsWith(`${d}.${m}.${y}`)) return true;
  // Slash: DD/MM/YYYY
  if (s.startsWith(`${d}/${m}/${y}`)) return true;
  return false;
}

// ── Quick filter chip definitions ────────────────────────────────────────────

const QUICK_FILTERS = [
  { key: 'mai',            label: 'Mai lista',     icon: 'calendar-outline',      color: '#1A1A1A' },
  { key: 'Visszaigazolt',  label: 'Visszaigazolt', icon: 'checkmark-circle-outline', color: '#1A7A40' },
  { key: 'Nem elérhető',   label: 'Nem elérhető',  icon: 'close-circle-outline',  color: '#C0001A' },
  { key: 'Visszahívandó',  label: 'Visszahívandó', icon: 'time-outline',          color: '#E07B00' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryItem({ label, value, color }) {
  return (
    <View style={summaryStyles.item}>
      <Text style={[summaryStyles.value, { color }]}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },
});

function DailySummaryBar({ summary }) {
  return (
    <View style={styles.summaryBar}>
      <SummaryItem label="Mai"         value={summary.total}      color="#1A1A1A" />
      <View style={styles.summaryDivider} />
      <SummaryItem label="Visszaigazolt" value={summary.confirmed}  color="#1A7A40" />
      <View style={styles.summaryDivider} />
      <SummaryItem label="Nem elérhető"  value={summary.notReached} color="#C0001A" />
      <View style={styles.summaryDivider} />
      <SummaryItem label="Teljesítve"  value={summary.delivered}  color="#5DCAA5" />
    </View>
  );
}

function QuickFilterBar({ active, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.qfScroll}
      contentContainerStyle={styles.qfContent}
    >
      {QUICK_FILTERS.map(({ key, label, icon, color }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.qfChip, isActive && { backgroundColor: color, borderColor: color }]}
            onPress={() => onSelect(isActive ? null : key)}
          >
            <Ionicons name={icon} size={13} color={isActive ? '#FFF' : color} />
            <Text style={[styles.qfChipText, isActive && styles.qfChipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const { deliveries, loading, error, refresh } = useDeliveries();
  const { callLogs, loadCallLogs } = useCallLog();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    judet: null, localitate: null, status: null, zona: null,
  });
  const [quickFilter, setQuickFilter] = useState(null);
  const [role, setRole] = useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('user_role').then(setRole);
  }, []);

  // Reload call logs every time this tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadCallLogs();
    }, [loadCallLogs])
  );

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const dailySummary = useMemo(() => {
    const todayList = deliveries.filter((d) => isToday(d.date));
    return {
      total:      todayList.length,
      confirmed:  todayList.filter((d) => callLogs[d.id]?.latestOutcome === 'Visszaigazolt').length,
      notReached: todayList.filter((d) => callLogs[d.id]?.latestOutcome === 'Nem elérhető').length,
      delivered:  todayList.filter((d) => d.status === 'Teljesítve').length,
    };
  }, [deliveries, callLogs]);

  const filteredDeliveries = useMemo(() => {
    let result = deliveries;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((d) =>
        [d.id, d.document, d.localitate, d.judet, d.adresa, d.nrVehicul, d.alteInfo]
          .some((v) => v && v.toLowerCase().includes(q))
      );
    }
    if (filters.judet)     result = result.filter((d) => d.judet === filters.judet);
    if (filters.localitate) result = result.filter((d) => d.localitate === filters.localitate);
    if (filters.status)    result = result.filter((d) => d.status === filters.status);
    if (filters.zona)      result = result.filter((d) => d.zona === filters.zona);

    if (quickFilter === 'mai') {
      result = result.filter((d) => isToday(d.date));
    } else if (quickFilter) {
      result = result.filter((d) => callLogs[d.id]?.latestOutcome === quickFilter);
    }

    return result;
  }, [deliveries, search, filters, quickFilter, callLogs]);

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
      <DailySummaryBar summary={dailySummary} />
      <QuickFilterBar active={quickFilter} onSelect={setQuickFilter} />
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
      <Text style={styles.countLabel}>{filteredDeliveries.length} szállítás</Text>
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
            callLog={callLogs[item.id] || null}
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
  // Daily summary
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F0F0F0',
  },
  // Quick filters
  qfScroll: { flexGrow: 0 },
  qfContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  qfChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qfChipText: { fontSize: 13, color: '#444' },
  qfChipTextActive: { color: '#FFF', fontWeight: '600' },
  // List
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: { marginTop: 12, color: '#888', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#BBBBBB', fontSize: 16, marginTop: 10 },
});
