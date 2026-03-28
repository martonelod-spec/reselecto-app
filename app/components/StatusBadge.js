import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getStatusConfig } from '../config/statusConfig';

export default function StatusBadge({ status, onPress, size = 'normal' }) {
  const config = getStatusConfig(status);
  const isSmall = size === 'small';

  const badge = (
    <Text
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        { backgroundColor: config.color, color: config.textColor },
      ]}
      numberOfLines={1}
    >
      {config.label}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {badge}
      </TouchableOpacity>
    );
  }
  return badge;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
