import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { uploadSignatureBase64 } from '../services/dropboxService';

export default function SignatureScreen({ route, navigation }) {
  const { delivery, onSignatureSaved } = route.params;
  const signatureRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const handleOK = async (signature) => {
    if (!signature || saving) return;
    setSaving(true);
    try {
      await uploadSignatureBase64(signature, delivery.id);
      Toast.show({
        type: 'success',
        text1: 'Aláírás mentve!',
        text2: `Feltöltve: /Szallitas/${delivery.id}/`,
        position: 'bottom',
      });
      if (onSignatureSaved) onSignatureSaved();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hiba', 'Nem sikerült feltölteni az aláírást. Próbáld újra!');
    } finally {
      setSaving(false);
    }
  };

  const handleEmpty = () => {
    Alert.alert('Figyelmeztetés', 'Kérjük, először írja alá!');
  };

  const webStyle = `
    .m-signature-pad {
      font-size: 0px;
      box-shadow: none;
      border: none;
      background-color: #fff;
    }
    .m-signature-pad--body { border: none; }
    .m-signature-pad--footer { display: none; }
    body, html { margin: 0; padding: 0; height: 100%; background: #fff; }
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aláírás</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="document-text-outline" size={16} color="#888" />
        <Text style={styles.infoText}>
          {delivery.document || delivery.id} • {delivery.adresa}, {delivery.localitate}
        </Text>
      </View>

      <View style={styles.canvasContainer}>
        <Text style={styles.canvasLabel}>Ügyfél aláírása:</Text>
        <View style={styles.canvas}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK}
            onEmpty={handleEmpty}
            onBegin={() => setHasSignature(true)}
            descriptionText=""
            clearText="Törlés"
            confirmText="Mentés"
            webStyle={webStyle}
            autoClear={false}
            imageType="image/png"
          />
        </View>
        <Text style={styles.canvasHint}>
          <Ionicons name="information-circle-outline" size={12} color="#AAAAAA" /> Kérje az ügyfelet, hogy írja alá a fenti mezőben
        </Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => { signatureRef.current?.clearSignature(); setHasSignature(false); }}
        >
          <Ionicons name="trash-outline" size={18} color="#C0001A" />
          <Text style={styles.clearBtnText}>Törlés</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, (!hasSignature || saving) && styles.saveBtnDisabled]}
          onPress={() => signatureRef.current?.readSignature()}
          disabled={!hasSignature || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Mentés & Feltöltés</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: { fontSize: 13, color: '#555', flex: 1 },
  canvasContainer: { flex: 1, marginHorizontal: 12 },
  canvasLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  canvas: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  canvasHint: { fontSize: 11, color: '#AAAAAA', marginTop: 6, textAlign: 'center' },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C0001A',
  },
  clearBtnText: { color: '#C0001A', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A7A40',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnDisabled: { backgroundColor: '#AAAAAA' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
