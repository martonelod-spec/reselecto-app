// ============================================================
// Google Sheets API konfiguráció
// ============================================================
// Töltsd ki ezeket az értékeket a saját service account
// hitelesítő adataival.
// A service account JSON-t a Google Cloud Console-ból töltheted le.
// ============================================================

export const GOOGLE_CONFIG = {
  // Service Account email cím
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'your-service-account@your-project.iam.gserviceaccount.com',

  // Service Account privát kulcs (a JSON fájlból)
  privateKey: process.env.GOOGLE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----',

  // Google Spreadsheet ID (az URL-ből: /spreadsheets/d/{SPREADSHEET_ID}/edit)
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',

  // Munkalap neve
  sheetName: process.env.GOOGLE_SHEET_NAME || 'Szallitasok',

  // Google Sheets API scope
  scope: 'https://www.googleapis.com/auth/spreadsheets',

  // Token URL
  tokenUrl: 'https://oauth2.googleapis.com/token',

  // Google Maps Platform API kulcs
  // Engedélyezd: "Maps SDK for Android/iOS" + "Geocoding API"
  // https://console.cloud.google.com/apis/credentials
  mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
};

// Oszlop megfeleltetések (A=0, B=1, ...)
export const SHEET_COLUMNS = {
  ID: 0,           // A – Egyedi azonosító (Dropbox mappa neve)
  STATUS: 1,       // B – Szállítás státusza
  DATE: 2,         // C – Dátum
  NR_VEHICUL: 3,   // D – Rendszám
  DOCUMENT: 4,     // E – Szállítólevél szám
  ZONA: 5,         // F – Zóna
  TR: 6,           // G – Tr
  ALTE_INFO: 7,    // H – Egyéb információk
  LOCALITATE: 8,   // I – Helység
  JUDET: 9,        // J – Megye
  ADRESA: 10,      // K – Cím
};
