import React, { useState, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text,
  StyleSheet, Modal, FlatList, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STATUS_OPTIONS } from '../config/statusConfig';

export default function FilterBar({ deliveries, filters, onFilterChange }) {
  const [openPicker, setOpenPicker] = useState(null); // 'judet' | 'localitate' | 'status' | 'zona'

  const judete = useMemo(
    () => [...new Set(deliveries.map((d) => d.judet).filter(Boolean))].sort(),
    [deliveries]
  );
  const localitati = useMemo(
    () => [...new Set(deliveries.map((d) => d.localitate).filter(Boolean))].sort(),
    [deliveries]
  );
  const zonak = useMemo(
    () => [...new Set(deliveries.map((d) => d.zona).filter(Boolean))].sort(),
    [deliveries]
  );

  const activeCount = [filters.judet, filters.localitate, filters.status, filters.zona]
    .filter(Boolean).length;

  const FilterButton = ({ label, field, icon }) => {
    const hasValue = !!filters[field];
    return (
      <TouchableOpacity
        style={[styles.filterBtn, hasValue && styles.filterBtnActive]}
        onPress={() => setOpenPicker(field)}
      >
        <Ionicons name={icon} size={14} color={hasValue ? '#FFFFFF' : '#444'} />
        <Text style={[styles.filterBtnText, hasValue && styles.filterBtnTextActive]}>
          {filters[field] || label}
        </Text>
        <Ionicons name="chevron-down" size={12} color={hasValue ? '#FFFFFF' : '#888'} />
      </TouchableOpacity>
    );
  };

  const pickerTitle = (field) => {
    if (field === 'judet') return 'Megye';
    if (field === 'localitate') return 'Helység';
    if (field === 'zona') return 'Zóna';
    return 'Státusz';
  };

  const PickerModal = ({ field, items }) => (
    <Modal
      visible={openPicker === field}
      transparent
      animationType="slide"
      onRequestClose={() => setOpenPicker(null)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setOpenPicker(null)}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{pickerTitle(field)}</Text>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => { onFilterChange(field, null); setOpenPicker(null); }}
          >
            <Text style={[styles.modalItemText, { color: '#C0001A' }]}>– Összes –</Text>
            {!filters[field] && <Ionicons name="checkmark" size={18} color="#C0001A" />}
          </TouchableOpacity>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.label || item)}
            renderItem={({ item }) => {
              const val = item.label || item;
              const selected = filters[field] === val;
              return (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { onFilterChange(field, val); setOpenPicker(null); }}
                >
                  {item.color ? (
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  ) : null}
                  <Text style={[styles.modalItemText, selected && styles.modalItemSelected]}>
                    {val}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={18} color="#C0001A" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <FilterButton label="Megye"  field="judet"     icon="map-outline" />
        <FilterButton label="Helység" field="localitate" icon="location-outline" />
        <FilterButton label="Státusz" field="status"     icon="flag-outline" />
        <FilterButton label="Zóna"   field="zona"       icon="layers-outline" />
        {activeCount > 0 && (
          <TouchableOpacity
            style={styles.clearAll}
            onPress={() => {
              onFilterChange('judet', null);
              onFilterChange('localitate', null);
              onFilterChange('status', null);
              onFilterChange('zona', null);
            }}
          >
            <Ionicons name="close-circle" size={14} color="#C0001A" />
            <Text style={styles.clearAllText}>Törlés</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <PickerModal field="judet"     items={judete} />
      <PickerModal field="localitate" items={localitati} />
      <PickerModal field="status"    items={STATUS_OPTIONS} />
      <PickerModal field="zona"      items={zonak} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  scrollContent: { paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
  filterBtn: {
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
  filterBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  filterBtnText: { fontSize: 13, color: '#444' },
  filterBtnTextActive: { color: '#FFF', fontWeight: '600' },
  clearAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearAllText: { fontSize: 13, color: '#C0001A', fontWeight: '600' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalItemText: { flex: 1, fontSize: 15, color: '#333' },
  modalItemSelected: { fontWeight: '700', color: '#1A1A1A' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
});
