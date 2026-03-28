import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { STATUS_OPTIONS } from '../config/statusConfig';

export default function StatusPicker({ visible, currentStatus, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Státusz kiválasztása</Text>
          <FlatList
            data={STATUS_OPTIONS}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => {
              const isSelected = item.label === currentStatus;
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => onSelect(item.label)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#1A1A1A" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Mégse</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemSelected: { backgroundColor: '#F9F9F9' },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  itemText: { flex: 1, fontSize: 15, color: '#333' },
  itemTextSelected: { fontWeight: '700', color: '#1A1A1A' },
  cancelBtn: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#444' },
});
