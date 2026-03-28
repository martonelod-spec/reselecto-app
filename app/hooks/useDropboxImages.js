// ============================================================
// useDropboxImages hook – Dropbox képek kezelése
// ============================================================
import { useState, useCallback } from 'react';
import { listDeliveryImages, uploadSignatureBase64, uploadPhoto as uploadPhotoService } from '../services/dropboxService';

export function useDropboxImages(deliveryId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadImages = useCallback(async () => {
    if (!deliveryId) return;
    setLoading(true);
    setError(null);
    try {
      const imgs = await listDeliveryImages(deliveryId);
      setImages(imgs);
    } catch (err) {
      setError('Nem sikerült betölteni a képeket.');
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  const uploadPhoto = useCallback(async (photoUri) => {
    setLoading(true);
    try {
      const result = await uploadPhotoService(photoUri, deliveryId);
      // Frissítjük a listát
      await loadImages();
      return result;
    } catch (err) {
      setError('Nem sikerült feltölteni a fotót.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deliveryId, loadImages]);

  const uploadSignature = useCallback(async (base64Data) => {
    setLoading(true);
    try {
      const result = await uploadSignatureBase64(base64Data, deliveryId);
      setImages((prev) => [...prev, result]);
      return result;
    } catch (err) {
      setError('Nem sikerült feltölteni az aláírást.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  return { images, loading, error, loadImages, uploadPhoto, uploadSignature };
}
