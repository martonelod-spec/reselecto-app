import React, { useState } from 'react';
import {
  View, ScrollView, Image, TouchableOpacity, Text,
  Modal, Dimensions, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMB_SIZE = 80;

export default function ImageGallery({ images, loading }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#C0001A" />
        <Text style={styles.loadingText}>Képek betöltése...</Text>
      </View>
    );
  }

  if (!images || images.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={32} color="#CCCCCC" />
        <Text style={styles.emptyText}>Nincsenek képek</Text>
      </View>
    );
  }

  const openFullscreen = (index) => {
    setCurrentIndex(index);
    setFullscreenImage(images[index]);
  };

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((img, index) => (
          <TouchableOpacity
            key={img.path || index}
            onPress={() => openFullscreen(index)}
            style={styles.thumbContainer}
          >
            <Image
              source={{ uri: img.url }}
              style={styles.thumb}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Teljes képernyős megjelenítő */}
      <Modal
        visible={!!fullscreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
        statusBarTranslucent
      >
        <View style={styles.fullscreenOverlay}>
          {/* Bezárás gomb */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setFullscreenImage(null)}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Kép neve */}
          <Text style={styles.imageName} numberOfLines={1}>
            {fullscreenImage?.name}
          </Text>

          {/* Kép */}
          <Image
            source={{ uri: fullscreenImage?.url }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />

          {/* Előző / következő navigáció */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              disabled={currentIndex === 0}
              onPress={() => {
                const newIdx = currentIndex - 1;
                setCurrentIndex(newIdx);
                setFullscreenImage(images[newIdx]);
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navCounter}>
              {currentIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity
              style={[styles.navBtn, currentIndex === images.length - 1 && styles.navBtnDisabled]}
              disabled={currentIndex === images.length - 1}
              onPress={() => {
                const newIdx = currentIndex + 1;
                setCurrentIndex(newIdx);
                setFullscreenImage(images[newIdx]);
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flexDirection: 'row' },
  thumbContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: { marginLeft: 8, color: '#888', fontSize: 13 },
  empty: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: { color: '#BBBBBB', fontSize: 13, marginTop: 6 },
  // Fullscreen
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  imageName: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 60,
    color: '#CCC',
    fontSize: 13,
    zIndex: 10,
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  navRow: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  navBtn: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
  },
  navBtnDisabled: { opacity: 0.3 },
  navCounter: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
