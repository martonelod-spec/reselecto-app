import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ROLES = [
  {
    id: 'Sofőr',
    label: 'Sofőr',
    sublabel: 'Kiszállítás kezelése',
    icon: 'car-outline',
    description: 'Saját szállítások, fotó, aláírás, státusz módosítás',
  },
  {
    id: 'Iroda',
    label: 'Iroda',
    sublabel: 'Teljes hozzáférés',
    icon: 'business-outline',
    description: 'Összes szállítás megtekintése és szerkesztése',
  },
];

export default function LoginScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const handleLogin = async () => {
    if (!selected) return;
    await AsyncStorage.setItem('user_role', selected);
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={styles.container}>
        {/* Logo / Cím */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="cube-outline" size={48} color="#C0001A" />
          </View>
          <Text style={styles.appName}>ReSelecto</Text>
          <Text style={styles.appSubtitle}>Szállítás Kezelő</Text>
        </View>

        {/* Szerepkör választó */}
        <Text style={styles.chooseLabel}>Válassz szerepkört a belépéshez:</Text>

        <View style={styles.rolesContainer}>
          {ROLES.map((role) => {
            const isActive = selected === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleCard, isActive && styles.roleCardActive]}
                onPress={() => setSelected(role.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, isActive && styles.roleIconBoxActive]}>
                  <Ionicons
                    name={role.icon}
                    size={32}
                    color={isActive ? '#FFFFFF' : '#C0001A'}
                  />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleLabel, isActive && styles.roleLabelActive]}>
                    {role.label}
                  </Text>
                  <Text style={[styles.roleSublabel, isActive && styles.roleSublabelActive]}>
                    {role.sublabel}
                  </Text>
                  <Text style={[styles.roleDesc, isActive && styles.roleDescActive]}>
                    {role.description}
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={24} color="#C0001A" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Belépés gomb */}
        <TouchableOpacity
          style={[styles.loginBtn, !selected && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Ionicons name="log-in-outline" size={20} color="#FFF" />
          <Text style={styles.loginBtnText}>Belépés</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>ReSelecto © {new Date().getFullYear()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A1A1A' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#C0001A',
  },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  appSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  chooseLabel: { fontSize: 14, color: '#AAA', marginBottom: 14, textAlign: 'center' },
  rolesContainer: { gap: 12, marginBottom: 30 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 14,
  },
  roleCardActive: { borderColor: '#C0001A', backgroundColor: '#1E0000' },
  roleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconBoxActive: { backgroundColor: '#C0001A' },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  roleLabelActive: { color: '#FFF' },
  roleSublabel: { fontSize: 12, color: '#888', marginTop: 2, fontWeight: '600' },
  roleSublabelActive: { color: '#C0001A' },
  roleDesc: { fontSize: 12, color: '#666', marginTop: 4, lineHeight: 16 },
  roleDescActive: { color: '#AAAAAA' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C0001A',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  loginBtnDisabled: { backgroundColor: '#444' },
  loginBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footer: { textAlign: 'center', color: '#555', fontSize: 12, marginTop: 24 },
});
