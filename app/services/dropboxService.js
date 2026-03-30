// ============================================================
// Dropbox API szolgáltatás
// ============================================================
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { DROPBOX_CONFIG } from '../config/dropbox';

const headers = () => ({
  Authorization: `Bearer ${DROPBOX_CONFIG.accessToken}`,
  'Content-Type': 'application/json',
});

// --- Képek listázása egy szállítás mappájából ---

export async function listDeliveryImages(deliveryId) {
  const folderPath = `${DROPBOX_CONFIG.rootFolder}/${deliveryId}`;

  try {
    const response = await axios.post(
      `${DROPBOX_CONFIG.apiUrl}/files/list_folder`,
      { path: folderPath, include_media_info: true },
      { headers: headers() }
    );

    const files = response.data.entries || [];
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
    );

    // Temporary link lekérése minden képhez
    const links = await Promise.all(
      imageFiles.map((file) => getTemporaryLink(file.path_lower))
    );

    return imageFiles.map((file, i) => ({
      name: file.name,
      path: file.path_lower,
      url: links[i],
      size: file.size,
    }));
  } catch (err) {
    if (err.response?.status === 409) {
      // Mappa nem létezik – visszaadjuk üres tömböt
      return [];
    }
    throw err;
  }
}

// --- Ideiglenes letöltési link lekérése ---

export async function getTemporaryLink(filePath) {
  const response = await axios.post(
    `${DROPBOX_CONFIG.apiUrl}/files/get_temporary_link`,
    { path: filePath },
    { headers: headers() }
  );
  return response.data.link;
}

// --- Fájl feltöltése URI-ból (kép vagy aláírás) ---

export async function uploadFile(localUri, deliveryId, fileName) {
  const folderPath = `${DROPBOX_CONFIG.rootFolder}/${deliveryId}`;
  const dropboxPath = `${folderPath}/${fileName}`;

  // Fájl beolvasása base64-ben
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Base64 → binary
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const response = await axios.post(
    `${DROPBOX_CONFIG.contentUrl}/files/upload`,
    bytes.buffer,
    {
      headers: {
        Authorization: `Bearer ${DROPBOX_CONFIG.accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxPath,
          mode: 'overwrite',
          autorename: true,
          mute: false,
        }),
      },
    }
  );

  return response.data;
}

// --- Aláírás feltöltése (base64 PNG string-ből) ---

export async function uploadSignatureBase64(base64Data, deliveryId) {
  const folderPath = `${DROPBOX_CONFIG.rootFolder}/${deliveryId}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `alairas_${timestamp}.png`;
  const dropboxPath = `${folderPath}/${fileName}`;

  // Eltávolítjuk a data URL prefixet, ha van
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  const binaryStr = atob(cleanBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const response = await axios.post(
    `${DROPBOX_CONFIG.contentUrl}/files/upload`,
    bytes.buffer,
    {
      headers: {
        Authorization: `Bearer ${DROPBOX_CONFIG.accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxPath,
          mode: 'overwrite',
          autorename: false,
          mute: false,
        }),
      },
    }
  );

  // Visszaadunk egy temporary linket az előnézethez
  const link = await getTemporaryLink(response.data.path_lower);
  return { name: fileName, path: response.data.path_lower, url: link };
}

// --- Fénykép feltöltése (expo-camera URI-ból) ---

export async function uploadPhoto(photoUri, deliveryId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `foto_${timestamp}.jpg`;
  return uploadFile(photoUri, deliveryId, fileName);
}
