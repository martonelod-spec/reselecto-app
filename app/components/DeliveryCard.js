import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import CallStatusIcon from './CallStatusIcon';

export default function DeliveryCard({ delivery, callLog, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.docContainer}>
          <Ionicons name="document-text-outline" size={16} color="#C0001A" />
          <Text style={styles.docNumber} numberOfLines={1}>
            {delivery.document || '—'}
          </Text>
        </View>
        <StatusBadge status={delivery.status} size="small" />
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color="#888" />
        <Text style={styles.address} numberOfLines={2}>
          {[delivery.adresa, delivery.localitate, delivery.judet]
            .filter(Boolean)
            .join(', ')}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="car-outline" size={13} color="#888" />
          <Text style={styles.footerText}>{delivery.nrVehicul || '—'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={13} color="#888" />
          <Text style={styles.footerText}>{delivery.date || '—'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="pricetag-outline" size={13} color="#888" />
          <Text style={styles.footerText}>{delivery.id || '—'}</Text>
        </View>
        {callLog?.latestOutcome ? (
          <View style={styles.footerItem}>
            <CallStatusIcon outcome={callLog.latestOutcome} size={13} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  docNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    color: '#444',
    marginLeft: 4,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginTop: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 3,
  },
});
