import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { uploadPhoto } from '../services/dropboxService';

export default function CameraScreen({ route, navigation }) {
  const { delivery, onPhotoTaken } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [uploading, setUploading] = useState(false);
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color="#C0001A" /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Ionicons name="camera-outline" size={60} color="#DDD" />
        <Text style={styles.permissionText}>
          A kamera használatához engedély szükséges.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Engedély megadása</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelLink}>
          <Text style={styles.cancelLinkText}>Vissza</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || uploading) return;
    setUploading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        skipProcessing: false,
      });

      await uploadPhoto(photo.uri, delivery.id);
      Toast.show({ type: 'success', text1: 'Fotó feltöltve!', text2: delivery.id, position: 'bottom' });

      if (onPhotoTaken) onPhotoTaken();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hiba', 'Nem sikerült feltölteni a fotót. Próbáld újra!');
    } finally {
      setUploading(false);
    }
  }, [cameraRef, delivery, uploading, onPhotoTaken]);

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Felső eszköztár */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
            <Ionicons name="close" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{delivery.document || delivery.id}</Text>
          <TouchableOpacity
            onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
            style={styles.topBtn}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              size={22}
              color={flash === 'on' ? '#FFD700' : '#FFF'}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Alsó vezérlők */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            style={styles.sideBtn}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Fénykép gomb */}
          <TouchableOpacity
            style={[styles.captureBtn, uploading && styles.captureBtnDisabled]}
            onPress={takePicture}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#C0001A" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <View style={styles.sideBtn} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'space-between' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBtn: { padding: 8, minWidth: 44, alignItems: 'center' },
  topTitle: { flex: 1, textAlign: 'center', color: '#FFF', fontSize: 15, fontWeight: '600' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideBtn: { width: 50, alignItems: 'center' },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnDisabled: { opacity: 0.6 },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  // Permission screen
  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 30,
  },
  permissionText: { color: '#FFF', fontSize: 16, textAlign: 'center', marginVertical: 20, lineHeight: 24 },
  permissionBtn: {
    backgroundColor: '#C0001A',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cancelLink: { marginTop: 16, padding: 10 },
  cancelLinkText: { color: '#888', fontSize: 15 },
});
