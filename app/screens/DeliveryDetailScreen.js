import React, { useState, useEffect, useCallback } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Linking, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDropboxImages } from '../hooks/useDropboxImages';
import { updateDeliveryStatus, updateDeliveryNotes, extractPhoneNumber } from '../services/googleSheets';
import StatusBadge from '../components/StatusBadge';
import StatusPicker from '../components/StatusPicker';
import ImageGallery from '../components/ImageGallery';
import { SMS_CONFIG } from '../config/sms';

export default function DeliveryDetailScreen({ route, navigation }) {
  const { delivery: initialDelivery } = route.params;
  const [delivery, setDelivery] = useState(initialDelivery);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [notes, setNotes] = useState(initialDelivery.alteInfo || '');
  const [notesChanged, setNotesChanged] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [callMade, setCallMade] = useState(false);

  const { images, loading: imagesLoading, loadImages } = useDropboxImages(delivery.id);

  const phoneNumber = extractPhoneNumber(delivery.alteInfo);

  useEffect(() => {
    loadImages();
  }, []);

  const handleStatusSelect = useCallback(async (newStatus) => {
    setStatusPickerVisible(false);
    if (newStatus === delivery.status) return;

    setSavingStatus(true);
    try {
      await updateDeliveryStatus(delivery.rowIndex, newStatus);
      setDelivery((prev) => ({ ...prev, status: newStatus }));
      Toast.show({ type: 'success', text1: 'Státusz frissítve', text2: newStatus, position: 'bottom' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Hiba', text2: 'Nem sikerült frissíteni a státuszt.', position: 'bottom' });
    } finally {
      setSavingStatus(false);
    }
  }, [delivery]);

  const handleSaveNotes = useCallback(async () => {
    setSavingNotes(true);
    try {
      await updateDeliveryNotes(delivery.rowIndex, notes);
      setDelivery((prev) => ({ ...prev, alteInfo: notes }));
      setNotesChanged(false);
      Toast.show({ type: 'success', text1: 'Megjegyzés mentve', position: 'bottom' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Hiba', text2: 'Nem sikerült menteni.', position: 'bottom' });
    } finally {
      setSavingNotes(false);
    }
  }, [notes, delivery.rowIndex]);

  const handleCall = useCallback(() => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
    setCallMade(true);
  }, [phoneNumber]);

  const handleSMS = useCallback(() => {
    if (!phoneNumber) return;
    const msg = encodeURIComponent(SMS_CONFIG.defaultMessage);
    Linking.openURL(`sms:${phoneNumber}?body=${msg}`);
  }, [phoneNumber]);

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color="#C0001A" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>{value || '—'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {delivery.document || delivery.id}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Státusz kártya */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Jelenlegi státusz:</Text>
            {savingStatus ? (
              <ActivityIndicator size="small" color="#C0001A" />
            ) : (
              <StatusBadge
                status={delivery.status}
                onPress={() => setStatusPickerVisible(true)}
              />
            )}
          </View>
          <Text style={styles.statusHint}>
            <Ionicons name="information-circle-outline" size={12} color="#888" /> Koppints a státuszra a módosításhoz
          </Text>
        </View>

        {/* Alapadatok */}
        <Section title="Alapadatok">
          <InfoRow icon="pricetag-outline" label="ID" value={delivery.id} />
          <InfoRow icon="document-text-outline" label="Szállítólevél" value={delivery.document} />
          <InfoRow icon="calendar-outline" label="Dátum" value={delivery.date} />
          <InfoRow icon="car-outline" label="Rendszám" value={delivery.nrVehicul} />
          <InfoRow icon="layers-outline" label="Zóna" value={delivery.zona} />
          <InfoRow icon="swap-horizontal-outline" label="Tr" value={delivery.tr} />
        </Section>

        {/* Cím */}
        <Section title="Cím">
          <InfoRow icon="location-outline" label="Helység" value={delivery.localitate} />
          <InfoRow icon="map-outline" label="Megye" value={delivery.judet} />
          <InfoRow icon="home-outline" label="Cím" value={delivery.adresa} />
        </Section>

        {/* Hívás & SMS */}
        {phoneNumber ? (
          <Section title="Kapcsolat">
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={16} color="#444" />
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={18} color="#FFF" />
                <Text style={styles.callBtnText}>Hívás</Text>
              </TouchableOpacity>
              {callMade && (
                <TouchableOpacity style={styles.smsBtn} onPress={handleSMS}>
                  <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                  <Text style={styles.smsBtnText}>SMS küldése</Text>
                </TouchableOpacity>
              )}
            </View>
          </Section>
        ) : null}

        {/* Megjegyzés */}
        <Section title="Megjegyzés (Alte informatii)">
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={(t) => { setNotes(t); setNotesChanged(true); }}
            multiline
            numberOfLines={4}
            placeholder="Ide írj megjegyzést..."
            placeholderTextColor="#BBBBBB"
          />
          {notesChanged && (
            <TouchableOpacity
              style={styles.saveNotesBtn}
              onPress={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="#FFF" />
                  <Text style={styles.saveNotesBtnText}>Mentés</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Section>

        {/* Képek */}
        <Section title="Képek">
          <ImageGallery images={images} loading={imagesLoading} />
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={styles.mediaBtn}
              onPress={() => navigation.navigate('Camera', { delivery, onPhotoTaken: loadImages })}
            >
              <Ionicons name="camera-outline" size={18} color="#FFF" />
              <Text style={styles.mediaBtnText}>Fotó készítése</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mediaBtn, styles.signatureBtn]}
              onPress={() => navigation.navigate('Signature', { delivery, onSignatureSaved: loadImages })}
            >
              <Ionicons name="pencil-outline" size={18} color="#FFF" />
              <Text style={styles.mediaBtnText}>Aláírás</Text>
            </TouchableOpacity>
          </View>
        </Section>

      </ScrollView>

      <StatusPicker
        visible={statusPickerVisible}
        currentStatus={delivery.status}
        onSelect={handleStatusSelect}
        onClose={() => setStatusPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backBtn: { padding: 6, width: 38 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#FFF', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  statusCard: {
    backgroundColor: '#FFF',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  statusHint: { fontSize: 11, color: '#AAAAAA', marginTop: 6 },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C0001A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoIcon: { marginTop: 1, width: 22 },
  infoLabel: { fontSize: 13, color: '#888', width: 100 },
  infoValue: { flex: 1, fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  phoneNumber: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  actionBtns: { flexDirection: 'row', gap: 10 },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A7A40',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  callBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  smsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#185FA5',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  smsBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  saveNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C0001A',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  saveNotesBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  mediaButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  signatureBtn: { backgroundColor: '#185FA5' },
  mediaBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
