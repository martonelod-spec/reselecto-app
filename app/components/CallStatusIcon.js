import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OUTCOME_CONFIG = {
  'Visszaigazolt': { overlay: 'checkmark', color: '#1A7A40' },
  'Nem elérhető':  { overlay: 'close',     color: '#C0001A' },
  'Visszahívandó': { overlay: 'time',      color: '#E07B00' },
};

export default function CallStatusIcon({ outcome, size = 16 }) {
  if (!outcome) return null;
  const cfg = OUTCOME_CONFIG[outcome];
  if (!cfg) return null;

  const badgeSize = Math.round(size * 0.72);

  return (
    <View style={{ width: size + Math.round(badgeSize * 0.7), height: size + 2 }}>
      <Ionicons name="call" size={size} color={cfg.color} />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: badgeSize + 2,
          height: badgeSize + 2,
          borderRadius: badgeSize,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 0.5,
          borderColor: cfg.color,
        }}
      >
        <Ionicons name={cfg.overlay} size={badgeSize - 1} color={cfg.color} />
      </View>
    </View>
  );
}
