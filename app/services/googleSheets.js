// ============================================================
// Google Sheets API szolgáltatás
// ============================================================
import axios from 'axios';
import { GOOGLE_CONFIG, SHEET_COLUMNS } from '../config/google';

// --- JWT / OAuth2 token generálás ---

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: GOOGLE_CONFIG.serviceAccountEmail,
    scope: GOOGLE_CONFIG.scope,
    aud: GOOGLE_CONFIG.tokenUrl,
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Sign with RSA-SHA256 using Web Crypto API (Expo/React Native compatible)
  const privateKeyPem = GOOGLE_CONFIG.privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');

  const binaryDer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
  const jwt = `${unsignedToken}.${signatureB64}`;

  const response = await axios.post(
    GOOGLE_CONFIG.tokenUrl,
    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
}

// --- Adatok lekérése ---

export async function fetchDeliveries() {
  const token = await getAccessToken();
  const range = `${GOOGLE_CONFIG.sheetName}!A2:K`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const rows = response.data.values || [];
  return rows.map((row) => rowToDelivery(row));
}

// --- Egy sor lekérése sorszám alapján ---

export async function fetchDeliveryByRowIndex(rowIndex) {
  const token = await getAccessToken();
  // rowIndex: 0-alapú, az adatok a 2. sortól kezdődnek (sor 2 = rowIndex 0)
  const sheetRow = rowIndex + 2;
  const range = `${GOOGLE_CONFIG.sheetName}!A${sheetRow}:K${sheetRow}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const rows = response.data.values || [];
  if (rows.length === 0) return null;
  return rowToDelivery(rows[0]);
}

// --- Státusz frissítése ---

export async function updateDeliveryStatus(rowIndex, newStatus) {
  const token = await getAccessToken();
  const sheetRow = rowIndex + 2;
  const range = `${GOOGLE_CONFIG.sheetName}!B${sheetRow}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;

  await axios.put(
    url,
    { values: [[newStatus]] },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// --- Megjegyzés (Alte informatii) frissítése ---

export async function updateDeliveryNotes(rowIndex, notes) {
  const token = await getAccessToken();
  const sheetRow = rowIndex + 2;
  const range = `${GOOGLE_CONFIG.sheetName}!H${sheetRow}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;

  await axios.put(
    url,
    { values: [[notes]] },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// --- Sor objektummá alakítása ---

function rowToDelivery(row) {
  return {
    id: row[SHEET_COLUMNS.ID] || '',
    status: row[SHEET_COLUMNS.STATUS] || '',
    date: row[SHEET_COLUMNS.DATE] || '',
    nrVehicul: row[SHEET_COLUMNS.NR_VEHICUL] || '',
    document: row[SHEET_COLUMNS.DOCUMENT] || '',
    zona: row[SHEET_COLUMNS.ZONA] || '',
    tr: row[SHEET_COLUMNS.TR] || '',
    alteInfo: row[SHEET_COLUMNS.ALTE_INFO] || '',
    localitate: row[SHEET_COLUMNS.LOCALITATE] || '',
    judet: row[SHEET_COLUMNS.JUDET] || '',
    adresa: row[SHEET_COLUMNS.ADRESA] || '',
  };
}

// --- Telefonszám kinyerése az alteInfo mezőből ---

export function extractPhoneNumber(alteInfo) {
  if (!alteInfo) return null;
  // Román és magyar telefonszám formátumok
  const match = alteInfo.match(
    /(\+?(?:40|36)?[\s.-]?(?:07\d|0[2-9]\d|\d{2,3})[\s.-]?\d{3}[\s.-]?\d{3,4})/
  );
  return match ? match[0].replace(/[\s.-]/g, '') : null;
}
